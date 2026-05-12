from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job, ScanHistory
from proposals.models import Proposal
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import json
from django.core.cache import cache
import uuid


class DashboardStatsView(APIView):
    """Get all dashboard statistics in one endpoint"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get ALL jobs from database (not just new ones)
        all_jobs = Job.objects.all()
        total_jobs = all_jobs.count()

        # High matches (score >= 70)
        high_matches = all_jobs.filter(match_score__gte=70).count()

        # New jobs today
        today = timezone.now().date()
        new_jobs_today = all_jobs.filter(posted_at__date=today).count()

        # Average match score
        avg_match_score = (
            all_jobs.aggregate(Avg("match_score"))["match_score__avg"] or 0
        )

        # Proposal stats for this user
        user_proposals = Proposal.objects.filter(user=user)
        proposals_sent = user_proposals.filter(status="sent").count()
        proposals_accepted = user_proposals.filter(status="accepted").count()

        # Acceptance rate
        acceptance_rate = 0
        if proposals_sent > 0:
            acceptance_rate = round((proposals_accepted / proposals_sent) * 100, 1)

        # API usage from user profile
        api_calls_today = 0
        credits_remaining = 14400
        if hasattr(user, "profile"):
            api_calls_today = user.profile.api_calls_today
            credits_remaining = user.profile.get_remaining_credits()

        # Recent activity (last 5 proposals)
        recent_proposals = user_proposals.order_by("-generated_at")[:5]
        recent_activity = []
        for p in recent_proposals:
            recent_activity.append(
                {
                    "id": p.id,
                    "job_title": p.job.title if p.job else "Unknown Job",
                    "match_score": p.job.match_score if p.job else 0,
                    "generated_at": p.generated_at.isoformat(),
                    "status": p.status,
                }
            )

        # If no proposals, show recent jobs
        if not recent_activity:
            recent_jobs = all_jobs.order_by("-posted_at")[:5]
            for j in recent_jobs:
                recent_activity.append(
                    {
                        "id": j.id,
                        "job_title": j.title,
                        "match_score": j.match_score,
                        "generated_at": j.posted_at.isoformat(),
                        "status": "new_job",
                    }
                )

        return Response(
            {
                "jobs": {
                    "total": total_jobs,
                    "high_matches": high_matches,
                    "new_today": new_jobs_today,
                    "avg_match_score": round(avg_match_score, 1),
                },
                "proposals": {
                    "sent": proposals_sent,
                    "accepted": proposals_accepted,
                    "acceptance_rate": acceptance_rate,
                },
                "api_usage": {
                    "calls_today": api_calls_today,
                    "credits_remaining": credits_remaining,
                    "daily_limit": 14400,
                },
                "recent_activity": recent_activity,
            }
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sync_jobs(request):
    """Trigger job sync (placeholder - connect to your scraper)"""
    # This would call your job scraping service
    return Response({"message": "Job sync triggered", "status": "pending"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stream_proposal(request):
    """
    Stream proposal generation and save to database
    """
    job_id = request.query_params.get("job_id")

    if not job_id:
        return StreamingHttpResponse(
            "Error: job_id required", status=400, content_type="text/plain"
        )

    try:
        from jobs.models import Job
        from proposals.models import Proposal
        from api.services.groq_service import groq_service

        job = Job.objects.get(id=job_id)
        user = request.user

        # Create a unique session ID for this streaming session
        session_id = str(uuid.uuid4())

        def generate_and_save():
            """Generate proposal, stream it, and save to database"""
            collected_text = []

            try:
                # Get user skills
                user_skills = []
                if hasattr(user, "profile") and user.profile.skills:
                    user_skills = user.profile.skills

                # Generate streaming proposal using Groq
                from groq import Groq
                from django.conf import settings

                client = Groq(api_key=settings.GROQ_API_KEY)

                prompt = f"""
                Write a professional Upwork proposal for this job.
                
                Title: {job.title}
                Description: {job.description[:1500]}
                
                Your skills: {', '.join(user_skills) if user_skills else 'AI/API integration, Python'}
                
                Requirements:
                - 4-5 sentences
                - Personalized to the job
                - Include a call to action
                
                Write ONLY the proposal text:
                """

                stream = client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert Upwork proposal writer.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7,
                    max_tokens=500,
                    stream=True,
                )

                # Stream and collect
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        collected_text.append(content)
                        yield content

                # Save to database after streaming completes
                full_proposal = "".join(collected_text)

                proposal = Proposal.objects.create(
                    job=job,
                    user=user,
                    content=full_proposal,
                    ai_model=settings.GROQ_MODEL,
                    status="draft",
                )

                # Update user stats
                if hasattr(user, "profile"):
                    user.profile.total_proposals += 1
                    user.profile.save()

                # Store proposal ID in cache for reference
                cache.set(f"proposal_{session_id}", proposal.id, timeout=3600)

            except Exception as e:
                yield f"\n\nError: {str(e)}"

        response = StreamingHttpResponse(generate_and_save(), content_type="text/plain")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response

    except Job.DoesNotExist:
        return StreamingHttpResponse(
            "Error: Job not found", status=404, content_type="text/plain"
        )
