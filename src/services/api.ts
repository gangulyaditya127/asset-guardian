const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8004";

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
  owners_processed: number;
  results: Array<{
    owner: string;
    to: string[];
    cc?: string[];
    asset_count?: number;
    status?: string;
    error?: string;
  }>;
}

export async function fetchNexposeAssets(): Promise<NexposeApiResponse> {
  const res = await fetch(`${API_BASE_URL}/generate-nexpose-ip-excel`, {
    method: "POST",
  });
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
  const params = new URLSearchParams({
    sentinel_file: sentinelFile,
    nexpose_file: nexposeFile,
  });
  const res = await fetch(`${API_BASE_URL}/compare-ip-excel-output?${params}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Compare API failed: ${res.statusText}`);
  return res.json();
}

export async function sendAutoMail(
  data: Array<Record<string, any>>
): Promise<SendMailResponse> {
  const res = await fetch(`${API_BASE_URL}/send-auto-mail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`Mail API failed: ${res.statusText}`);
  return res.json();
}
