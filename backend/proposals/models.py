from django.db import models
from django.conf import settings
from jobs.models import Job


class Proposal(models.Model):
    """Model for storing AI-generated proposals"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("expired", "Expired"),
    ]

    # Relations
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="proposals")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="proposals"
    )

    # Content
    content = models.TextField()
    ai_model = models.CharField(max_length=100, default="llama-3.3-70b")

    # Templates
    template_used = models.CharField(max_length=100, blank=True, null=True)
    custom_instructions = models.TextField(blank=True, null=True)

    # Metrics
    word_count = models.IntegerField(default=0)
    estimated_read_time = models.IntegerField(default=0)

    # Status
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="draft", db_index=True
    )

    # Timestamps
    generated_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    # Performance
    viewed = models.BooleanField(default=False)
    client_response = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-generated_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["job"]),
        ]

    def save(self, *args, **kwargs):
        self.word_count = len(self.content.split())
        self.estimated_read_time = max(1, self.word_count // 200)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Proposal for {self.job.title[:30]} - {self.status}"


class ProposalTemplate(models.Model):
    """Store reusable proposal templates"""

    name = models.CharField(max_length=100, unique=True)
    content = models.TextField()
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=50,
        choices=[
            ("ai_integration", "AI Integration"),
            ("automation", "Automation"),
            ("chatbot", "Chatbot"),
            ("general", "General"),
        ],
        default="general",
    )
    is_active = models.BooleanField(default=True)
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
