/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
// app/jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  Zap,
  X,
  TrendingUp,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import { getJobs, getJobStats, syncJobs } from "@/services/api";
import type { Job, JobStats } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    status: "",
    sortBy: "match_score",
  });

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [filters, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        ...(filters.minScore > 0 && { min_score: filters.minScore }),
        ...(filters.maxScore < 100 && { max_score: filters.maxScore }),
        ...(filters.status && { status: filters.status }),
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await getJobs(params);
      setJobs(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getJobStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSyncJobs = async () => {
    setSyncing(true);
    try {
      await syncJobs();
      await fetchJobs();
      await fetchStats();
    } catch (error) {
      console.error("Error syncing jobs:", error);
    } finally {
      setSyncing(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      minScore: 0,
      maxScore: 100,
      status: "",
      sortBy: "match_score",
    });
    setSearchTerm("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Job Matcher
              </h1>
              <p className="text-gray-500 mt-1">
                AI-powered job discovery and matching
              </p>
            </div>
            <button
              onClick={handleSyncJobs}
              disabled={syncing}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Jobs
                </>
              )}
            </button>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Total Jobs</span>
                </div>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.total}
                </p>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>High Matches</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.high_matches}
                </p>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Avg Match Score</span>
                </div>
                <p
                  className={`text-2xl font-bold ${getScoreColor(stats.avg_match_score)}`}
                >
                  {stats.avg_match_score}%
                </p>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Applied</span>
                </div>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.applied}
                </p>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Scans Today</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.scans_today}
                </p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1D24] border border-gray-700/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  showFilters
                    ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                    : "bg-[#1A1D24] border-gray-700/50 text-gray-400 hover:text-gray-300"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-[#1A1D24] rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    Filter Jobs
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Match Score Range */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Match Score Range
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minScore}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minScore: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-[#0F1117] border border-gray-700 rounded-lg text-sm text-gray-100"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxScore}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxScore: parseInt(e.target.value) || 100,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-[#0F1117] border border-gray-700 rounded-lg text-sm text-gray-100"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0F1117] border border-gray-700 rounded-lg text-sm text-gray-100"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="matched">Matched</option>
                      <option value="applied">Applied</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#0F1117] border border-gray-700 rounded-lg text-sm text-gray-100"
                    >
                      <option value="match_score">Match Score (Highest)</option>
                      <option value="posted_at">Newest First</option>
                      <option value="budget">Budget (Highest)</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.minScore > 0 ||
                  filters.maxScore < 100 ||
                  filters.status) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700/50">
                    {filters.minScore > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 flex items-center gap-1">
                        Score ≥ {filters.minScore}
                        <button
                          onClick={() =>
                            setFilters({ ...filters, minScore: 0 })
                          }
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.maxScore < 100 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 flex items-center gap-1">
                        Score ≤ {filters.maxScore}
                        <button
                          onClick={() =>
                            setFilters({ ...filters, maxScore: 100 })
                          }
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.status && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-600/20 text-purple-400 flex items-center gap-1">
                        Status: {filters.status}
                        <button
                          onClick={() => setFilters({ ...filters, status: "" })}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1D24] rounded-xl border border-gray-700/50">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No jobs found</p>
              <button
                onClick={handleSyncJobs}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Sync jobs to get started
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onProposalGenerated={fetchStats}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
