import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "destructive" | "success" | "warning";
}

export function StatCard({ label, value, subtitle, icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "text-3xl font-bold tracking-tight",
              variant === "destructive" && "text-destructive",
              variant === "success" && "text-success",
              variant === "warning" && "text-warning",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[12px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "rounded-md p-2",
            variant === "destructive" && "bg-destructive/10 text-destructive",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "default" && "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "text-[11px] font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.positive ? "↓" : "↑"} {trend.value}
          </span>
          <span className="text-[11px] text-muted-foreground">vs last sync</span>
        </div>
      )}
    </div>
  );
}
