// components/ProposalStream.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Copy,
  CheckCheck,
  Sparkles,
  Loader2,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import {
  getProposals,
  markProposalSent,
  markProposalAccepted,
  deleteProposal,
} from "@/services/api";
import type { Proposal } from "@/types";

export default function ProposalStream() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await getProposals();
      setProposals(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(String(id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkSent = async (id: number) => {
    try {
      await markProposalSent(id);
      await fetchProposals();
    } catch (error) {
      console.error("Error marking proposal as sent:", error);
    }
  };

  const handleMarkAccepted = async (id: number) => {
    try {
      await markProposalAccepted(id);
      await fetchProposals();
    } catch (error) {
      console.error("Error marking proposal as accepted:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(id);
        await fetchProposals();
      } catch (error) {
        console.error("Error deleting proposal:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-blue-400 bg-blue-600/10";
      case "accepted":
        return "text-emerald-400 bg-emerald-600/10";
      case "rejected":
        return "text-red-400 bg-red-600/10";
      default:
        return "text-gray-400 bg-gray-700/50";
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1D24] rounded-xl border border-gray-700/50 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D24] rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">AI Proposal Stream</h3>
            <p className="text-xs text-gray-500">
              {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}{" "}
              generated
            </p>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="divide-y divide-gray-800/50 max-h-[500px] overflow-y-auto">
        {proposals.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No proposals generated yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Click AI Proposal on any job to get started
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="p-4 hover:bg-gray-800/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {proposal.job_title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(proposal.status)}`}
                  >
                    {proposal.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(proposal.generated_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(proposal.content, proposal.id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                    title="Copy to clipboard"
                  >
                    {copiedId === String(proposal.id) ? (
                      <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 pl-8">
                {proposal.content}
              </p>

              <div className="mt-2 pl-8 flex gap-3">
                {proposal.status === "draft" && (
                  <button
                    onClick={() => handleMarkSent(proposal.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Mark as Sent
                  </button>
                )}
                {proposal.status === "sent" && (
                  <button
                    onClick={() => handleMarkAccepted(proposal.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark as Accepted
                  </button>
                )}
                <span className="text-xs text-gray-600">
                  {proposal.word_count} words · {proposal.estimated_read_time}{" "}
                  min read
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Status Bar */}
      <div className="p-3 bg-gradient-to-r from-blue-600/5 to-purple-600/5 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400">AI Model: Llama 3.3 70B</span>
          </div>
          <span className="text-gray-500">Context window: 128K tokens</span>
        </div>
      </div>
    </div>
  );
}
