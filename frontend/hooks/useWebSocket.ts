/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useWebSocket.ts

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export function useWebSocket() {
  const { isAuthenticated } = useAuthStore();

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    const token = Cookies.get("access_token");

    if (!token) {
      console.error("No access token found");
      return;
    }

    // Prevent duplicate connections
    if (
      ws &&
      (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "notification") {
        setNotifications((prev) => [data.data, ...prev]);
        setUnreadCount((prev) => prev + 1);

        toast(data.data.title, {
          icon: "🔔",
          duration: 5000,
        });
      } else if (data.type === "new_job") {
        toast.success(`🎯 New Job: ${data.data.title}`, {
          duration: 10000,
        });

        setUnreadCount((prev) => prev + 1);
      } else if (data.type === "scan_completed") {
        toast.success("Job scan completed!", {
          duration: 3000,
        });
      } else if (data.type === "initial") {
        setUnreadCount(data.data.unread_count || 0);
        setNotifications(data.data.recent_notifications || []);
      }
    };

    websocket.onclose = () => {
      console.log("❌ WebSocket disconnected");

      setIsConnected(false);

      // Reconnect after 5 seconds
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(websocket);
  }, [isAuthenticated, ws]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    if (ws) {
      ws.close();
      setWs(null);
    }

    setIsConnected(false);
  }, [ws]);

  const markAsRead = useCallback(
    (notificationId: number) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "mark_read",
            notification_ids: [notificationId],
          }),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [ws],
  );

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  return {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,

    sendMessage: (data: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },
  };
}
