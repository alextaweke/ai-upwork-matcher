// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  TrendingUp,
  Settings,
  Bot,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-blue-500",
  },
  {
    name: "Jobs Matcher",
    icon: Briefcase,
    href: "/jobs",
    color: "text-emerald-500",
  },
  {
    name: "Proposals",
    icon: FileText,
    href: "/proposals",
    color: "text-purple-500",
  },
  {
    name: "AI Analytics",
    icon: TrendingUp,
    href: "/analytics",
    color: "text-amber-500",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0F1117] border-r border-gray-800/50 z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-800/50">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Job Matcher
        </span>
        <Sparkles className="w-3.5 h-3.5 text-purple-400 ml-auto" />
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }
              `}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? item.color : ""}`} />
              <span className="text-sm font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Stats Section */}
      <div className="absolute bottom-6 left-3 right-3 p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">AI Active</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Scanning <span className="text-blue-400 font-medium">247 jobs</span>{" "}
          in real-time
        </p>
        <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
