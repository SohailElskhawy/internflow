"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Copy, Check, X, Edit3 } from "lucide-react";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = React.memo(({ isOpen, onClose, internshipId }) => {
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId, customNotes }),
      });
      const json = await res.json();
      if (json.success && json.data?.coverLetter) {
        setCoverLetter(json.data.coverLetter);
      } else {
        setError(json.error?.message || "Failed to generate cover letter.");
      }
    } catch {
      setError("Network error generating cover letter.");
    } finally {
      setLoading(false);
    }
  }, [internshipId, customNotes]);

  const handleCopy = useCallback(() => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coverLetter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">AI Cover Letter Generator</h3>
              <p className="text-xs text-muted-foreground">Tailored for this specific internship position</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg shrink-0">
            {error}
          </div>
        )}

        {!coverLetter && !loading && (
          <div className="space-y-4 shrink-0">
            <p className="text-xs text-muted-foreground">
              Click generate to create an AI-written cover letter matching your profile skills with the internship requirements.
            </p>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Optional: Custom notes to emphasize (e.g. "Highlight my React project")
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Add any specific project or note..."
                rows={2}
                className="w-full text-xs p-3 rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="w-full py-2.5 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Cover Letter</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center space-y-3 my-auto">
            <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-xs font-medium text-muted-foreground">Crafting custom cover letter with Gemini AI...</p>
          </div>
        )}

        {coverLetter && !loading && (
          <div className="flex-1 flex flex-col space-y-3 min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Generated Cover Letter (Editable)</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-medium px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md border flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
              </button>
            </div>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={12}
              className="w-full flex-1 text-xs p-4 rounded-lg border bg-background font-mono leading-relaxed focus:ring-1 focus:ring-primary outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-2 shrink-0">
              <button
                onClick={handleGenerate}
                className="text-xs font-medium px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Regenerate
              </button>
              <button
                onClick={onClose}
                className="text-xs font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CoverLetterModal.displayName = "CoverLetterModal";
