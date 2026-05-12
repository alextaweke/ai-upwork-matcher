# api/models.py - Add Notification model
from django.db import models
from django.contrib.auth.models import User
from jobs.models import Job


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("new_job", "New Job Match"),
        ("high_match", "High Match Alert"),
        ("scan_complete", "Scan Completed"),
        ("proposal_ready", "Proposal Ready"),
        ("job_applied", "Job Applied"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"
