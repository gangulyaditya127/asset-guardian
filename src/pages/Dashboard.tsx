import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, SeverityBadge } from "@/components/Badges";
import { mockNexposeAssets, mockSentinelAssets, mockGapAssets, mockSyncLogs } from "@/data/mockData";
import { Server, Shield, AlertTriangle, RefreshCw, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const openGaps = mockGapAssets.filter((g) => g.status === "open").length;
  const criticalGaps = mockGapAssets.filter((g) => g.severity === "critical" || g.severity === "high").length;
  const lastSync = mockSyncLogs[0];

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
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Run Sync"}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Nexpose Assets"
          value={mockNexposeAssets.length}
          subtitle="Across 4 sites"
          icon={<Server className="h-4 w-4" />}
        />
        <StatCard
          label="Sentinel Assets"
          value={mockSentinelAssets.length}
          subtitle="From 4 sources"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Gap Assets"
          value={openGaps}
          subtitle={`${criticalGaps} critical/high`}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="destructive"
          trend={{ value: "+1", positive: false }}
        />
        <StatCard
          label="Sync Status"
          value={lastSync.status === "completed" ? "Healthy" : "Error"}
          subtitle={`${format(new Date(lastSync.startedAt), "MMM d, HH:mm")}`}
          icon={<Activity className="h-4 w-4" />}
          variant={lastSync.status === "completed" ? "success" : "destructive"}
        />
      </div>

      {/* Two columns: Gap list + Recent syncs */}
      <div className="grid grid-cols-3 gap-4">
        {/* Gap Assets Table */}
        <div className="col-span-2 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold text-foreground">Recent Gap Assets</h2>
            <span className="text-[11px] text-muted-foreground">{mockGapAssets.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP Address</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hostname</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Severity</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody>
                {mockGapAssets.map((gap) => (
                  <tr key={gap.ip} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{gap.ip}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{gap.hostname}</td>
                    <td className="px-4 py-2.5"><SeverityBadge severity={gap.severity} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={gap.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{gap.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Syncs */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold text-foreground">Sync History</h2>
          </div>
          <div className="divide-y divide-border">
            {mockSyncLogs.map((sync) => (
              <div key={sync.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">
                      {format(new Date(sync.startedAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <StatusBadge status={sync.status} />
                </div>
                <div className="flex gap-3 text-[11px] text-muted-foreground">
                  <span>{sync.nexposeAssets} NX</span>
                  <span>{sync.sentinelAssets} SN</span>
                  <span className={sync.gapsFound > 0 ? "text-destructive font-medium" : ""}>
                    {sync.gapsFound} gaps
                  </span>
                </div>
                {sync.error && (
                  <p className="text-[11px] text-destructive">{sync.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
