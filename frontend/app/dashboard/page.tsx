/* eslint-disable react-hooks/immutability */
// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Target,
  FileText,
  Activity,
  Zap,
  TrendingUp,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import JobCard from "@/components/JobCard";
import ProposalStream from "@/components/ProposalStream";
import { getDashboardStats, getHighMatchJobs, syncJobs } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { DashboardStats, Job } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes] = await Promise.all([
        getDashboardStats(),
        getHighMatchJobs(),
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncJobs = async () => {
    setSyncing(true);
    try {
      await syncJobs();
      await fetchDashboardData();
    } catch (error) {
      console.error("Error syncing jobs:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back, {user?.username || "Freelancer"}
            </h1>
            <p className="text-gray-500 mt-1">
              Your AI job matcher found {stats?.jobs.high_matches || 0}{" "}
              high-quality matches
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatsCard
              title="Jobs Scanned"
              value={stats?.jobs.total || 0}
              icon={Briefcase}
              trend={12}
              color="blue"
            />
            <StatsCard
              title="High Matches"
              value={stats?.jobs.high_matches || 0}
              icon={Target}
              trend={8}
              color="emerald"
            />
            <StatsCard
              title="Proposals Sent"
              value={stats?.proposals.sent || 0}
              icon={FileText}
              trend={stats?.proposals.acceptance_rate || 0}
              trendLabel="acceptance rate"
              color="purple"
            />
            <StatsCard
              title="Match Rate"
              value={`${stats?.jobs.avg_match_score || 0}%`}
              icon={Activity}
              trend={5}
              color="amber"
            />
          </div>

          {/* API Credits Bar */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">
                  AI API Credits
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {stats?.api_usage.credits_remaining} /{" "}
                {stats?.api_usage.daily_limit} remaining
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((stats?.api_usage.credits_remaining || 0) / (stats?.api_usage.daily_limit || 14400)) * 100}% 
                `,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.api_usage.calls_today} API calls today
            </p>
          </div>

          {/* Sync Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSyncJobs}
              disabled={syncing}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Sync New Jobs
                </>
              )}
            </button>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Jobs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">
                    🎯 Top Matches Today
                  </h2>
                  <p className="text-sm text-gray-500">
                    AI-scored job opportunities
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => <JobCard key={job.id} job={job} />)
                ) : (
                  <div className="text-center py-12 bg-[#1A1D24] rounded-xl border border-gray-700/50">
                    <p className="text-gray-500">
                      No high-match jobs found yet
                    </p>
                    <button
                      onClick={handleSyncJobs}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Click here to scan for jobs
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Proposal Stream */}
            <div>
              <ProposalStream />
            </div>
          </div>

          {/* AI Activity Footer */}
          <div className="mt-8 p-4 rounded-xl bg-[#1A1D24]/50 border border-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  API Connected: Groq (Llama 3.3)
                </span>
                <span>Last sync: {new Date().toLocaleTimeString()}</span>
              </div>
              <span>
                Token usage: {stats?.api_usage.calls_today || 0} / 14,400 daily
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
