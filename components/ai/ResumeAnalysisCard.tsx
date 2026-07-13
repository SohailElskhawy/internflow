"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface ResumeAnalysisData {
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  strengths: string[];
  weaknesses: string[];
  suggestedRoles?: string[];
}

interface ResumeAnalysisCardProps {
  initialAnalysis?: ResumeAnalysisData | null;
  onAnalysisUpdated?: (data: ResumeAnalysisData) => void;
}

export const ResumeAnalysisCard: React.FC<ResumeAnalysisCardProps> = React.memo(
  ({ initialAnalysis, onAnalysisUpdated }) => {
    const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(initialAnalysis || null);
    const [loading, setLoading] = useState(false);
    const [rawText, setRawText] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(
      async (file?: File) => {
        setLoading(true);
        setError(null);

        try {
          let res: Response;
          if (file) {
            const formData = new FormData();
            formData.append("file", file);
            res = await fetch("/api/ai/analyze", {
              method: "POST",
              body: formData,
            });
          } else {
            res = await fetch("/api/ai/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resumeText: rawText }),
            });
          }

          const json = await res.json();
          if (json.success && json.data) {
            const data: ResumeAnalysisData = {
              summary: json.data.summary,
              skills: typeof json.data.skills === "string" ? JSON.parse(json.data.skills) : json.data.skills,
              strengths: typeof json.data.strengths === "string" ? JSON.parse(json.data.strengths) : json.data.strengths,
              weaknesses: typeof json.data.weaknesses === "string" ? JSON.parse(json.data.weaknesses) : json.data.weaknesses,
              suggestedRoles: typeof json.data.suggestedRoles === "string" ? JSON.parse(json.data.suggestedRoles) : json.data.suggestedRoles,
            };
            setAnalysis(data);
            if (onAnalysisUpdated) onAnalysisUpdated(data);
            setShowTextInput(false);
            setRawText("");
          } else {
            setError(json.error?.message || "Failed to analyze resume.");
          }
        } catch {
          setError("Network error occurred during AI analysis.");
        } finally {
          setLoading(false);
        }
      },
      [rawText, onAnalysisUpdated]
    );

    const handleFileUpload = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          handleAnalyze(file);
        }
      },
      [handleAnalyze]
    );

    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Resume Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Deep structured insights extracted automatically from your CV
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-primary text-primary-foreground text-xs font-medium px-3.5 py-2 rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? "Analyzing..." : "Upload CV (PDF)"}</span>
              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                disabled={loading}
                onChange={handleFileUpload}
              />
            </label>
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-xs border px-3 py-2 rounded-lg hover:bg-muted font-medium transition"
            >
              Paste Text
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        {showTextInput && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={4}
              className="w-full text-xs p-3 rounded-md border bg-background focus:ring-1 focus:ring-primary outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTextInput(false)}
                className="text-xs px-3 py-1.5 border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={loading || rawText.length < 20}
                onClick={() => handleAnalyze()}
                className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 font-medium"
              >
                {loading ? "Analyzing..." : "Analyze Text"}
              </button>
            </div>
          </div>
        )}

        {analysis ? (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Professional Summary
              </h4>
              <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-lg border">
                {analysis.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills?.technical?.map((sk, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-medium rounded-md"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills?.tools?.map((tool, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-muted text-muted-foreground border font-medium rounded-md"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Soft Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills?.soft?.map((soft, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-md"
                    >
                      {soft}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Profile Strengths</span>
                </div>
                <ul className="space-y-1 text-xs text-foreground">
                  {analysis.strengths?.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Areas for Improvement</span>
                </div>
                <ul className="space-y-1 text-xs text-foreground">
                  {analysis.weaknesses?.map((wk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analysis.suggestedRoles && analysis.suggestedRoles.length > 0 && (
              <div className="p-3 bg-muted/40 rounded-lg flex items-center gap-2 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Recommended Roles:</span>
                <span className="text-muted-foreground">
                  {analysis.suggestedRoles.join(" • ")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/20 border border-dashed rounded-lg space-y-3">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">No Resume Analysis Saved</p>
              <p className="text-xs text-muted-foreground">
                Upload your CV (PDF) above to generate automatic structured AI feedback!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ResumeAnalysisCard.displayName = "ResumeAnalysisCard";
