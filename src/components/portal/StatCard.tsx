import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "violet",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "violet" | "emerald" | "amber" | "sky" | "pink";
}) {
  const bg = {
    violet: "stat-pill-violet",
    emerald: "stat-pill-emerald",
    amber: "stat-pill-amber",
    sky: "stat-pill-sky",
    pink: "stat-pill-pink",
  }[tone];
  return (
    <div className="rounded-2xl bg-card border p-5 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-bold mt-1">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
      </div>
      <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0", bg)}>{icon}</div>
    </div>
  );
}