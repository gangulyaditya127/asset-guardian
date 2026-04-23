import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  fetchNexposeAssets,
  fetchSentinelAssets,
  compareAssets,
  createRecord,
  fetchFirstRecord,
  fetchAllRecords,
  NexposeApiResponse,
  SentinelApiResponse,
  CompareApiResponse,
  FileStatusRecord,
  FirstRecordResponse,
} from "@/services/api";

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "loading";

interface SyncState {
  status: SyncStatus;
  error: string | null;
  nexposeData: NexposeApiResponse | null;
  sentinelData: SentinelApiResponse | null;
  gapData: CompareApiResponse | null;
  lastSyncTime: Date | null;
  records: FileStatusRecord[];
  lastRecord: FileStatusRecord | null;
  sentinelColumns: string[];
  runSync: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const SyncContext = createContext<SyncState | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [nexposeData, setNexposeData] = useState<NexposeApiResponse | null>(null);
  const [sentinelData, setSentinelData] = useState<SentinelApiResponse | null>(null);
  const [gapData, setGapData] = useState<CompareApiResponse | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [records, setRecords] = useState<FileStatusRecord[]>([]);
  const [lastRecord, setLastRecord] = useState<FileStatusRecord | null>(null);
  const [sentinelColumns, setSentinelColumns] = useState<string[]>([]);

  const loadInitialData = useCallback(async () => {
    try {
      const [firstRes, allRecords] = await Promise.all([
        fetchFirstRecord().catch(() => null),
        fetchAllRecords().catch(() => [] as FileStatusRecord[]),
      ]);

      setRecords(allRecords);

      if (firstRes) {
        setLastRecord(firstRes.database_data);
        setLastSyncTime(new Date(firstRes.database_data.Time));

        // Reconstruct display data from excel_data
        if (firstRes.excel_data.nex_file) {
          setNexposeData({
            status: "success",
            output_file: firstRes.database_data.Nex_FileName || "",
            site_ids_processed: [],
            ip_count: parseInt(firstRes.database_data.Nex_Count || "0", 10),
            total_ip_count: parseInt(firstRes.database_data.Nex_Count || "0", 10),
            preview_data: firstRes.excel_data.nex_file as any,
            data: firstRes.excel_data.nex_file as any,
          });
        }
        if (firstRes.excel_data.sent_file) {
          const sentData = firstRes.excel_data.sent_file as any[];
          const cols = sentData.length > 0 ? Object.keys(sentData[0]) : [];
          setSentinelColumns(cols);
          setSentinelData({
            status: "success",
            file_name: firstRes.database_data.Sent_FileName || "",
            row_count: parseInt(firstRes.database_data.Sen_Coount || "0", 10),
            total_row_count: parseInt(firstRes.database_data.Sen_Coount || "0", 10),
            columns: cols,
            preview_data: sentData,
            data: sentData,
          });
        }
        if (firstRes.excel_data.gap_file) {
          setGapData({
            status: "success",
            message: "",
            sentinel_file: "",
            nexpose_file: "",
            output_file: firstRes.database_data.Gap_FileName || "",
            missing_ip_count: parseInt(firstRes.database_data.Gap_Count || "0", 10),
            total_rows_scanned: 0,
            preview_data: firstRes.excel_data.gap_file as any,
            data: firstRes.excel_data.gap_file as any,
          });
        }

        setStatus(firstRes.database_data.Status === "error" ? "error" : "success");
        if (firstRes.database_data.Error) setError(firstRes.database_data.Error);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshData = useCallback(async () => {
    const [firstRes, allRecords] = await Promise.all([
      fetchFirstRecord().catch(() => null),
      fetchAllRecords().catch(() => [] as FileStatusRecord[]),
    ]);
    setRecords(allRecords);
    if (firstRes) {
      setLastRecord(firstRes.database_data);
      setLastSyncTime(new Date(firstRes.database_data.Time));

      if (firstRes.excel_data.nex_file) {
        setNexposeData({
          status: "success",
          output_file: firstRes.database_data.Nex_FileName || "",
          site_ids_processed: [],
          ip_count: parseInt(firstRes.database_data.Nex_Count || "0", 10),
          total_ip_count: parseInt(firstRes.database_data.Nex_Count || "0", 10),
          preview_data: firstRes.excel_data.nex_file as any,
          data: firstRes.excel_data.nex_file as any,
        });
      }
      if (firstRes.excel_data.sent_file) {
        const sentData = firstRes.excel_data.sent_file as any[];
        const cols = sentData.length > 0 ? Object.keys(sentData[0]) : [];
        setSentinelColumns(cols);
        setSentinelData({
          status: "success",
          file_name: firstRes.database_data.Sent_FileName || "",
          row_count: parseInt(firstRes.database_data.Sen_Coount || "0", 10),
          total_row_count: parseInt(firstRes.database_data.Sen_Coount || "0", 10),
          columns: cols,
          preview_data: sentData,
          data: sentData,
        });
      }
      if (firstRes.excel_data.gap_file) {
        setGapData({
          status: "success",
          message: "",
          sentinel_file: "",
          nexpose_file: "",
          output_file: firstRes.database_data.Gap_FileName || "",
          missing_ip_count: parseInt(firstRes.database_data.Gap_Count || "0", 10),
          total_rows_scanned: 0,
          preview_data: firstRes.excel_data.gap_file as any,
          data: firstRes.excel_data.gap_file as any,
        });
      }
      setStatus(firstRes.database_data.Status === "error" ? "error" : "success");
    }
  }, []);

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
      setSentinelColumns(sentRes.columns);

      // Step 3: Compare
      const compareRes = await compareAssets(sentRes.file_name, nexpRes.output_file);
      setGapData(compareRes);

      // Step 4: Save record
      await createRecord({
        Status: "success",
        Nex_Count: String(nexpRes.total_ip_count ?? nexpRes.ip_count ?? 0),
        Sen_Coount: String(sentRes.total_row_count ?? sentRes.row_count ?? 0),
        Gap_Count: String(compareRes.missing_ip_count),
        Nex_FileName: nexpRes.output_file,
        Sent_FileName: sentRes.file_name,
        Gap_FileName: compareRes.output_file,
      });

      // Step 5 & 6: Refresh from DB
      await refreshData();

      setStatus("success");
    } catch (err: any) {
      const errorMsg = err.message || "Sync failed";
      setError(errorMsg);

      // Save error record
      await createRecord({
        Status: "error",
        Error: errorMsg,
      }).catch(() => {});

      await refreshData().catch(() => {});
      setStatus("error");
    }
  }, [refreshData]);

  return (
    <SyncContext.Provider
      value={{
        status,
        error,
        nexposeData,
        sentinelData,
        gapData,
        lastSyncTime,
        records,
        lastRecord,
        sentinelColumns,
        runSync,
        refreshData,
      }}
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
