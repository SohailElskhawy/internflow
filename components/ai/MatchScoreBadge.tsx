import React from "react";

interface MatchScoreBadgeProps {
  score: number;
  showStars?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = React.memo(({ score, showStars = true }) => {
  let colorStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  let stars = "★★★★★";

  if (score >= 90) {
    colorStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    stars = "★★★★★";
  } else if (score >= 75) {
    colorStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    stars = "★★★★☆";
  } else if (score >= 60) {
    colorStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    stars = "★★★☆☆";
  } else {
    colorStyle = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    stars = "★★☆☆☆";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${colorStyle}`}>
      <span>Match {score}%</span>
      {showStars && <span className="text-[10px] tracking-widest">{stars}</span>}
    </div>
  );
});

MatchScoreBadge.displayName = "MatchScoreBadge";
