"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplyButtonProps {
  internshipId: string;
  isStudent: boolean;
  hasApplied?: boolean;
}

export function ApplyButton({ internshipId, isStudent, hasApplied = false }: ApplyButtonProps) {
  const [applied, setApplied] = useState(hasApplied);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!isStudent) {
    return (
      <Button asChild size="lg" variant="secondary">
        <Link href="/login">Log in as Student to Apply</Link>
      </Button>
    );
  }

  if (applied) {
    return (
      <Button size="lg" variant="outline" disabled className="gap-2 border-emerald-500/50 text-emerald-600">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Application Submitted
      </Button>
    );
  }

  const handleApply = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch(`/api/students/apply/${internshipId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        let msg = result.error || "Failed to submit application.";
        if (result.details?.studentProfile) {
          msg = result.details.studentProfile[0];
        }
        setErrorMsg(msg);
        return;
      }

      setApplied(true);
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred while applying.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="lg" onClick={handleApply} disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Apply Now
          </>
        )}
      </Button>
      {errorMsg && (
        <p className="text-xs font-medium text-rose-500 max-w-xs text-right">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
