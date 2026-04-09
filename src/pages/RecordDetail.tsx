import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRecordById, sendAutoMail, FirstRecordResponse } from "@/services/api";
import { downloadMailHtml } from "@/utils/downloadMailHtml";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Bell, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FirstRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [selectedGap, setSelectedGap] = useState<Record<string, any> | null>(null);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchRecordById(Number(id))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading record #{id}…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-destructive text-sm">
        {error || "Record not found"}
      </div>
    );
  }

  const { database_data: rec, excel_data } = data;
  const nexposeRows = excel_data.nex_file ?? [];
  const sentinelRows = excel_data.sent_file ?? [];
  const gapRows = excel_data.gap_file ?? [];

  const searchLower = search.toLowerCase();

  const filteredNexpose = (nexposeRows as any[]).filter((a) =>
    Object.values(a).some((v) => v != null && String(v).toLowerCase().includes(searchLower))
  );
  const sentinelCols = sentinelRows.length > 0 ? Object.keys((sentinelRows as any[])[0]) : [];
  const filteredSentinel = (sentinelRows as any[]).filter((a) =>
    Object.values(a).some((v) => v != null && String(v).toLowerCase().includes(searchLower))
  );

  const gapCols = gapRows.length > 0 ? Object.keys((gapRows as any[])[0]).slice(0, 6) : [];
  const filteredGaps = (gapRows as any[])
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) =>
      Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(searchLower))
    );

  const toggleSelection = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const toggleAll = () => {
    if (selectedIndices.size === filteredGaps.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(filteredGaps.map((f) => f.idx)));
    }
  };

  const handleNotify = async () => {
    const selectedRows = (gapRows as any[]).filter((_, i) => selectedIndices.has(i));
    if (selectedRows.length === 0) return;
    setNotifying(true);
    try {
      const res = await sendAutoMail(selectedRows);
      toast.success(`Notifications sent to ${res.owners_processed} owner(s)`);
      await downloadMailHtml(res.results);
      setSelectedIndices(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold">Record #{rec.id}</h1>
            <Badge variant={rec.Status === "success" ? "default" : "destructive"} className="text-[11px]">
              {rec.Status}
            </Badge>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {format(new Date(rec.Time), "MMM d, yyyy HH:mm:ss")} — Nexpose: {rec.Nex_Count} · Sentinel: {rec.Sen_Coount} · Gaps: {rec.Gap_Count}
          </p>
        </div>

        {/* Search + Notify */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[13px]"
            />
          </div>
          {activeTab === "gaps" && selectedIndices.size > 0 && (
            <Button className="gap-2" onClick={handleNotify} disabled={notifying}>
              {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Notify Owners ({selectedIndices.size})
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="inventory" className="text-[13px]">Inventory</TabsTrigger>
            <TabsTrigger value="gaps" className="text-[13px]">Gaps ({gapRows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Tabs defaultValue="nexpose">
              <TabsList className="mb-4">
                <TabsTrigger value="nexpose" className="text-[13px]">
                  Nexpose ({filteredNexpose.length})
                </TabsTrigger>
                <TabsTrigger value="sentinel" className="text-[13px]">
                  Sentinel ({filteredSentinel.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="nexpose">
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Defined IP</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Site ID</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Site Name</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNexpose.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-[12px]">{row["Defined IP"]}</td>
                          <td className="px-4 py-2.5 font-mono text-[12px]">{row["Site ID"]}</td>
                          <td className="px-4 py-2.5">{row["Site Name"]}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row["Owner"]}</td>
                        </tr>
                      ))}
                      {filteredNexpose.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-[13px]">No results</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="sentinel">
                <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {sentinelCols.slice(0, 8).map((col) => (
                          <th key={col} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSentinel.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          {sentinelCols.slice(0, 8).map((col) => (
                            <td key={col} className="px-4 py-2.5 text-[12px] whitespace-nowrap">
                              {row[col] != null ? String(row[col]) : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {filteredSentinel.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-[13px]">No results</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="gaps">
            <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left w-10">
                      <Checkbox
                        checked={selectedIndices.size === filteredGaps.length && filteredGaps.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    {gapCols.map((col) => (
                      <th key={col} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGaps.map(({ row, idx }) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedGap(row)}
                    >
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIndices.has(idx)} onCheckedChange={() => toggleSelection(idx)} />
                      </td>
                      {gapCols.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-[12px] whitespace-nowrap">
                          {row[col] != null ? String(row[col]) : "—"}
                        </td>
                      ))}
                      <td className="px-4 py-2.5">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                  {filteredGaps.length === 0 && (
                    <tr><td colSpan={gapCols.length + 2} className="px-4 py-8 text-center text-muted-foreground text-[13px]">No gap assets match your search</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Gap Detail Drawer */}
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
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{key}</p>
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
                        await downloadMailHtml(res.results);
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedGap(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
