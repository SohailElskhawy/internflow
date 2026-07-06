"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface JobMatchData {
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  recruiterTakeaway?: string;
}

interface MissingSkillsCardProps {
  internshipId: string;
  onOpenCoverLetterModal?: () => void;
  onOpenInterviewPrepModal?: () => void;
}

export const MissingSkillsCard: React.FC<MissingSkillsCardProps> = React.memo(
  ({ internshipId, onOpenCoverLetterModal, onOpenInterviewPrepModal }) => {
    const [match, setMatch] = useState<JobMatchData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrCalculateMatch = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ai/match?internshipId=${internshipId}`);
        const json = await res.json();

        if (json.success && json.data) {
          const data: JobMatchData = {
            matchScore: json.data.matchScore,
            summary: json.data.summary,
            matchingSkills: typeof json.data.matchingSkills === "string" ? JSON.parse(json.data.matchingSkills) : json.data.matchingSkills,
            missingSkills: typeof json.data.missingSkills === "string" ? JSON.parse(json.data.missingSkills) : json.data.missingSkills,
            improvementSuggestions: typeof json.data.improvementSuggestions === "string" ? JSON.parse(json.data.improvementSuggestions) : json.data.improvementSuggestions,
            recruiterTakeaway: json.data.recruiterTakeaway,
          };
          setMatch(data);
        } else {
          setError(json.error?.message || "Failed to load job match analysis");
        }
      } catch {
        setError("Network error fetching match analysis");
      } finally {
        setLoading(false);
      }
    }, [internshipId]);

    useEffect(() => {
      fetchOrCalculateMatch();
    }, [fetchOrCalculateMatch]);

    if (loading) {
      return (
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-center gap-3 py-10">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Calculating AI Match Score...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-card border rounded-xl p-4 text-xs text-red-500 bg-red-500/5">
          {error}
        </div>
      );
    }

    if (!match) return null;

    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">AI Qualifications & Fit</h3>
              <p className="text-xs text-muted-foreground">Calculated fit based on your profile & CV</p>
            </div>
          </div>
          <MatchScoreBadge score={match.matchScore} />
        </div>

        <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border">
          {match.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matching Qualifications</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {match.matchingSkills.map((sk, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium rounded">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Recommended Skills to Learn</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {match.missingSkills.map((sk, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium rounded">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {match.improvementSuggestions && match.improvementSuggestions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Actionable Recommendations
            </span>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {match.improvementSuggestions.map((sug, i) => (
                <li key={i} className="flex items-center gap-2 text-foreground">
                  <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-3 border-t">
          {onOpenCoverLetterModal && (
            <button
              onClick={onOpenCoverLetterModal}
              className="text-xs font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Cover Letter</span>
            </button>
          )}

          {onOpenInterviewPrepModal && (
            <button
              onClick={onOpenInterviewPrepModal}
              className="text-xs font-medium px-4 py-2 border bg-muted/40 hover:bg-muted rounded-lg transition inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Prepare for Interview</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

MissingSkillsCard.displayName = "MissingSkillsCard";
