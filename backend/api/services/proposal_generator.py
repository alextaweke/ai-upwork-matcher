# api/services/proposal_generator.py
from .groq_service import groq_service
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ProposalGenerator:
    def __init__(self):
        self.templates = {
            "ai_integration": """
Hi [Client Name],

I saw you need help with [Project Goal]. With my experience in AI API integration, I've built similar systems that [specific benefit].

I can deliver:
• [Feature 1]
• [Feature 2]

Here's a similar project I completed: [Link]

Available for a quick chat to discuss your requirements.

Best,
[Your Name]
""",
            "automation": """
Hello,

I specialize in building automated workflows using AI. Your project to [project goal] is exactly what I've done for [past client].

My approach would be:
1. [Step 1]
2. [Step 2]

Would you be available for a 10-minute call to discuss?

Thanks,
[Your Name]
""",
        }

    def generate_proposal(
        self, job_id: int, user_id: int, custom_instructions: str = None
    ):
        """
        Generate and save a proposal for a job using Groq
        """
        from jobs.models import Job, Proposal
        from django.contrib.auth.models import User

        try:
            job = Job.objects.get(id=job_id)
            user = User.objects.get(id=user_id)

            # Get user skills from profile or defaults
            user_skills = []
            if hasattr(user, "profile") and user.profile.skills:
                user_skills = user.profile.skills
            else:
                user_skills = ["AI Integration", "Python", "API Development", "FastAPI"]

            logger.info(f"🤖 Generating proposal for job: {job.title[:50]}...")

            # Generate with Groq
            proposal_text = groq_service.generate_proposal(
                job_title=job.title,
                job_description=job.description,
                match_score=job.match_score,
                user_skills=user_skills,
            )

            # Add customization if provided
            if custom_instructions:
                proposal_text += f"\n\nP.S. {custom_instructions}"

            # Save to database
            proposal = Proposal.objects.create(
                job=job,
                user=user,
                content=proposal_text,
                ai_model=settings.GROQ_MODEL,
                status="draft",
            )

            # Update user stats
            if hasattr(user, "profile"):
                user.profile.total_proposals += 1
                user.profile.save()

            logger.info(f"✅ Generated proposal {proposal.id} for job {job.id}")
            logger.info(f"📝 Proposal preview: {proposal_text[:100]}...")

            return proposal

        except Job.DoesNotExist:
            logger.error(f"Job {job_id} not found")
            raise
        except Exception as e:
            logger.error(f"Proposal generation error: {e}")
            raise


proposal_generator = ProposalGenerator()
