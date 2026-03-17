export interface NexposeAsset {
  id: string;
  ip: string;
  hostname: string;
  site: string;
  lastSeen: string;
  os?: string;
  riskScore?: number;
}

export interface SentinelAsset {
  id: string;
  ip: string;
  hostname: string;
  source: string;
  lastSeen: string;
  logCount?: number;
}

export interface GapAsset {
  ip: string;
  hostname: string;
  detectedAt: string;
  status: "open" | "acknowledged" | "resolved";
  source: string;
  severity: "critical" | "high" | "medium" | "low";
  lastSeen: string;
  logCount?: number;
}

export interface OwnerMapping {
  ipRange: string;
  ownerEmail: string;
  label?: string;
}

export interface NotificationLog {
  ip: string;
  ownerEmail: string;
  timestamp: string;
  status: "sent" | "failed" | "pending";
  method: "email" | "slack";
}

export interface SyncLog {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  nexposeAssets: number;
  sentinelAssets: number;
  gapsFound: number;
  triggeredBy: "manual" | "scheduled";
  error?: string;
}
