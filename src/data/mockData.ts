import { NexposeAsset, SentinelAsset, GapAsset, OwnerMapping, NotificationLog, SyncLog } from "@/types/models";

// Mock Nexpose Assets
export const mockNexposeAssets: NexposeAsset[] = [
  { id: "nx-001", ip: "10.0.1.15", hostname: "web-prod-01.corp.local", site: "Production-Web", lastSeen: "2026-03-17T08:30:00Z", os: "Ubuntu 22.04", riskScore: 72 },
  { id: "nx-002", ip: "10.0.1.22", hostname: "db-prod-01.corp.local", site: "Production-DB", lastSeen: "2026-03-17T08:30:00Z", os: "RHEL 9.2", riskScore: 85 },
  { id: "nx-003", ip: "10.0.2.10", hostname: "app-staging-01.corp.local", site: "Staging", lastSeen: "2026-03-16T14:00:00Z", os: "Windows Server 2022", riskScore: 45 },
  { id: "nx-004", ip: "10.0.2.11", hostname: "app-staging-02.corp.local", site: "Staging", lastSeen: "2026-03-16T14:00:00Z", os: "Windows Server 2022", riskScore: 38 },
  { id: "nx-005", ip: "10.0.3.5", hostname: "dc-01.corp.local", site: "Infrastructure", lastSeen: "2026-03-17T06:00:00Z", os: "Windows Server 2019", riskScore: 91 },
  { id: "nx-006", ip: "10.0.3.6", hostname: "dc-02.corp.local", site: "Infrastructure", lastSeen: "2026-03-17T06:00:00Z", os: "Windows Server 2019", riskScore: 88 },
  { id: "nx-007", ip: "10.0.1.50", hostname: "api-prod-01.corp.local", site: "Production-Web", lastSeen: "2026-03-17T08:30:00Z", os: "Ubuntu 22.04", riskScore: 65 },
  { id: "nx-008", ip: "10.0.4.100", hostname: "dev-vm-01.corp.local", site: "Development", lastSeen: "2026-03-15T20:00:00Z", os: "Ubuntu 24.04", riskScore: 22 },
];

// Mock Sentinel Assets
export const mockSentinelAssets: SentinelAsset[] = [
  { id: "sn-001", ip: "10.0.1.15", hostname: "web-prod-01.corp.local", source: "AzureNetworkAnalytics", lastSeen: "2026-03-17T09:15:00Z", logCount: 12450 },
  { id: "sn-002", ip: "10.0.1.22", hostname: "db-prod-01.corp.local", source: "Syslog", lastSeen: "2026-03-17T09:10:00Z", logCount: 8920 },
  { id: "sn-003", ip: "10.0.5.30", hostname: "shadow-it-01.unknown", source: "AzureNetworkAnalytics", lastSeen: "2026-03-17T09:00:00Z", logCount: 340 },
  { id: "sn-004", ip: "10.0.5.31", hostname: "rogue-device.unknown", source: "CommonSecurityLog", lastSeen: "2026-03-16T23:45:00Z", logCount: 89 },
  { id: "sn-005", ip: "10.0.6.10", hostname: "contractor-laptop.guest", source: "SigninLogs", lastSeen: "2026-03-17T07:30:00Z", logCount: 156 },
  { id: "sn-006", ip: "10.0.3.5", hostname: "dc-01.corp.local", source: "SecurityEvent", lastSeen: "2026-03-17T09:12:00Z", logCount: 45600 },
  { id: "sn-007", ip: "10.0.7.1", hostname: "unknown-iot-01", source: "AzureNetworkAnalytics", lastSeen: "2026-03-17T04:20:00Z", logCount: 23 },
  { id: "sn-008", ip: "10.0.7.2", hostname: "unknown-iot-02", source: "AzureNetworkAnalytics", lastSeen: "2026-03-16T18:00:00Z", logCount: 12 },
  { id: "sn-009", ip: "10.0.1.50", hostname: "api-prod-01.corp.local", source: "Syslog", lastSeen: "2026-03-17T09:14:00Z", logCount: 5600 },
  { id: "sn-010", ip: "10.0.8.55", hostname: "personal-device.byod", source: "SigninLogs", lastSeen: "2026-03-17T08:00:00Z", logCount: 78 },
];

// Mock Gap Assets (IPs in Sentinel but NOT in Nexpose)
export const mockGapAssets: GapAsset[] = [
  { ip: "10.0.5.30", hostname: "shadow-it-01.unknown", detectedAt: "2026-03-15T10:00:00Z", status: "open", source: "AzureNetworkAnalytics", severity: "high", lastSeen: "2026-03-17T09:00:00Z", logCount: 340 },
  { ip: "10.0.5.31", hostname: "rogue-device.unknown", detectedAt: "2026-03-15T10:00:00Z", status: "open", source: "CommonSecurityLog", severity: "critical", lastSeen: "2026-03-16T23:45:00Z", logCount: 89 },
  { ip: "10.0.6.10", hostname: "contractor-laptop.guest", detectedAt: "2026-03-16T06:00:00Z", status: "open", source: "SigninLogs", severity: "medium", lastSeen: "2026-03-17T07:30:00Z", logCount: 156 },
  { ip: "10.0.7.1", hostname: "unknown-iot-01", detectedAt: "2026-03-14T12:00:00Z", status: "open", source: "AzureNetworkAnalytics", severity: "high", lastSeen: "2026-03-17T04:20:00Z", logCount: 23 },
  { ip: "10.0.7.2", hostname: "unknown-iot-02", detectedAt: "2026-03-14T12:00:00Z", status: "acknowledged", source: "AzureNetworkAnalytics", severity: "low", lastSeen: "2026-03-16T18:00:00Z", logCount: 12 },
  { ip: "10.0.8.55", hostname: "personal-device.byod", detectedAt: "2026-03-16T08:00:00Z", status: "open", source: "SigninLogs", severity: "medium", lastSeen: "2026-03-17T08:00:00Z", logCount: 78 },
];

export const mockOwnerMappings: OwnerMapping[] = [
  { ipRange: "10.0.5.0/24", ownerEmail: "security-ops@corp.local", label: "Shadow IT Range" },
  { ipRange: "10.0.6.0/24", ownerEmail: "hr-it@corp.local", label: "Guest Network" },
  { ipRange: "10.0.7.0/24", ownerEmail: "iot-team@corp.local", label: "IoT Segment" },
  { ipRange: "10.0.8.0/24", ownerEmail: "byod-admin@corp.local", label: "BYOD Range" },
];

export const mockNotificationLogs: NotificationLog[] = [
  { ip: "10.0.5.30", ownerEmail: "security-ops@corp.local", timestamp: "2026-03-16T10:00:00Z", status: "sent", method: "email" },
  { ip: "10.0.7.1", ownerEmail: "iot-team@corp.local", timestamp: "2026-03-15T14:00:00Z", status: "sent", method: "slack" },
  { ip: "10.0.7.2", ownerEmail: "iot-team@corp.local", timestamp: "2026-03-15T14:00:00Z", status: "failed", method: "email" },
];

export const mockSyncLogs: SyncLog[] = [
  { id: "sync-001", startedAt: "2026-03-17T08:00:00Z", completedAt: "2026-03-17T08:02:34Z", status: "completed", nexposeAssets: 8, sentinelAssets: 10, gapsFound: 6, triggeredBy: "scheduled" },
  { id: "sync-002", startedAt: "2026-03-16T08:00:00Z", completedAt: "2026-03-16T08:03:12Z", status: "completed", nexposeAssets: 7, sentinelAssets: 9, gapsFound: 5, triggeredBy: "scheduled" },
  { id: "sync-003", startedAt: "2026-03-15T14:30:00Z", completedAt: "2026-03-15T14:31:45Z", status: "completed", nexposeAssets: 7, sentinelAssets: 8, gapsFound: 4, triggeredBy: "manual" },
  { id: "sync-004", startedAt: "2026-03-15T08:00:00Z", completedAt: undefined, status: "failed", nexposeAssets: 0, sentinelAssets: 0, gapsFound: 0, triggeredBy: "scheduled", error: "Nexpose API timeout" },
];
