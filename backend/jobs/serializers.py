from rest_framework import serializers
from .models import Job, ScanHistory


class JobSerializer(serializers.ModelSerializer):
    is_high_match = serializers.BooleanField(read_only=True)

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "ai_analysis", "match_score"]


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
            "is_high_match",
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single job view"""

    class Meta:
        model = Job
        fields = "__all__"


class ScanHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanHistory
        fields = "__all__"
        read_only_fields = ["scan_time"]


class JobFilterSerializer(serializers.Serializer):
    min_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    max_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    status = serializers.ChoiceField(required=False, choices=Job.STATUS_CHOICES)
    search = serializers.CharField(required=False, max_length=200)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100)
