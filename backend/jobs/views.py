from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Avg, Count
from django.db import models
from django.utils import timezone
from .models import Job, ScanHistory
from .serializers import (
    JobSerializer,
    JobListSerializer,
    JobDetailSerializer,
    ScanHistorySerializer,
    JobFilterSerializer,
)


class JobViewSet(viewsets.ModelViewSet):
    """ViewSet for Job operations"""

    queryset = Job.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Job.objects.all()

        # Parse query parameters
        filter_serializer = JobFilterSerializer(data=self.request.query_params)
        if filter_serializer.is_valid():
            filters = filter_serializer.validated_data

            # Filter by match score
            if filters.get("min_score"):
                queryset = queryset.filter(match_score__gte=filters["min_score"])
            if filters.get("max_score"):
                queryset = queryset.filter(match_score__lte=filters["max_score"])

            # Filter by status
            if filters.get("status"):
                queryset = queryset.filter(status=filters["status"])

            # Search
            if filters.get("search"):
                search_term = filters["search"]
                queryset = queryset.filter(
                    Q(title__icontains=search_term)
                    | Q(description__icontains=search_term)
                    | Q(skills__icontains=search_term)
                )

            # Limit
            if filters.get("limit"):
                queryset = queryset[: filters["limit"]]

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return JobListSerializer
        elif self.action == "retrieve":
            return JobDetailSerializer
        return JobSerializer

    @action(detail=False, methods=["get"])
    def high_matches(self, request):
        """Get high match jobs (score >= 70)"""
        jobs = Job.objects.filter(match_score__gte=70)[:20]
        serializer = JobListSerializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get job statistics"""
        stats = {
            "total": Job.objects.count(),
            "pending": Job.objects.filter(status="pending").count(),
            "matched": Job.objects.filter(status="matched").count(),
            "applied": Job.objects.filter(status="applied").count(),
            "high_matches": Job.objects.filter(match_score__gte=70).count(),
            "avg_match_score": Job.objects.aggregate(Avg("match_score"))[
                "match_score__avg"
            ]
            or 0,
            "scans_today": ScanHistory.objects.filter(
                scan_time__date=timezone.now().date()
            ).count(),
        }
        return Response(stats)

    @action(detail=False, methods=["get"])
    def scan_history(self, request):
        """Get scan history"""
        history = ScanHistory.objects.all()[:10]
        serializer = ScanHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Update job status"""
        job = self.get_object()
        new_status = request.data.get("status")

        if new_status not in dict(Job.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        job.status = new_status
        job.save()

        return Response({"status": "updated", "new_status": new_status})
