import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { mockNexposeAssets, mockSentinelAssets } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");

  const filteredNexpose = mockNexposeAssets.filter(
    (a) =>
      a.ip.includes(search) ||
      a.hostname.toLowerCase().includes(search.toLowerCase()) ||
      a.site.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSentinel = mockSentinelAssets.filter(
    (a) =>
      a.ip.includes(search) ||
      a.hostname.toLowerCase().includes(search.toLowerCase()) ||
      a.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Asset Inventory</h1>
        <p className="text-[13px] text-muted-foreground">
          Browse all discovered assets from Nexpose and Sentinel
        </p>
      </div>

      {/* Filter bar */}
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
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP Address</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hostname</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Site</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">OS</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Risk Score</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {filteredNexpose.map((asset) => (
                  <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{asset.ip}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{asset.hostname}</td>
                    <td className="px-4 py-2.5">{asset.site}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{asset.os}</td>
                    <td className="px-4 py-2.5">
                      <RiskIndicator score={asset.riskScore ?? 0} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-[12px]">
                      {new Date(asset.lastSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="sentinel">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP Address</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hostname</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Source</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Log Count</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {filteredSentinel.map((asset) => (
                  <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{asset.ip}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{asset.hostname}</td>
                    <td className="px-4 py-2.5">{asset.source}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px]">{asset.logCount?.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-[12px]">
                      {new Date(asset.lastSeen).toLocaleDateString()}
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

function RiskIndicator({ score }: { score: number }) {
  const color = score >= 80 ? "text-destructive" : score >= 50 ? "text-warning" : "text-success";
  return (
    <span className={`font-mono text-[12px] font-semibold ${color}`}>{score}</span>
  );
}
