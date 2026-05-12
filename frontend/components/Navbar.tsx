// components/Navbar.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Navbar() {
  const { unreadCount, notifications, markAsRead } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-64 z-40 bg-[#0F1117]/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left Section - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs, clients, or proposals..."
              className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* AI Credit Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">
              142 AI credits
            </span>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </div>

          {/* Last Scan */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Last scan: 2 min ago</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-800/50"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-[#1A1D24] rounded-xl border border-gray-700 shadow-2xl z-50">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-100">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-gray-800/30 border-b border-gray-700/50 cursor-pointer"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className="text-sm text-gray-200">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(notif.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <button className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">Alex Chen</p>
              <p className="text-xs text-gray-500">AI Integrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}
