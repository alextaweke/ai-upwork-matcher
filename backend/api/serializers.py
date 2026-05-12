# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Job, Proposal, ScanHistory, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""

    class Meta:
        model = Job
        fields = [
            "id",
            "job_id",
            "title",
            "budget",
            "posted_at",
            "match_score",
            "skills",
            "status",
            "client_rating",
        ]


class ProposalSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["generated_at", "word_count", "estimated_read_time"]


class ProposalGenerateSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    custom_instructions = serializers.CharField(required=False, allow_blank=True)


class ScanHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanHistory
        fields = "__all__"


class DashboardStatsSerializer(serializers.Serializer):
    total_jobs = serializers.IntegerField()
    high_matches = serializers.IntegerField()
    proposals_sent = serializers.IntegerField()
    match_rate = serializers.FloatField()
    api_calls_today = serializers.IntegerField()
    credits_remaining = serializers.IntegerField()
