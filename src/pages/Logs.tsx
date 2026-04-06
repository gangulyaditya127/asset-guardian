import { AppLayout } from "@/components/AppLayout";
import { useSyncContext } from "@/context/SyncContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Logs() {
  const { records, status } = useSyncContext();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-[13px] text-muted-foreground">
          Sync history and execution records
        </p>
      </div>

      {status === "loading" && (
        <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
          Loading records…
        </div>
      )}

      {status !== "loading" && records.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
          No sync history available. Run a sync from the Dashboard to create records.
        </div>
      )}

      {records.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Time</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nexpose</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sentinel</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Gaps</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nex File</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sentinel File</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Gap File</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Error</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-[12px]">{r.id}</td>
                  <td className="px-4 py-2.5 text-[12px] whitespace-nowrap">
                    {format(new Date(r.Time), "MMM d, yyyy HH:mm:ss")}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant={r.Status === "success" ? "default" : "destructive"}
                      className="text-[11px]"
                    >
                      {r.Status || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{r.Nex_Count || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{r.Sen_Coount || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{r.Gap_Count || "—"}</td>
                  <td className="px-4 py-2.5 text-[12px] text-destructive max-w-[200px] truncate">
                    {r.Error || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
