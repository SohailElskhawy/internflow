import { memo } from "react";
import { Status } from "@prisma/client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
    status: Status | "PENDING" | "ACCEPTED" | "REJECTED";
}

export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case "ACCEPTED":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                </span>
            );
        case "REJECTED":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" /> Pending
                </span>
            );
    }
});
