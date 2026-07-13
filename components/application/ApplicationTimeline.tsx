"use client";

import { useEffect, useState } from "react";
import { FileText, Eye, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLogItem {
  id: string;
  action: string;
  metadata: any;
  createdAt: string;
}

interface ApplicationTimelineProps {
  applicationId: string;
}

export function ApplicationTimeline({ applicationId }: ApplicationTimelineProps) {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/applications/${applicationId}/timeline`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load timeline");
        return res.json();
      })
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setLogs(resData.data);
        }
      })
      .catch((err) => {
        console.error("Error loading timeline:", err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-xs font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        Retrieving application journey...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-rose-500 font-semibold py-4 text-center">
        Failed to load timeline.
      </div>
    );
  }

  // Find logs matching our journey steps
  const submittedLog = logs.find((l) => l.action === "APPLICATION_SUBMITTED");
  const viewedLog = logs.find((l) => l.action === "APPLICATION_VIEWED");
  const reviewLog = logs.find((l) => l.action === "APPLICATION_UNDER_REVIEW");
  const acceptedLog = logs.find((l) => l.action === "APPLICATION_ACCEPTED");
  const rejectedLog = logs.find((l) => l.action === "APPLICATION_REJECTED");

  // Determine active states
  const isRejected = !!rejectedLog;
  const isAccepted = !!acceptedLog;
  const isFinished = isAccepted || isRejected;

  const steps = [
    {
      title: "Application Submitted",
      description: "Your application was sent successfully to the employer.",
      log: submittedLog,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
    },
    {
      title: "Viewed by Company",
      description: "A recruitment specialist viewed your candidate profile.",
      log: viewedLog,
      icon: Eye,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
    },
    {
      title: "Under Review",
      description: "The company is assessing your profile against their needs.",
      log: reviewLog,
      icon: Clock,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50",
    },
    ...(isRejected
      ? [
          {
            title: "Application Declined",
            description: "The company chose to move forward with other candidates.",
            log: rejectedLog,
            icon: XCircle,
            color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50",
          },
        ]
      : [
          {
            title: "Accepted 🎉",
            description: "Congratulations! You have been accepted for the internship.",
            log: acceptedLog,
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
          },
        ]),
  ];

  return (
    <div className="bg-card p-5 rounded-xl border border-border/40 shadow-xs max-w-lg mx-auto">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Application Journey
      </h3>
      
      <div className="relative border-l border-border/60 pl-6 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = !!step.log;
          const StepIcon = step.icon;
          
          // Determine if we should show a dotted indicator (not completed and not the final outcome if rejected)
          const isPending = !isCompleted && !isFinished;

          return (
            <div key={idx} className="relative group">
              {/* Stepper Bullet */}
              <span className={cn(
                "absolute -left-[37px] top-0 flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all shadow-xs",
                isCompleted 
                  ? cn("border-transparent font-semibold", step.color)
                  : "bg-background text-muted-foreground border-border"
              )}>
                <StepIcon className="w-3.5 h-3.5" />
              </span>

              {/* Step Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn(
                    "text-sm font-bold tracking-tight transition-colors",
                    isCompleted ? "text-foreground" : "text-muted-foreground/80"
                  )}>
                    {step.title}
                  </h4>
                  {isCompleted && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(step.log!.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
