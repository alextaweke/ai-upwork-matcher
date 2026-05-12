/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Download,
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getJobStats,
  getProposalStats,
  getScanHistory,
} from "@/services/api";
import { percent } from "framer-motion/dom";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [jobStats, setJobStats] = useState<any>(null);
  const [proposalStats, setProposalStats] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboard, jobs, proposals, scans] = await Promise.all([
        getDashboardStats(),
        getJobStats(),
        getProposalStats(),
        getScanHistory(),
      ]);
      setDashboardStats(dashboard.data);
      setJobStats(jobs.data);
      setProposalStats(proposals.data);
      setScanHistory(scans.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (replace with real data from your API)
  const matchTrendData = [
    { date: "Mon", matches: 12, applied: 5 },
    { date: "Tue", matches: 18, applied: 8 },
    { date: "Wed", matches: 15, applied: 6 },
    { date: "Thu", matches: 22, applied: 10 },
    { date: "Fri", matches: 20, applied: 9 },
    { date: "Sat", matches: 14, applied: 7 },
    { date: "Sun", matches: 10, applied: 4 },
  ];

  const skillDistribution = [
    { name: "Python", value: 35, color: "#3B82F6" },
    { name: "AI/ML", value: 28, color: "#8B5CF6" },
    { name: "API", value: 22, color: "#10B981" },
    { name: "JavaScript", value: 15, color: "#F59E0B" },
  ];

  const budgetData = [
    { range: "$0-500", count: 45 },
    { range: "$500-1k", count: 62 },
    { range: "$1k-5k", count: 38 },
    { range: "$5k+", count: 15 },
  ];

  const performanceData = [
    { month: "Jan", proposals: 12, accepted: 3 },
    { month: "Feb", proposals: 18, accepted: 5 },
    { month: "Mar", proposals: 25, accepted: 8 },
    { month: "Apr", proposals: 22, accepted: 7 },
    { month: "May", proposals: 30, accepted: 12 },
    { month: "Jun", proposals: 28, accepted: 10 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] ml-64 pt-16">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Analytics
              </h1>
              <p className="text-gray-500 mt-1">
                Performance metrics and insights
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-[#1A1D24] border border-gray-700/50 rounded-lg text-sm text-gray-300"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
              <button className="px-4 py-2 rounded-lg bg-[#1A1D24] border border-gray-700/50 text-gray-300 text-sm flex items-center gap-2 hover:border-gray-600">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-500/5 rounded-xl p-5 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Match Rate</span>
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-gray-100">
                {jobStats?.avg_match_score || 0}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">+5.2%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-500/5 rounded-xl p-5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Acceptance Rate</span>
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-gray-100">
                {proposalStats?.acceptance_rate || 0}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">+8.1%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/10 to-purple-500/5 rounded-xl p-5 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">API Calls Today</span>
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-gray-100">
                {dashboardStats?.api_usage?.calls_today || 0}
              </p>
              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{
                    width: `${((dashboardStats?.api_usage?.calls_today || 0) / 14400) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600/10 to-amber-500/5 rounded-xl p-5 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Earnings</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-gray-100">$0</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">
                  Tracked from accepted proposals
                </span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Match Trend */}
            <div className="bg-[#1A1D24] rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">
                    Match & Application Trend
                  </h3>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
                <LineChart className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={matchTrendData}>
                  <defs>
                    <linearGradient
                      id="colorMatches"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorApplied"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="matches"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorMatches)"
                  />
                  <Area
                    type="monotone"
                    dataKey="applied"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorApplied)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Distribution */}
            <div className="bg-[#1A1D24] rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">
                    In-Demand Skills
                  </h3>
                  <p className="text-xs text-gray-500">Based on job matches</p>
                </div>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Budget Distribution */}
            <div className="bg-[#1A1D24] rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">
                    Budget Distribution
                  </h3>
                  <p className="text-xs text-gray-500">Jobs by budget range</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {budgetData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Over Time */}
            <div className="bg-[#1A1D24] rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">
                    Performance Over Time
                  </h3>
                  <p className="text-xs text-gray-500">
                    Proposals sent vs accepted
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="proposals"
                    fill="#3B82F6"
                    name="Proposals Sent"
                  />
                  <Bar dataKey="accepted" fill="#10B981" name="Accepted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-gray-100">
                AI Insights & Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1A1D24]/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  📊 Match Performance
                </p>
                <p className="text-xs text-gray-300">
                  Your match rate is {jobStats?.avg_match_score || 0}%, which is{" "}
                  {jobStats?.avg_match_score > 70 ? "excellent" : "good"}.
                  {jobStats?.avg_match_score < 70 &&
                    " Consider adding more AI/API skills to your profile."}
                </p>
              </div>
              <div className="bg-[#1A1D24]/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">💡 Proposal Tip</p>
                <p className="text-xs text-gray-300">
                  Proposals with personalized openings have{" "}
                  {proposalStats?.acceptance_rate || 0}% higher acceptance rate.
                  Always mention specific job requirements.
                </p>
              </div>
              <div className="bg-[#1A1D24]/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  🎯 Best Time to Apply
                </p>
                <p className="text-xs text-gray-300">
                  Based on your history, applying within 2 hours of job posting
                  increases chances by 40%. Enable auto-scan for real-time
                  notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
