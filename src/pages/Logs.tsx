import { AppLayout } from "@/components/AppLayout";
import { useSyncContext } from "@/context/SyncContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function CopyableCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 group text-left max-w-[180px]"
        >
          <span className="truncate text-[12px]">{value}</span>
          <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px] break-all text-[11px]">
        <p>{value}</p>
        <p className="text-muted-foreground mt-1">Click to copy</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Logs() {
  const { records, status } = useSyncContext();

  const openRecordDetail = (recordId: number) => {
    window.open(`/record/${recordId}`, "_blank");
  };

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
                <th className="px-4 py-2 w-10"></th>
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
                  <td className="px-4 py-2.5"><CopyableCell value={r.Nex_FileName} /></td>
                  <td className="px-4 py-2.5"><CopyableCell value={r.Sent_FileName} /></td>
                  <td className="px-4 py-2.5"><CopyableCell value={r.Gap_FileName} /></td>
                  <td className="px-4 py-2.5 text-[12px] text-destructive max-w-[200px] truncate">
                    {r.Error || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => openRecordDetail(r.id)}
                          className="p-1 rounded hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>View record details</TooltipContent>
                    </Tooltip>
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
