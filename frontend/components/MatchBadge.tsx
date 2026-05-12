// components/MatchBadge.tsx
"use client";

interface MatchBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function MatchBadge({
  score,
  size = "md",
  showLabel = true,
}: MatchBadgeProps) {
  const getColor = () => {
    if (score >= 80) return "from-emerald-600 to-green-600";
    if (score >= 60) return "from-blue-600 to-cyan-600";
    if (score >= 40) return "from-yellow-600 to-amber-600";
    return "from-gray-600 to-gray-700";
  };

  const getGlowColor = () => {
    if (score >= 80) return "shadow-emerald-500/20";
    if (score >= 60) return "shadow-blue-500/20";
    if (score >= 40) return "shadow-yellow-500/20";
    return "shadow-gray-500/20";
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
        relative rounded-full bg-gradient-to-br ${getColor()} 
        flex items-center justify-center font-bold text-white
        shadow-lg ${getGlowColor()} ${sizes[size]}
      `}
      >
        {score}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" />
      </div>
      {showLabel && (
        <span className={`font-medium text-gray-300 ${labelSizes[size]}`}>
          {score >= 80
            ? "Excellent Match"
            : score >= 60
              ? "Good Match"
              : score >= 40
                ? "Fair Match"
                : "Low Match"}
        </span>
      )}
    </div>
  );
}
