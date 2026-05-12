# backend/backend/asgi.py
# ruff: noqa: E402
import os
from django.core.asgi import get_asgi_application

# 1. Set the settings first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# 2. Initialize the Django ASGI application
# This populates the app registry so models/consumers can be loaded
django_asgi_app = get_asgi_application()

# 3. Import everything else AFTER get_asgi_application()
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from api.consumers.notification import NotificationConsumer

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    path(
                        "ws/notifications/",
                        NotificationConsumer.as_asgi(),
                    ),
                ]
            )
        ),
    }
)
