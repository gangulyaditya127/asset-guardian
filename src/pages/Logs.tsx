import { AppLayout } from "@/components/AppLayout";

export default function Logs() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-[13px] text-muted-foreground">
          Sync history and notification records
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
        No persistent history — logs are available only during the current session.
        Run a sync from the Dashboard to see live results.
      </div>
    </AppLayout>
  );
}
