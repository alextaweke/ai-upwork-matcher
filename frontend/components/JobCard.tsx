// components/JobCard.tsx
"use client";

import { useState } from "react";
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
  Send,
} from "lucide-react";
import MatchBadge from "./MatchBadge";
import {
  streamProposal,
  generateProposal,
  markProposalSent,
} from "@/services/api";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  onProposalGenerated?: (jobId: number) => void;
}

export default function JobCard({ job, onProposalGenerated }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(
    null,
  );

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setShowProposal(true);
    setGeneratedProposal(""); // Clear previous proposal

    try {
      // Use streaming for real-time generation
      await streamProposal(
        job.id,
        job.description,
        (chunk) => {
          // Append each chunk as it arrives (creates typing effect)
          setGeneratedProposal((prev) => prev + chunk);
        },
        () => {
          // Called when streaming completes
          setIsGenerating(false);
          onProposalGenerated?.(job.id);
        },
      );
    } catch (error) {
      console.error("Error generating proposal:", error);

      // Fallback to non-streaming API if streaming fails
      try {
        const response = await generateProposal({ job_id: job.id });
        setGeneratedProposal(response.data.content);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        setGeneratedProposal("Error generating proposal. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSendProposal = async () => {
    if (!generatedProposal) return;
    // Mark as sent (you'd typically open Upwork URL)
    try {
      await markProposalSent(job.id);
      window.open(job.url, "_blank");
    } catch (error) {
      console.error("Error marking proposal as sent:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div
      className={`
        group relative bg-[#1A1D24] rounded-xl border transition-all duration-300
        ${isHovered ? "border-blue-500/40 shadow-xl shadow-blue-500/5 translate-y-[-2px]" : "border-gray-700/50"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-gray-100 line-clamp-1">
                {job.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">
                  {job.budget || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(job.posted_at)}</span>
              </div>
              {job.client_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span>{job.client_rating}</span>
                  {job.client_spent && (
                    <span className="text-gray-600">
                      ({job.client_spent} spent)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <MatchBadge score={job.match_score} size="md" />
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-gray-400 line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {job.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-800/50 text-gray-400 border border-gray-700/50"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2 py-0.5 text-[11px] text-gray-500">
              +{job.skills.length - 4}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800/50">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            View on Upwork
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className={`
              relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              flex items-center gap-2 overflow-hidden
              ${
                isGenerating
                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Proposal</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Proposal Preview */}
        {showProposal && generatedProposal && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <p className="text-xs text-gray-400 mb-2">
              ✨ AI Generated Proposal:
            </p>
            <p className="text-sm text-gray-300 line-clamp-3">
              {generatedProposal}
            </p>
            <button
              onClick={handleSendProposal}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Copy & Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
