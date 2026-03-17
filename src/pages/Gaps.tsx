import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { mockGapAssets } from "@/data/mockData";
import { GapAsset } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, X, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function Gaps() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGap, setSelectedGap] = useState<GapAsset | null>(null);
  const [selectedIps, setSelectedIps] = useState<Set<string>>(new Set());

  const filtered = mockGapAssets.filter((g) => {
    const matchesSearch =
      g.ip.includes(search) ||
      g.hostname.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || g.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const toggleSelection = (ip: string) => {
    const next = new Set(selectedIps);
    if (next.has(ip)) next.delete(ip);
    else next.add(ip);
    setSelectedIps(next);
  };

  const toggleAll = () => {
    if (selectedIps.size === filtered.length) {
      setSelectedIps(new Set());
    } else {
      setSelectedIps(new Set(filtered.map((g) => g.ip)));
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gap Assets</h1>
          <p className="text-[13px] text-muted-foreground">
            IPs detected in Sentinel but missing from Nexpose inventory
          </p>
        </div>
        {selectedIps.size > 0 && (
          <Button className="gap-2" variant="default">
            <Bell className="h-4 w-4" />
            Notify Owners ({selectedIps.size})
          </Button>
        )}
      </div>

      {/* Filter bar */}
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
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 h-9 text-[13px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-[13px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left w-10">
                <Checkbox
                  checked={selectedIps.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP Address</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hostname</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Severity</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Source</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Last Seen</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Logs</th>
              <th className="px-4 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((gap) => (
              <tr
                key={gap.ip}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedGap(gap)}
              >
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIps.has(gap.ip)}
                    onCheckedChange={() => toggleSelection(gap.ip)}
                  />
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px]">{gap.ip}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{gap.hostname}</td>
                <td className="px-4 py-2.5"><SeverityBadge severity={gap.severity} /></td>
                <td className="px-4 py-2.5"><StatusBadge status={gap.status} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">{gap.source}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-[12px]">
                  {format(new Date(gap.lastSeen), "MMM d, HH:mm")}
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px]">{gap.logCount?.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-[13px]">
                  No gap assets match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedGap} onOpenChange={() => setSelectedGap(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedGap && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-[15px]">
                  <span className="font-mono">{selectedGap.ip}</span>
                  <SeverityBadge severity={selectedGap.severity} />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <DetailRow label="Hostname" value={selectedGap.hostname} mono />
                <DetailRow label="Source" value={selectedGap.source} />
                <DetailRow label="Status" value={selectedGap.status} />
                <DetailRow label="Detected" value={format(new Date(selectedGap.detectedAt), "PPpp")} />
                <DetailRow label="Last Seen" value={format(new Date(selectedGap.lastSeen), "PPpp")} />
                <DetailRow label="Log Count" value={String(selectedGap.logCount ?? "—")} mono />

                <div className="pt-4 border-t border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Sample KQL Query
                  </p>
                  <pre className="rounded-md bg-muted p-3 text-[11px] font-mono text-foreground overflow-x-auto">
{`union *
| where TimeGenerated > ago(24h)
| where IPAddress == "${selectedGap.ip}"
  or Computer == "${selectedGap.hostname}"
| summarize count() by Type
| order by count_ desc`}
                  </pre>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-2" size="sm">
                    <Bell className="h-3.5 w-3.5" />
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

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-[13px] text-foreground mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
