const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8004";

// ── Nexpose / Sentinel / Compare ──

export interface NexposeApiResponse {
  status: string;
  output_file: string;
  site_ids_processed: number[];
  ip_count: number;
  data: Array<{
    "Defined IP": string;
    "Site ID": number;
    "Site Name": string;
    Owner: string;
  }>;
}

export interface SentinelApiResponse {
  status: string;
  file_name: string;
  row_count: number;
  columns: string[];
  data: Array<Record<string, any>>;
}

export interface CompareApiResponse {
  status: string;
  message: string;
  sentinel_file: string;
  nexpose_file: string;
  output_file: string;
  missing_ip_count: number;
  total_rows_scanned: number;
  data: Array<Record<string, any>>;
}

export interface SendMailResponse {
  message: string;
  run_id?: string;
  owners_processed: number;
  results: Array<{
    owner: string;
    to: string[];
    cc?: string[];
    run_id?: string;
    mail_status?: string;
    asset_count?: number;
    status?: string;
    error?: string;
    mail_body_html?: string;
  }>;
}

export async function fetchNexposeAssets(): Promise<NexposeApiResponse> {
  const res = await fetch(`${API_BASE_URL}/generate-nexpose-ip-excel`, { method: "POST" });
  if (!res.ok) throw new Error(`Nexpose API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSentinelAssets(): Promise<SentinelApiResponse> {
  const res = await fetch(`${API_BASE_URL}/get-sentinel-excel`);
  if (!res.ok) throw new Error(`Sentinel API failed: ${res.statusText}`);
  return res.json();
}

export async function compareAssets(
  sentinelFile: string,
  nexposeFile: string
): Promise<CompareApiResponse> {
  const params = new URLSearchParams({ sentinel_file: sentinelFile, nexpose_file: nexposeFile });
  const res = await fetch(`${API_BASE_URL}/compare-ip-excel-output?${params}`, { method: "POST" });
  if (!res.ok) throw new Error(`Compare API failed: ${res.statusText}`);
  return res.json();
}

export async function sendAutoMail(data: Array<Record<string, any>>): Promise<SendMailResponse> {
  const res = await fetch(`${API_BASE_URL}/send-auto-mail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`Mail API failed: ${res.statusText}`);
  return res.json();
}

// ── History Records ──

export interface FileStatusRecord {
  id: number;
  Time: string;
  Status: string | null;
  Nex_Count: string | null;
  Sen_Coount: string | null;
  Gap_Count: string | null;
  Error: string | null;
  Nex_FileName: string | null;
  Sent_FileName: string | null;
  Gap_FileName: string | null;
}

export interface FirstRecordResponse {
  database_data: FileStatusRecord;
  excel_data: {
    nex_file: NexposeApiResponse["data"] | null;
    sent_file: SentinelApiResponse["data"] | null;
    gap_file: CompareApiResponse["data"] | null;
  };
}

export interface FileStatusCreate {
  Status?: string;
  Nex_Count?: string;
  Sen_Coount?: string;
  Gap_Count?: string;
  Error?: string;
  Nex_FileName?: string;
  Sent_FileName?: string;
  Gap_FileName?: string;
}

export async function fetchFirstRecord(): Promise<FirstRecordResponse> {
  const res = await fetch(`${API_BASE_URL}/firstrecord/`);
  if (!res.ok) throw new Error(`First record API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAllRecords(): Promise<FileStatusRecord[]> {
  const res = await fetch(`${API_BASE_URL}/records/`);
  if (!res.ok) throw new Error(`Records API failed: ${res.statusText}`);
  return res.json();
}

export async function createRecord(data: FileStatusCreate): Promise<FileStatusRecord> {
  const res = await fetch(`${API_BASE_URL}/records/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create record API failed: ${res.statusText}`);
  return res.json();
}

// ── Nexpose Credentials ──

export interface NexposeCredentials {
  base_url: string;
  username: string;
  is_active: boolean;
  updated_at: string | null;
}

export async function fetchNexposeCredentials(): Promise<NexposeCredentials> {
  const res = await fetch(`${API_BASE_URL}/nexpose/credentials`);
  if (!res.ok) throw new Error(`Nexpose credentials API failed: ${res.statusText}`);
  return res.json();
}

export async function saveNexposeCredentials(payload: {
  base_url: string;
  username: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/nexpose/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Save nexpose credentials failed: ${res.statusText}`);
  return res.json();
}

// ── Owner Mappings ──

export interface OwnerMapping {
  owner_key: string;
  to_emails: string[];
  cc_emails: string[];
}

export async function fetchOwnerMappings(): Promise<OwnerMapping[]> {
  const res = await fetch(`${API_BASE_URL}/owner-mapping`);
  if (!res.ok) throw new Error(`Owner mappings API failed: ${res.statusText}`);
  return res.json();
}

export async function addOwnerMapping(payload: {
  owner_key: string;
  to_emails: string[];
  cc_emails: string[];
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/owner-mapping`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Add owner mapping failed: ${res.statusText}`);
  return res.json();
}

export async function deleteOwnerMapping(ownerKey: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/owner-mapping/${encodeURIComponent(ownerKey)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete owner mapping failed: ${res.statusText}`);
  return res.json();
}

// ── Scheduler ──

export interface SchedulerStatus {
  frequency: string | null;
  enabled: boolean;
  next_run_time: string | null;
}

export async function fetchSchedulerStatus(): Promise<SchedulerStatus> {
  const res = await fetch(`${API_BASE_URL}/scheduler/status`);
  if (!res.ok) throw new Error(`Scheduler status API failed: ${res.statusText}`);
  return res.json();
}

export async function updateScheduler(payload: {
  frequency: string;
  enabled: boolean;
}): Promise<{ status: string; frequency: string | null; enabled: boolean }> {
  const res = await fetch(`${API_BASE_URL}/scheduler/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Scheduler update failed: ${res.statusText}`);
  return res.json();
}
