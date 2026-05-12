/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
// app/proposals/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Send,
  CheckCheck,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import {
  getProposals,
  getProposalStats,
  markProposalSent,
  markProposalAccepted,
  deleteProposal,
} from "@/services/api";
import type { Proposal } from "@/types";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );

  useEffect(() => {
    fetchProposals();
    fetchStats();
  }, [filter]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await getProposals();
      let data = response.data.results || response.data;
      if (filter !== "all") {
        data = data.filter((p: Proposal) => p.status === filter);
      }
      setProposals(data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getProposalStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleMarkSent = async (id: number) => {
    try {
      await markProposalSent(id);
      await fetchProposals();
      await fetchStats();
    } catch (error) {
      console.error("Error marking proposal as sent:", error);
    }
  };

  const handleMarkAccepted = async (id: number) => {
    try {
      await markProposalAccepted(id);
      await fetchProposals();
      await fetchStats();
    } catch (error) {
      console.error("Error marking proposal as accepted:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(id);
        await fetchProposals();
        await fetchStats();
      } catch (error) {
        console.error("Error deleting proposal:", error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="w-4 h-4 text-blue-400" />;
      case "accepted":
        return <CheckCheck className="w-4 h-4 text-emerald-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-600/20 text-blue-400 border-blue-500/20";
      case "accepted":
        return "bg-emerald-600/20 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-600/20 text-red-400 border-red-500/20";
      default:
        return "bg-gray-700/50 text-gray-400 border-gray-600/50";
    }
  };

  const exportProposals = () => {
    const data = proposals.map((p) => ({
      job_title: p.job_title,
      status: p.status,
      generated_at: p.generated_at,
      word_count: p.word_count,
      content: p.content,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposals_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Proposals
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your AI-generated proposals
              </p>
            </div>
            <button
              onClick={exportProposals}
              className="px-4 py-2 rounded-lg bg-[#1A1D24] border border-gray-700/50 text-gray-300 text-sm font-medium flex items-center gap-2 hover:border-gray-600 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Proposals</p>
                    <p className="text-2xl font-bold text-gray-100">
                      {stats.total}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400 opacity-50" />
                </div>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sent</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {stats.sent}
                    </p>
                  </div>
                  <Send className="w-8 h-8 text-blue-400 opacity-50" />
                </div>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {stats.accepted}
                    </p>
                  </div>
                  <CheckCheck className="w-8 h-8 text-emerald-400 opacity-50" />
                </div>
              </div>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Acceptance Rate</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {stats.acceptance_rate}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-800/50">
            {["all", "draft", "sent", "accepted", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition-all relative ${
                  filter === tab
                    ? "text-blue-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {filter === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading proposals...</p>
              </div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1D24] rounded-xl border border-gray-700/50">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No proposals found</p>
              <p className="text-sm text-gray-600 mt-1">
                Generate proposals from the Job Matcher page
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-[#1A1D24] rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(proposal.status)}
                        <h3 className="font-semibold text-gray-100">
                          {proposal.job_title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(proposal.status)}`}
                        >
                          {proposal.status}
                        </span>
                        {proposal.job_match_score >= 70 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
                            {proposal.job_match_score}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(proposal.generated_at).toLocaleString()}
                        </span>
                        <span>{proposal.word_count} words</span>
                        <span>{proposal.estimated_read_time} min read</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {proposal.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                        title="View full proposal"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      {proposal.status === "draft" && (
                        <button
                          onClick={() => handleMarkSent(proposal.id)}
                          className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
                          title="Mark as sent"
                        >
                          <Send className="w-4 h-4 text-blue-400" />
                        </button>
                      )}
                      {proposal.status === "sent" && (
                        <button
                          onClick={() => handleMarkAccepted(proposal.id)}
                          className="p-2 rounded-lg hover:bg-emerald-600/20 transition-colors"
                          title="Mark as accepted"
                        >
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="p-2 rounded-lg hover:bg-red-600/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Full Proposal Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1D24] rounded-xl border border-gray-700/50 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">
                {selectedProposal.job_title}
              </h3>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-1 rounded-lg hover:bg-gray-800"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {selectedProposal.content}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedProposal.content);
                }}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700"
              >
                Copy to Clipboard
              </button>
              {selectedProposal.status === "draft" && (
                <button
                  onClick={() => {
                    handleMarkSent(selectedProposal.id);
                    setSelectedProposal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm"
                >
                  Mark as Sent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
