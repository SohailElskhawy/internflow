"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, TrendingUp, AlertTriangle, GraduationCap, Users } from "lucide-react";

interface CompanyAiInsightsResult {
  totalApplicantsAnalyzed: number;
  averageMatchScore: number;
  topSkills: Array<{ skill: string; count: number }>;
  missingSkillGaps: Array<{ skill: string; count: number }>;
  topUniversities: Array<{ university: string; count: number }>;
}

export const CompanyAiInsightsWidget: React.FC = React.memo(() => {
  const [insights, setInsights] = useState<CompanyAiInsightsResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/company-insights");
      const json = await res.json();
      if (json.success && json.data) {
        setInsights(json.data);
      }
    } catch {
      // fallback handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading || !insights) return null;

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base">AI Recruitment Analytics</h3>
            <p className="text-xs text-muted-foreground">Aggregated metrics across all applicant pools</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/20 border rounded-lg space-y-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5" /> Total Analyzed
          </span>
          <p className="text-xl font-bold text-foreground">{insights.totalApplicantsAnalyzed}</p>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-1">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Avg Match Score
          </span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {insights.averageMatchScore}%
          </p>
        </div>

        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-1">
          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
            Most Common Skill
          </span>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400 truncate">
            {insights.topSkills[0]?.skill || "React"}
          </p>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> Top Skill Gap
          </span>
          <p className="text-base font-bold text-amber-600 dark:text-amber-400 truncate">
            {insights.missingSkillGaps[0]?.skill || "Docker"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2 p-4 bg-muted/20 border rounded-lg">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Top Applicant Skills
          </h4>
          <div className="space-y-2">
            {insights.topSkills.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.skill}</span>
                <span className="text-muted-foreground">{item.count} applicants</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 bg-muted/20 border rounded-lg">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary" /> Top Universities
          </h4>
          <div className="space-y-2">
            {insights.topUniversities.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {item.university}
                </span>
                <span className="text-muted-foreground">{item.count} applicants</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CompanyAiInsightsWidget.displayName = "CompanyAiInsightsWidget";
