# jobs/seed.py

from .models import Job

Job.objects.create(
    title="Build AI SaaS Dashboard",
    description="Need a Next.js + Django developer to build AI dashboard",
    budget="$500",
    skills=["Next.js", "Django", "AI"],
)
