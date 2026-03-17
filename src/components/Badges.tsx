import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low";
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        severity === "critical" && "bg-destructive/15 text-destructive",
        severity === "high" && "bg-destructive/10 text-destructive",
        severity === "medium" && "bg-warning/15 text-warning",
        severity === "low" && "bg-muted text-muted-foreground"
      )}
    >
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: "open" | "acknowledged" | "resolved" | "running" | "completed" | "failed" | "sent" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
        (status === "open" || status === "running" || status === "pending") && "bg-secondary/15 text-secondary",
        (status === "resolved" || status === "completed" || status === "sent") && "bg-success/15 text-success",
        status === "acknowledged" && "bg-warning/15 text-warning",
        status === "failed" && "bg-destructive/15 text-destructive"
      )}
    >
      {(status === "running") && (
        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse-slow" />
      )}
      {status}
    </span>
  );
}
