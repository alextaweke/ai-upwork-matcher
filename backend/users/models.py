# apps/users/models.py - Add skills management
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # API usage tracking
    api_calls_today = models.IntegerField(default=0)
    last_api_reset = models.DateTimeField(auto_now_add=True)

    # Preferences
    min_match_score = models.IntegerField(default=70)
    auto_apply = models.BooleanField(default=False)

    # Skills (store as JSON array)
    skills = models.JSONField(default=list, blank=True)

    # Skill categories for better matching
    skill_categories = models.JSONField(
        default=dict, blank=True
    )  # {"python": "advanced", "ai": "expert"}

    # Job search preferences
    preferred_job_types = models.JSONField(
        default=list, blank=True
    )  # ["hourly", "fixed"]
    min_budget = models.IntegerField(null=True, blank=True)
    max_budget = models.IntegerField(null=True, blank=True)

    # Notification preferences
    notify_new_matches = models.BooleanField(default=True)
    email_digest = models.BooleanField(default=False)

    # Stats
    total_proposals = models.IntegerField(default=0)
    acceptance_rate = models.FloatField(default=0.0)
    earnings_estimate = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def increment_api_calls(self):
        """Increment API call counter"""
        self.api_calls_today += 1
        self.save()

    def get_remaining_credits(self):
        """Calculate remaining Groq credits (14,400 daily limit)"""
        return max(0, 14400 - self.api_calls_today)

    def get_search_keywords(self):
        """Generate search keywords from user skills"""
        if not self.skills:
            return ["python developer", "api integration", "backend developer"]

        # Skill to keyword mappings
        skill_mapping = {
            "python": ["python", "django", "fastapi", "flask", "backend", "api"],
            "javascript": ["javascript", "react", "node.js", "vue", "frontend"],
            "typescript": ["typescript", "react", "node", "angular", "frontend"],
            "java": ["java", "spring", "spring boot", "backend", "api"],
            "go": ["golang", "go", "backend", "api", "microservices"],
            "rust": ["rust", "systems", "backend", "api"],
            "php": ["php", "laravel", "symfony", "backend", "api"],
            "ruby": ["ruby", "rails", "backend", "api"],
            "csharp": ["c#", ".net", "dotnet", "backend", "api"],
            # Frontend
            "react": ["react", "react.js", "frontend", "ui", "component"],
            "vue": ["vue", "vue.js", "frontend", "ui"],
            "angular": ["angular", "frontend", "ui"],
            "nextjs": ["next.js", "nextjs", "react", "frontend", "ssr"],
            # AI/ML
            "ai": [
                "ai",
                "artificial intelligence",
                "machine learning",
                "openai",
                "llm",
            ],
            "machine learning": [
                "machine learning",
                "ml",
                "ai",
                "tensorflow",
                "pytorch",
            ],
            "openai": ["openai", "gpt", "chatgpt", "llm", "ai api"],
            "llm": ["llm", "large language model", "openai", "claude", "gemini"],
            "langchain": ["langchain", "llm", "ai", "agent", "workflow"],
            # API/Integration
            "api": ["api", "rest api", "graphql", "integration", "microservices"],
            "graphql": ["graphql", "api", "apollo", "backend"],
            "rest": ["rest api", "api", "backend", "integration"],
            # Databases
            "postgresql": ["postgresql", "postgres", "database", "sql"],
            "mongodb": ["mongodb", "mongo", "nosql", "database"],
            "mysql": ["mysql", "database", "sql"],
            "redis": ["redis", "cache", "database"],
            # Cloud/DevOps
            "aws": ["aws", "amazon web services", "cloud", "ec2", "lambda"],
            "azure": ["azure", "microsoft cloud", "cloud"],
            "gcp": ["gcp", "google cloud", "cloud"],
            "docker": ["docker", "container", "devops"],
            "kubernetes": ["kubernetes", "k8s", "container", "orchestration"],
            # Automation
            "automation": ["automation", "scripting", "workflow", "python automation"],
            "selenium": ["selenium", "web automation", "testing"],
            "scrapy": ["scrapy", "web scraping", "crawler", "data extraction"],
        }

        keywords = set()

        for skill in self.skills:
            skill_lower = skill.lower().strip()
            keywords.add(skill_lower)

            # Add related keywords
            for key, related in skill_mapping.items():
                if key in skill_lower or skill_lower in key:
                    keywords.update(related)

        # Add common backend keywords if missing
        if not keywords:
            keywords = {"python", "api", "integration", "developer"}

        # Convert to list and limit to 10
        result = list(keywords)[:10]
        # logger.info(f"Generated search keywords from skills: {result}")

        return result

    def calculate_match_score(self, job_skills):
        """Calculate match score based on user skills vs job requirements"""
        if not self.skills:
            return 50  # Default score

        if not job_skills:
            return 40  # No job skills specified

        user_skills_lower = [s.lower().strip() for s in self.skills]
        job_skills_lower = [s.lower().strip() for s in job_skills]

        # Count matches
        matches = 0
        for user_skill in user_skills_lower:
            for job_skill in job_skills_lower:
                # Check if skill matches exactly or partially
                if (
                    user_skill == job_skill
                    or user_skill in job_skill
                    or job_skill in user_skill
                ):
                    matches += 1
                    break

        # Calculate percentage based on matches
        if matches == 0:
            score = 30
        elif matches == 1:
            score = 50
        elif matches == 2:
            score = 65
        elif matches == 3:
            score = 75
        elif matches == 4:
            score = 85
        else:
            score = 95

        # Cap at 95, minimum 30
        return min(max(score, 30), 95)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create profile when user is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Auto-save profile when user is saved"""
    if hasattr(instance, "profile"):
        instance.profile.save()
