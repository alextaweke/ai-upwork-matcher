from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"proposals", views.ProposalViewSet)
router.register(r"templates", views.ProposalTemplateViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
