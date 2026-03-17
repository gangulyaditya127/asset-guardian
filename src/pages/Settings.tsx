import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockOwnerMappings } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Save, Trash2, Plus } from "lucide-react";

export default function SettingsPage() {
  const [showNexposePass, setShowNexposePass] = useState(false);
  const [showAzureSecret, setShowAzureSecret] = useState(false);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground">
          Configure API credentials, owner mappings, and sync schedules
        </p>
      </div>

      <Tabs defaultValue="credentials" className="max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="credentials" className="text-[13px]">API Credentials</TabsTrigger>
          <TabsTrigger value="owners" className="text-[13px]">Owner Mappings</TabsTrigger>
          <TabsTrigger value="schedule" className="text-[13px]">Sync Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          {/* Nexpose */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-[14px] font-semibold text-foreground">Nexpose (InsightVM)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Hostname</Label>
                <Input placeholder="nexpose.corp.local:3780" className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Username</Label>
                <Input placeholder="api-user" className="h-9 text-[13px]" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px]">Password / API Key</Label>
                <div className="relative">
                  <Input
                    type={showNexposePass ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-9 text-[13px] pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNexposePass(!showNexposePass)}
                  >
                    {showNexposePass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button size="sm" className="gap-2">
              <Save className="h-3.5 w-3.5" />
              Save Nexpose Config
            </Button>
          </div>

          {/* Sentinel */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-[14px] font-semibold text-foreground">Microsoft Sentinel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Tenant ID</Label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="h-9 text-[13px] font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Client ID</Label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="h-9 text-[13px] font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Subscription ID</Label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="h-9 text-[13px] font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Workspace ID</Label>
                <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="h-9 text-[13px] font-mono" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px]">Client Secret</Label>
                <div className="relative">
                  <Input
                    type={showAzureSecret ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="h-9 text-[13px] pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowAzureSecret(!showAzureSecret)}
                  >
                    {showAzureSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button size="sm" className="gap-2">
              <Save className="h-3.5 w-3.5" />
              Save Sentinel Config
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="owners">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold text-foreground">IP Range → Owner Mappings</h3>
              <Button size="sm" variant="outline" className="gap-2 h-8 text-[12px]">
                <Plus className="h-3.5 w-3.5" />
                Add Mapping
              </Button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">IP Range</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner Email</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {mockOwnerMappings.map((m, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{m.ipRange}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{m.label}</td>
                    <td className="px-4 py-2.5">{m.ownerEmail}</td>
                    <td className="px-4 py-2.5">
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4 max-w-md">
            <h3 className="text-[14px] font-semibold text-foreground">Sync Schedule</h3>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="12h">Every 12 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-foreground">Auto-notify on new gaps</p>
                <p className="text-[11px] text-muted-foreground">Send alerts when new gap assets are found</p>
              </div>
              <Switch />
            </div>
            <Button size="sm" className="gap-2">
              <Save className="h-3.5 w-3.5" />
              Save Schedule
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
