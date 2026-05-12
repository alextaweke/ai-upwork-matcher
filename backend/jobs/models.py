from django.db import models


class Job(models.Model):
    """Model for storing Upwork jobs"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("matched", "Matched"),
        ("applied", "Applied"),
        ("ignored", "Ignored"),
        ("archived", "Archived"),
    ]

    # Basic info
    job_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=500)
    description = models.TextField()
    url = models.URLField(max_length=500)

    # Financial
    budget = models.CharField(max_length=100, null=True, blank=True)
    hourly_range = models.CharField(max_length=100, null=True, blank=True)

    # Time
    posted_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # AI fields
    match_score = models.IntegerField(default=0, db_index=True)  # 0-100
    ai_analysis = models.JSONField(default=dict)

    # Metadata
    skills = models.JSONField(default=list)
    client_name = models.CharField(max_length=200, null=True, blank=True)
    client_rating = models.FloatField(null=True, blank=True)  # ← ADD THIS
    client_spent = models.CharField(max_length=100, null=True, blank=True)  # ← ADD THIS
    client_country = models.CharField(
        max_length=100, null=True, blank=True
    )  # ← ADD THIS
    # Status

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )

    class Meta:
        ordering = ["-match_score", "-posted_at"]
        indexes = [
            models.Index(fields=["match_score"]),
            models.Index(fields=["status"]),
            models.Index(fields=["-posted_at"]),
            models.Index(fields=["job_id"]),
        ]

    def __str__(self):
        return f"{self.title[:50]} - {self.match_score}%"

    @property
    def is_high_match(self):
        return self.match_score >= 70


class ScanHistory(models.Model):
    """Track AI scan history"""

    scan_time = models.DateTimeField(auto_now_add=True)
    jobs_found = models.IntegerField(default=0)
    high_matches = models.IntegerField(default=0)
    tokens_used = models.IntegerField(default=0)
    duration_seconds = models.FloatField(default=0)
    status = models.CharField(max_length=20, default="completed")
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-scan_time"]
        verbose_name_plural = "Scan histories"

    def __str__(self):
        return f"Scan at {self.scan_time} - {self.jobs_found} jobs"
