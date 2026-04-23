import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { useSyncContext } from "@/context/SyncContext";
import { Server, Shield, AlertTriangle, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const { status, error, nexposeData, sentinelData, gapData, lastSyncTime, runSync } = useSyncContext();
  const syncing = status === "syncing";
  const loading = status === "loading";

  const nexposeCount = nexposeData?.total_ip_count ?? nexposeData?.ip_count ?? 0;
  const sentinelCount = sentinelData?.total_row_count ?? sentinelData?.row_count ?? 0;
  const gapCount = gapData?.missing_ip_count ?? 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground">
            Asset correlation overview across Nexpose and Sentinel
          </p>
        </div>
        <Button onClick={runSync} disabled={syncing || loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : syncing ? "Syncing…" : "Run Sync"}
        </Button>
      </div>

      {/* Error */}
      {status === "error" && error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Sync failed: {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Nexpose Assets"
          value={nexposeCount}
          subtitle={nexposeData ? `${nexposeData.site_ids_processed?.length ?? 0} sites processed` : "No data yet"}
          icon={<Server className="h-4 w-4" />}
        />
        <StatCard
          label="Sentinel Assets"
          value={sentinelCount}
          subtitle={sentinelData ? `${sentinelData.columns.length} columns` : "No data yet"}
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Gap Assets"
          value={gapCount}
          subtitle="IPs missing in Nexpose"
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={gapCount > 0 ? "destructive" : "default"}
        />
        <StatCard
          label="Sync Status"
          value={
            status === "idle"
              ? "Not synced"
              : status === "syncing"
              ? "Running…"
              : status === "success"
              ? "Healthy"
              : "Error"
          }
          subtitle={lastSyncTime ? format(lastSyncTime, "MMM d, HH:mm") : "—"}
          icon={<Activity className="h-4 w-4" />}
          variant={
            status === "error"
              ? "destructive"
              : status === "success"
              ? "success"
              : "default"
          }
        />
      </div>

      {/* Sync progress steps */}
      {syncing && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-[13px] font-semibold text-foreground mb-3">Sync in progress…</h2>
          <div className="space-y-2 text-[13px] text-muted-foreground">
            <p>⏳ Fetching Nexpose assets…</p>
            <p>⏳ Fetching Sentinel assets…</p>
            <p>⏳ Comparing datasets…</p>
          </div>
        </div>
      )}

      {/* Summary after sync */}
      {status === "success" && gapData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Nexpose Summary</h2>
            <p className="text-[12px] text-muted-foreground">
              File: <span className="font-mono">{nexposeData?.output_file}</span>
            </p>
            <p className="text-[12px] text-muted-foreground">
              Sites: {nexposeData?.site_ids_processed.join(", ")}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Total IPs: <span className="font-semibold text-foreground">{nexposeCount}</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Gap Analysis</h2>
            <p className="text-[12px] text-muted-foreground">
              Total Sentinel rows scanned: {gapData.total_rows_scanned}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Missing IPs found: <span className="font-semibold text-destructive">{gapData.missing_ip_count}</span>
            </p>
            <p className="text-[12px] text-muted-foreground">
              Output: <span className="font-mono">{gapData.output_file}</span>
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
