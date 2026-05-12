from rest_framework import serializers
from .models import Proposal, ProposalTemplate
from jobs.serializers import JobListSerializer


class ProposalSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_match_score = serializers.IntegerField(source="job.match_score", read_only=True)

    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["generated_at", "word_count", "estimated_read_time", "user"]


class ProposalDetailSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = Proposal
        fields = "__all__"


class ProposalGenerateSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    template_id = serializers.IntegerField(required=False, allow_null=True)
    custom_instructions = serializers.CharField(required=False, allow_blank=True)


class ProposalTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalTemplate
        fields = "__all__"
        read_only_fields = ["usage_count", "created_at"]


class ProposalStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    sent = serializers.IntegerField()
    accepted = serializers.IntegerField()
    rejected = serializers.IntegerField()
    acceptance_rate = serializers.FloatField()
    avg_response_time = serializers.FloatField()
