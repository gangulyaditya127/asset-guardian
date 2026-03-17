import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/Badges";
import { mockSyncLogs, mockNotificationLogs } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Logs() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-[13px] text-muted-foreground">
          Sync history and notification records
        </p>
      </div>

      <Tabs defaultValue="syncs">
        <TabsList className="mb-4">
          <TabsTrigger value="syncs" className="text-[13px]">Sync History</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[13px]">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="syncs">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Started</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Completed</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Trigger</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nexpose</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sentinel</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Gaps</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Error</th>
                </tr>
              </thead>
              <tbody>
                {mockSyncLogs.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-[12px]">{format(new Date(s.startedAt), "MMM d, HH:mm:ss")}</td>
                    <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                      {s.completedAt ? format(new Date(s.completedAt), "HH:mm:ss") : "—"}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.triggeredBy}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px]">{s.nexposeAssets}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px]">{s.sentinelAssets}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px]">{s.gapsFound}</td>
                    <td className="px-4 py-2.5 text-destructive text-[12px]">{s.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Method</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mockNotificationLogs.map((n, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{n.ip}</td>
                    <td className="px-4 py-2.5 text-[12px]">{n.ownerEmail}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{n.method}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={n.status} /></td>
                    <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                      {format(new Date(n.timestamp), "MMM d, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
