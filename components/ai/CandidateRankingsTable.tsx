"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Trophy, User, ExternalLink } from "lucide-react";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface ApplicantRanking {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  university: string;
  major: string;
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  recruiterTakeaway: string;
  status: string;
}

interface CandidateRankingsTableProps {
  internshipId: string;
}

export const CandidateRankingsTable: React.FC<CandidateRankingsTableProps> = React.memo(({ internshipId }) => {
  const [rankings, setRankings] = useState<ApplicantRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/rankings/${internshipId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRankings(json.data);
      } else {
        setError(json.error?.message || "Failed to load candidate rankings");
      }
    } catch {
      setError("Network error fetching candidate rankings");
    } finally {
      setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  if (loading) {
    return (
      <div className="bg-card border rounded-xl p-8 text-center space-y-3">
        <Sparkles className="w-6 h-6 text-primary animate-pulse mx-auto" />
        <p className="text-xs font-medium text-muted-foreground">Ranking applicants with Gemini AI...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">{error}</div>;
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6 text-center text-xs text-muted-foreground">
        No applicants found for this internship posting yet.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm space-y-4 p-5">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Top Ranked Candidates</h3>
            <p className="text-xs text-muted-foreground">
              Sorted automatically by AI Skill & Requirement Fit
            </p>
          </div>
        </div>
        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full border">
          {rankings.length} Total Applicants
        </span>
      </div>

      <div className="space-y-3">
        {rankings.map((cand, idx) => (
          <div
            key={cand.applicationId}
            className="border rounded-lg p-4 bg-background hover:border-primary/40 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">{cand.studentName}</h4>
                    <span className="text-xs text-muted-foreground">({cand.university})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cand.major}</p>
                </div>
              </div>
              <MatchScoreBadge score={cand.matchScore} />
            </div>

            {cand.recruiterTakeaway && (
              <div className="bg-muted/30 p-2.5 rounded-md border text-xs text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Recruiter Takeaway: {cand.recruiterTakeaway}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-muted-foreground font-medium">Matching:</span>
              {cand.matchingSkills?.slice(0, 4).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-medium rounded">
                  {sk}
                </span>
              ))}
              {cand.missingSkills && cand.missingSkills.length > 0 && (
                <>
                  <span className="text-muted-foreground font-medium ml-2">Missing:</span>
                  {cand.missingSkills.slice(0, 2).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-medium rounded">
                      {sk}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CandidateRankingsTable.displayName = "CandidateRankingsTable";
