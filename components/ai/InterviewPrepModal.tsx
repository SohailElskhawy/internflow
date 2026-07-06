"use client";

import React, { useState, useCallback, useEffect } from "react";
import { BookOpen, Sparkles, X, ChevronDown, ChevronUp, CheckCircle, HelpCircle, Code2, Users } from "lucide-react";

interface TechnicalQuestion {
  id: number;
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
}

interface BehavioralQuestion {
  id: number;
  question: string;
  framework: string;
  sampleAnswer: string;
}

interface StudyTopic {
  topic: string;
  description: string;
  importance: string;
}

interface InterviewPrepData {
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: BehavioralQuestion[];
  studyTopics: StudyTopic[];
}

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = React.memo(({ isOpen, onClose, internshipId }) => {
  const [prep, setPrep] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tech" | "behavioral" | "study">("tech");
  const [expandedTech, setExpandedTech] = useState<Record<number, boolean>>({ 1: true });
  const [expandedBeh, setExpandedBeh] = useState<Record<number, boolean>>({ 1: true });
  const [error, setError] = useState<string | null>(null);

  const fetchPrep = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/interview-prep?internshipId=${internshipId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const data: InterviewPrepData = {
          technicalQuestions: typeof json.data.technicalQuestions === "string" ? JSON.parse(json.data.technicalQuestions) : json.data.technicalQuestions,
          behavioralQuestions: typeof json.data.behavioralQuestions === "string" ? JSON.parse(json.data.behavioralQuestions) : json.data.behavioralQuestions,
          studyTopics: typeof json.data.studyTopics === "string" ? JSON.parse(json.data.studyTopics) : json.data.studyTopics,
        };
        setPrep(data);
      } else {
        setError(json.error?.message || "Failed to load interview preparation kit");
      }
    } catch {
      setError("Network error fetching interview prep kit");
    } finally {
      setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    if (isOpen && !prep) {
      fetchPrep();
    }
  }, [isOpen, prep, fetchPrep]);

  const toggleTech = useCallback((id: number) => {
    setExpandedTech((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleBeh = useCallback((id: number) => {
    setExpandedBeh((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-xl max-w-3xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>AI Interview Preparation Kit</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  Tailored Fit
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                10 Technical Qs, 5 Behavioral Frameworks & Study Topics
              </p>
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

        {loading && (
          <div className="py-20 text-center space-y-3 my-auto">
            <Sparkles className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-medium text-muted-foreground">
              Generating tailored interview questions & answers with Gemini AI...
            </p>
          </div>
        )}

        {prep && !loading && (
          <>
            <div className="flex items-center border-b shrink-0 gap-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab("tech")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === "tech"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Technical Questions ({prep.technicalQuestions?.length || 10})</span>
              </button>
              <button
                onClick={() => setActiveTab("behavioral")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === "behavioral"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Behavioral Questions ({prep.behavioralQuestions?.length || 5})</span>
              </button>
              <button
                onClick={() => setActiveTab("study")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === "study"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Study & Revision Topics</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeTab === "tech" && (
                <div className="space-y-3">
                  {prep.technicalQuestions?.map((tq) => {
                    const isExp = !!expandedTech[tq.id];
                    return (
                      <div key={tq.id} className="border rounded-lg p-4 bg-muted/20 space-y-3">
                        <button
                          onClick={() => toggleTech(tq.id)}
                          className="w-full flex items-start justify-between text-left gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
                              Q{tq.id}
                            </span>
                            <h4 className="text-xs font-semibold text-foreground leading-snug">
                              {tq.question}
                            </h4>
                          </div>
                          {isExp ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>

                        {isExp && (
                          <div className="space-y-3 pt-2 border-t text-xs">
                            <div className="bg-background p-3.5 rounded-md border space-y-1.5">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Model Answer:
                              </span>
                              <p className="text-muted-foreground leading-relaxed">
                                {tq.sampleAnswer}
                              </p>
                            </div>
                            {tq.keyPoints && tq.keyPoints.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="font-medium text-muted-foreground">Key concepts:</span>
                                {tq.keyPoints.map((kp, idx) => (
                                  <span key={idx} className="bg-muted px-2 py-0.5 rounded border text-[11px]">
                                    {kp}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "behavioral" && (
                <div className="space-y-3">
                  {prep.behavioralQuestions?.map((bq) => {
                    const isExp = !!expandedBeh[bq.id];
                    return (
                      <div key={bq.id} className="border rounded-lg p-4 bg-muted/20 space-y-3">
                        <button
                          onClick={() => toggleBeh(bq.id)}
                          className="w-full flex items-start justify-between text-left gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded shrink-0">
                              BQ{bq.id}
                            </span>
                            <h4 className="text-xs font-semibold text-foreground leading-snug">
                              {bq.question}
                            </h4>
                          </div>
                          {isExp ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>

                        {isExp && (
                          <div className="space-y-3 pt-2 border-t text-xs">
                            <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-md">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                Recommended Strategy ({bq.framework}):
                              </span>
                            </div>
                            <div className="bg-background p-3.5 rounded-md border space-y-1">
                              <span className="font-semibold text-muted-foreground">Example Response:</span>
                              <p className="text-muted-foreground leading-relaxed">{bq.sampleAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "study" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prep.studyTopics?.map((st, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground">{st.topic}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                          {st.importance} Priority
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{st.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t shrink-0">
              <button
                onClick={onClose}
                className="text-xs font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Close Preparation Kit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

InterviewPrepModal.displayName = "InterviewPrepModal";
