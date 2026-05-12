// components/StatsCard.tsx
"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "emerald" | "purple" | "amber" | "red";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last week",
  color = "blue",
}: StatsCardProps) {
  const colors = {
    blue: "from-blue-600/20 to-blue-500/10 border-blue-500/20",
    emerald: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/20",
    purple: "from-purple-600/20 to-purple-500/10 border-purple-500/20",
    amber: "from-amber-600/20 to-amber-500/10 border-amber-500/20",
    red: "from-red-600/20 to-red-500/10 border-red-500/20",
  };

  const iconColors = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div
      className={`
      relative overflow-hidden rounded-xl border bg-gradient-to-br p-5
      ${colors[color]} backdrop-blur-sm
      hover:scale-[1.02] transition-transform duration-300
    `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>

          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>

        <div
          className={`
          p-2.5 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50
          border border-gray-700/50
        `}
        >
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
      </div>

      {/* Animated background effect */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-current opacity-5 blur-2xl" />
    </div>
  );
}
