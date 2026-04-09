import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSyncContext } from "@/context/SyncContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { downloadDataAsXlsx } from "@/utils/downloadXlsx";

export default function Inventory() {
  const { nexposeData, sentinelData, status } = useSyncContext();
  const [search, setSearch] = useState("");

  const nexposeRows = nexposeData?.data ?? [];
  const sentinelRows = sentinelData?.data ?? [];

  const filteredNexpose = nexposeRows.filter(
    (a) =>
      (a["Defined IP"] || "").toLowerCase().includes(search.toLowerCase()) ||
      (a["Site Name"] || "").toLowerCase().includes(search.toLowerCase()) ||
      (a["Owner"] || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredSentinel = sentinelRows.filter((a) => {
    const searchLower = search.toLowerCase();
    return Object.values(a).some(
      (v) => v != null && String(v).toLowerCase().includes(searchLower)
    );
  });

  const noData = status === "idle" || status === "loading";

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Asset Inventory</h1>
        <p className="text-[13px] text-muted-foreground">
          Browse all discovered assets from Nexpose and Sentinel
        </p>
      </div>

      {noData && (
        <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
          No data available. Run a sync from the Dashboard first.
        </div>
      )}

      {!noData && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search IP, hostname, or source…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
            </div>
          </div>

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
              <div className="mb-2 flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={() => downloadDataAsXlsx(nexposeRows, "Nexpose_Assets.xlsx")}>
                  <Download className="h-3.5 w-3.5" /> Download XLSX
                </Button>
              </div>
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
                    {filteredNexpose.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[12px]">{row["Defined IP"]}</td>
                        <td className="px-4 py-2.5 font-mono text-[12px]">{row["Site ID"]}</td>
                        <td className="px-4 py-2.5">{row["Site Name"]}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row["Owner"]}</td>
                      </tr>
                    ))}
                    {filteredNexpose.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-[13px]">No results</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="sentinel">
              <div className="mb-2 flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={() => downloadDataAsXlsx(sentinelRows, "Sentinel_Assets.xlsx")}>
                  <Download className="h-3.5 w-3.5" /> Download XLSX
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {(sentinelData?.columns ?? []).slice(0, 8).map((col) => (
                        <th key={col} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSentinel.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        {(sentinelData?.columns ?? []).slice(0, 8).map((col) => (
                          <td key={col} className="px-4 py-2.5 text-[12px] whitespace-nowrap">
                            {row[col] != null ? String(row[col]) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {filteredSentinel.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-[13px]">No results</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppLayout>
  );
}
