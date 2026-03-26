import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSyncContext } from "@/context/SyncContext";
import { sendAutoMail } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, ExternalLink, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

export default function Gaps() {
  const { gapData, status } = useSyncContext();
  const [search, setSearch] = useState("");
  const [selectedGap, setSelectedGap] = useState<Record<string, any> | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [notifying, setNotifying] = useState(false);

  const gapRows = gapData?.data ?? [];

  const filtered = gapRows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => {
      const searchLower = search.toLowerCase();
      return Object.values(row).some(
        (v) => v != null && String(v).toLowerCase().includes(searchLower)
      );
    });

  const toggleSelection = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const toggleAll = () => {
    if (selectedIndices.size === filtered.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(filtered.map((f) => f.idx)));
    }
  };

  const handleNotify = async () => {
    const selectedRows = gapRows.filter((_, i) => selectedIndices.has(i));
    if (selectedRows.length === 0) return;
    setNotifying(true);
    try {
      const res = await sendAutoMail(selectedRows);
      toast.success(`Notifications sent to ${res.owners_processed} owner(s)`);
      setSelectedIndices(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  const noData = status === "idle" || gapRows.length === 0;

  // Show first 6 columns dynamically
  const columns = gapData?.data?.[0] ? Object.keys(gapData.data[0]).slice(0, 6) : [];

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gap Assets</h1>
          <p className="text-[13px] text-muted-foreground">
            IPs detected in Sentinel but missing from Nexpose inventory
          </p>
        </div>
        {selectedIndices.size > 0 && (
          <Button className="gap-2" onClick={handleNotify} disabled={notifying}>
            {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Notify Owners ({selectedIndices.size})
          </Button>
        )}
      </div>

      {noData && status !== "syncing" && (
        <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
          {status === "idle"
            ? "No data available. Run a sync from the Dashboard first."
            : "No gap assets found — all Sentinel IPs are covered in Nexpose."}
        </div>
      )}

      {!noData && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search IP or hostname…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
            </div>
            <span className="text-[12px] text-muted-foreground">
              {gapData?.missing_ip_count} missing IPs
            </span>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left w-10">
                    <Checkbox
                      checked={selectedIndices.size === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ row, idx }) => (
                  <tr
                    key={idx}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedGap(row)}
                  >
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIndices.has(idx)}
                        onCheckedChange={() => toggleSelection(idx)}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2.5 text-[12px] whitespace-nowrap">
                        {row[col] != null ? String(row[col]) : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-muted-foreground text-[13px]">
                      No gap assets match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Drawer */}
      <Sheet open={!!selectedGap} onOpenChange={() => setSelectedGap(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedGap && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[15px] font-mono">
                  {selectedGap["IP Address"] || selectedGap["Host Name"] || "Detail"}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {Object.entries(selectedGap).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {key}
                    </p>
                    <p className="text-[13px] text-foreground mt-0.5 font-mono break-all">
                      {val != null ? String(val) : "—"}
                    </p>
                  </div>
                ))}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    className="flex-1 gap-2"
                    size="sm"
                    onClick={async () => {
                      setNotifying(true);
                      try {
                        const res = await sendAutoMail([selectedGap]);
                        toast.success(`Notification sent to ${res.owners_processed} owner(s)`);
                      } catch (err: any) {
                        toast.error(err.message || "Failed");
                      } finally {
                        setNotifying(false);
                      }
                    }}
                    disabled={notifying}
                  >
                    {notifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
                    Notify Owner
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedGap(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
