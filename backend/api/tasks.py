# apps/api/tasks.py
from celery import shared_task
from django.core.management import call_command
from django.contrib.auth.models import User
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


def send_new_job_alert(user_id, data):
    raise NotImplementedError


@shared_task
def scan_jobs_task():
    """Auto-scan jobs for all users"""
    logger.info("Starting automated job scan...")

    try:
        # Run scan for all users
        call_command("scan_jobs")

        # Get all users and send notifications
        users = User.objects.filter(is_active=True)

        for user in users:
            # Send WebSocket notification
            send_scan_notification(
                user.id,
                {
                    "status": "completed",
                    "timestamp": timezone.now().isoformat(),
                    "message": "Job scan completed successfully",
                },
            )

            # Check for high matches
            from jobs.models import Job

            high_matches = Job.objects.filter(
                match_score__gte=80,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=5),
            ).count()

            if high_matches > 0:
                send_new_job_alert(
                    user.id,
                    {
                        "count": high_matches,
                        "message": f"Found {high_matches} new high-match jobs!",
                    },
                )

        logger.info("Auto-scan completed successfully")
        return {
            "status": "success",
            "jobs_found": high_matches if "high_matches" in locals() else 0,
        }

    except Exception as e:
        logger.error(f"Auto-scan failed: {e}")
        return {"status": "error", "error": str(e)}


@shared_task
def scan_high_priority_jobs():
    """Scan only high-priority keywords more frequently"""
    logger.info("Starting high-priority job scan...")

    try:
        call_command("scan_jobs", "--priority", "high")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"High-priority scan failed: {e}")
        return {"status": "error"}


@shared_task
def cleanup_notifications():
    """Clean up old notifications (older than 30 days)"""
    from api.models import Notification
    from django.utils import timezone
    from datetime import timedelta

    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count = Notification.objects.filter(
        created_at__lt=cutoff_date, is_read=True
    ).delete()[0]

    logger.info(f"Cleaned up {deleted_count} old notifications")
    return {"deleted": deleted_count}


@shared_task
def send_new_job_alert_to_user(user_id, job_data):
    """Send new job alert to specific user"""
    from api.models import Notification
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(id=user_id)

        # Create notification in database
        notification = Notification.objects.create(
            user=user,
            notification_type="new_job",
            title=f"New Job Match: {job_data.get('title', 'Job')[:50]}",
            message=f"Match score: {job_data.get('match_score', 0)}%",
            metadata=job_data,
        )

        # Send WebSocket notification
        send_websocket_notification(
            user_id,
            {
                "type": "new_job",
                "notification_id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "job": job_data,
            },
        )

        return True
    except Exception as e:
        logger.error(f"Failed to send alert to user {user_id}: {e}")
        return False


def send_websocket_notification(user_id, data):
    """Helper to send WebSocket notification"""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_user_{user_id}", {"type": "send_notification", "data": data}
    )


def send_scan_notification(user_id, data):
    """Helper to send scan completion notification"""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_user_{user_id}", {"type": "scan_completed", "data": data}
    )
