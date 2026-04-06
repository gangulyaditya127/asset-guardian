import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Save, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchNexposeCredentials,
  saveNexposeCredentials,
  fetchOwnerMappings,
  addOwnerMapping,
  deleteOwnerMapping,
  type NexposeCredentials,
  type OwnerMapping,
} from "@/services/api";

export default function SettingsPage() {
  // ── Nexpose Credentials ──
  const [showPass, setShowPass] = useState(false);
  const [nexBaseUrl, setNexBaseUrl] = useState("");
  const [nexUsername, setNexUsername] = useState("");
  const [nexPassword, setNexPassword] = useState("");
  const [nexSaving, setNexSaving] = useState(false);
  const [nexLoading, setNexLoading] = useState(true);

  useEffect(() => {
    fetchNexposeCredentials()
      .then((cred) => {
        setNexBaseUrl(cred.base_url);
        setNexUsername(cred.username);
      })
      .catch(() => {})
      .finally(() => setNexLoading(false));
  }, []);

  const handleSaveNexpose = async () => {
    if (!nexBaseUrl || !nexUsername || !nexPassword) {
      toast.error("All fields are required");
      return;
    }
    setNexSaving(true);
    try {
      await saveNexposeCredentials({ base_url: nexBaseUrl, username: nexUsername, password: nexPassword });
      toast.success("Nexpose credentials saved");
      setNexPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setNexSaving(false);
    }
  };

  // ── Owner Mappings ──
  const [mappings, setMappings] = useState<OwnerMapping[]>([]);
  const [mappingsLoading, setMappingsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOwnerKey, setNewOwnerKey] = useState("");
  const [newToEmails, setNewToEmails] = useState("");
  const [newCcEmails, setNewCcEmails] = useState("");
  const [addingSaving, setAddingSaving] = useState(false);

  const loadMappings = async () => {
    try {
      const data = await fetchOwnerMappings();
      setMappings(data);
    } catch {
    } finally {
      setMappingsLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const handleAddMapping = async () => {
    if (!newOwnerKey || !newToEmails) {
      toast.error("Owner key and To emails are required");
      return;
    }
    setAddingSaving(true);
    try {
      await addOwnerMapping({
        owner_key: newOwnerKey.trim(),
        to_emails: newToEmails.split(",").map((e) => e.trim()).filter(Boolean),
        cc_emails: newCcEmails ? newCcEmails.split(",").map((e) => e.trim()).filter(Boolean) : [],
      });
      toast.success("Owner mapping added");
      setNewOwnerKey("");
      setNewToEmails("");
      setNewCcEmails("");
      setShowAddForm(false);
      await loadMappings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingSaving(false);
    }
  };

  const handleDeleteMapping = async (ownerKey: string) => {
    try {
      await deleteOwnerMapping(ownerKey);
      toast.success("Mapping deleted");
      await loadMappings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground">
          Configure API credentials and owner mappings
        </p>
      </div>

      <Tabs defaultValue="credentials" className="max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="credentials" className="text-[13px]">Nexpose Credentials</TabsTrigger>
          <TabsTrigger value="owners" className="text-[13px]">Owner Mappings</TabsTrigger>
        </TabsList>

        {/* ── Nexpose Credentials ── */}
        <TabsContent value="credentials" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-[14px] font-semibold text-foreground">Nexpose (InsightVM)</h3>
            {nexLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Base URL</Label>
                    <Input
                      placeholder="https://nexpose.corp.local:3780/api/3/sites"
                      value={nexBaseUrl}
                      onChange={(e) => setNexBaseUrl(e.target.value)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Username</Label>
                    <Input
                      placeholder="api-user"
                      value={nexUsername}
                      onChange={(e) => setNexUsername(e.target.value)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[12px]">Password / API Key</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={nexPassword}
                        onChange={(e) => setNexPassword(e.target.value)}
                        className="h-9 text-[13px] pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="gap-2" onClick={handleSaveNexpose} disabled={nexSaving}>
                  {nexSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Nexpose Config
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── Owner Mappings ── */}
        <TabsContent value="owners">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold text-foreground">Owner → Email Mappings</h3>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 h-8 text-[12px]"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Mapping
              </Button>
            </div>

            {showAddForm && (
              <div className="border-b border-border px-4 py-4 space-y-3 bg-muted/30">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Owner Key</Label>
                    <Input
                      placeholder="owner_one"
                      value={newOwnerKey}
                      onChange={(e) => setNewOwnerKey(e.target.value)}
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">To Emails (comma-separated)</Label>
                    <Input
                      placeholder="a@co.com, b@co.com"
                      value={newToEmails}
                      onChange={(e) => setNewToEmails(e.target.value)}
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">CC Emails (comma-separated)</Label>
                    <Input
                      placeholder="c@co.com"
                      value={newCcEmails}
                      onChange={(e) => setNewCcEmails(e.target.value)}
                      className="h-8 text-[12px]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-[12px]" onClick={handleAddMapping} disabled={addingSaving}>
                    {addingSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {mappingsLoading ? (
              <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading…
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner Key</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">To Emails</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">CC Emails</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((m) => (
                    <tr key={m.owner_key} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[12px]">{m.owner_key}</td>
                      <td className="px-4 py-2.5 text-[12px]">{m.to_emails.join(", ")}</td>
                      <td className="px-4 py-2.5 text-[12px] text-muted-foreground">{m.cc_emails.join(", ") || "—"}</td>
                      <td className="px-4 py-2.5">
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteMapping(m.owner_key)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mappings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-[13px]">
                        No owner mappings configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
