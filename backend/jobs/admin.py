from django.contrib import admin
from .models import Job, ScanHistory


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "match_score", "budget", "status", "posted_at"]
    list_filter = ["status", "match_score"]
    search_fields = ["title", "description"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ScanHistory)
class ScanHistoryAdmin(admin.ModelAdmin):
    list_display = ["scan_time", "jobs_found", "high_matches", "status"]
    readonly_fields = ["scan_time"]
