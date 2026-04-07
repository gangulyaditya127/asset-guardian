import { AppLayout } from "@/components/AppLayout";
import { useSyncContext } from "@/context/SyncContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { fetchRecordById } from "@/services/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function arrayToSheet(data: Array<Record<string, any>>) {
  const ws = XLSX.utils.json_to_sheet(data);
  return ws;
}

async function downloadRecordAsZip(recordId: number) {
  const resp = await fetchRecordById(recordId);
  const { excel_data, database_data } = resp;
  const zip = new JSZip();

  const addSheet = (name: string, data: any[] | null) => {
    if (!data || data.length === 0) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, arrayToSheet(data), "Sheet1");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    zip.file(name, buf);
  };

  addSheet(database_data.Nex_FileName || "nexpose.xlsx", excel_data.nex_file);
  addSheet(database_data.Sent_FileName || "sentinel.xlsx", excel_data.sent_file);
  addSheet(database_data.Gap_FileName || "gap.xlsx", excel_data.gap_file);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `sync_record_${recordId}.zip`);
}

export default function Logs() {
  const { records, status } = useSyncContext();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      await downloadRecordAsZip(id);
      toast.success("Downloaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    } finally {
      setDownloadingId(null);
    }
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
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Export</th>
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
                  <td className="px-4 py-2.5 text-[12px] max-w-[160px] truncate" title={r.Nex_FileName || ""}>
                    {r.Nex_FileName || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] max-w-[160px] truncate" title={r.Sent_FileName || ""}>
                    {r.Sent_FileName || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] max-w-[160px] truncate" title={r.Gap_FileName || ""}>
                    {r.Gap_FileName || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-destructive max-w-[200px] truncate">
                    {r.Error || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleDownload(r.id)}
                      disabled={downloadingId === r.id}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      title="Download Excel files as ZIP"
                    >
                      {downloadingId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
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
