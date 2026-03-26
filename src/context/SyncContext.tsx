import React, { createContext, useContext, useState, useCallback } from "react";
import {
  fetchNexposeAssets,
  fetchSentinelAssets,
  compareAssets,
  NexposeApiResponse,
  SentinelApiResponse,
  CompareApiResponse,
} from "@/services/api";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface SyncState {
  status: SyncStatus;
  error: string | null;
  nexposeData: NexposeApiResponse | null;
  sentinelData: SentinelApiResponse | null;
  gapData: CompareApiResponse | null;
  lastSyncTime: Date | null;
  runSync: () => Promise<void>;
}

const SyncContext = createContext<SyncState | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [nexposeData, setNexposeData] = useState<NexposeApiResponse | null>(null);
  const [sentinelData, setSentinelData] = useState<SentinelApiResponse | null>(null);
  const [gapData, setGapData] = useState<CompareApiResponse | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const runSync = useCallback(async () => {
    setStatus("syncing");
    setError(null);
    try {
      // Step 1: Fetch Nexpose
      const nexpRes = await fetchNexposeAssets();
      setNexposeData(nexpRes);

      // Step 2: Fetch Sentinel
      const sentRes = await fetchSentinelAssets();
      setSentinelData(sentRes);

      // Step 3: Compare
      const compareRes = await compareAssets(sentRes.file_name, nexpRes.output_file);
      setGapData(compareRes);

      setLastSyncTime(new Date());
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Sync failed");
      setStatus("error");
    }
  }, []);

  return (
    <SyncContext.Provider
      value={{ status, error, nexposeData, sentinelData, gapData, lastSyncTime, runSync }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSyncContext must be used within SyncProvider");
  return ctx;
}
