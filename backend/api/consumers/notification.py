# apps/api/consumers/notification.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from jobs.models import Job


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("🔌 WebSocket connect attempt")

        # IMPORTANT: accept first (prevents WSREJECT)
        await self.accept()

        # TEMP: no auth check yet (avoid rejection)
        self.user = None

        # Send initial safe response
        await self.send(
            text_data=json.dumps(
                {
                    "type": "connected",
                    "message": "WebSocket connected successfully",
                }
            )
        )

    async def disconnect(self, close_code):
        print("❌ WebSocket disconnected")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))

        except Exception as e:
            print("WebSocket receive error:", e)

    async def send_notification(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "notification",
                    "data": event["data"],
                }
            )
        )

    async def new_job_alert(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "new_job",
                    "data": event["data"],
                }
            )
        )

    async def scan_completed(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "scan_completed",
                    "data": event["data"],
                }
            )
        )

    # SAFE DB CALL (only works if user is added later)
    @database_sync_to_async
    def get_recent_jobs(self):
        jobs = Job.objects.order_by("-posted_at")[:5]
        return [
            {
                "id": job.id,
                "title": job.title[:50],
                "match_score": job.match_score,
                "posted_at": job.posted_at.isoformat(),
            }
            for job in jobs
        ]
