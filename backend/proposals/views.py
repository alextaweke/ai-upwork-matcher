from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count, Q
from .models import Proposal, ProposalTemplate
from .serializers import (
    ProposalSerializer,
    ProposalDetailSerializer,
    ProposalGenerateSerializer,
    ProposalTemplateSerializer,
    ProposalStatsSerializer,
)
from jobs.models import Job


class ProposalViewSet(viewsets.ModelViewSet):
    """ViewSet for Proposal operations"""

    queryset = Proposal.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Proposal.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProposalDetailSerializer
        return ProposalSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Generate a new proposal using AI"""
        serializer = ProposalGenerateSerializer(data=request.data)
        if serializer.is_valid():
            job_id = serializer.validated_data["job_id"]
            custom_instructions = serializer.validated_data.get(
                "custom_instructions", ""
            )

            try:
                job = Job.objects.get(id=job_id)

                # This will call your AI service
                # For now, create a placeholder
                proposal_text = f"Hi, I'm interested in {job.title}. I have experience with {', '.join(job.skills[:3])}. Let's chat!"

                if custom_instructions:
                    proposal_text += f"\n\n{custom_instructions}"

                proposal = Proposal.objects.create(
                    job=job,
                    user=request.user,
                    content=proposal_text,
                    custom_instructions=custom_instructions,
                    status="draft",
                )

                # Update user stats
                request.user.profile.total_proposals += 1
                request.user.profile.save()

                return Response(
                    ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED
                )

            except Job.DoesNotExist:
                return Response(
                    {"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def mark_sent(self, request, pk=None):
        """Mark proposal as sent"""
        proposal = self.get_object()
        proposal.status = "sent"
        proposal.sent_at = timezone.now()
        proposal.save()

        # Update job status
        proposal.job.status = "applied"
        proposal.job.save()

        return Response({"status": "marked as sent"})

    @action(detail=True, methods=["post"])
    def mark_accepted(self, request, pk=None):
        """Mark proposal as accepted"""
        proposal = self.get_object()
        proposal.status = "accepted"
        proposal.responded_at = timezone.now()
        proposal.save()

        # Calculate acceptance rate
        user_proposals = Proposal.objects.filter(user=request.user)
        sent_count = user_proposals.filter(status="sent").count()
        accepted_count = user_proposals.filter(status="accepted").count()

        if sent_count > 0:
            request.user.profile.acceptance_rate = (accepted_count / sent_count) * 100
            request.user.profile.save()

        return Response({"status": "marked as accepted"})

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get proposal statistics"""
        proposals = self.get_queryset()

        sent_count = proposals.filter(status="sent").count()
        accepted_count = proposals.filter(status="accepted").count()

        stats = {
            "total": proposals.count(),
            "sent": sent_count,
            "accepted": accepted_count,
            "rejected": proposals.filter(status="rejected").count(),
            "acceptance_rate": (
                (accepted_count / sent_count * 100) if sent_count > 0 else 0
            ),
            "avg_response_time": 0,  # Calculate if you have response tracking
        }

        serializer = ProposalStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def templates(self, request):
        """Get proposal templates"""
        templates = ProposalTemplate.objects.filter(is_active=True)
        serializer = ProposalTemplateSerializer(templates, many=True)
        return Response(serializer.data)


class ProposalTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for Proposal templates"""

    permission_classes = [IsAuthenticated]
    queryset = ProposalTemplate.objects.all()
    serializer_class = ProposalTemplateSerializer
