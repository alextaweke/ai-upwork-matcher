from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from api.views import DashboardStatsView, stream_proposal, sync_jobs

schema_view = get_schema_view(
    openapi.Info(
        title="AI Job Matcher API",
        default_version="v1",
        description="API for AI-powered Upwork job matching",
        contact=openapi.Contact(email="support@example.com"),
    ),
    public=True,
)

urlpatterns = [
    # Auth routes
    path("auth/", include("users.urls")),
    # App routes
    path("", include("jobs.urls")),
    path("", include("proposals.urls")),
    # Token refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Documentation
    path(
        "docs/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("dashboard/", DashboardStatsView.as_view(), name="dashboard"),
    path("sync-jobs/", sync_jobs, name="sync-jobs"),
    path("stream-proposal/", stream_proposal, name="stream-proposal"),  # ADD THIS
]
