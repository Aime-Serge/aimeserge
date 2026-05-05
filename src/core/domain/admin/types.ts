export interface SecurityLog {
  id: string;
  created_at: string;
  event_type: string;
  user_email: string | null;
  ip_address: string;
  user_agent: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  metadata: Record<string, unknown>;
}

export interface AdminAnalytics {
  totalViews: number;
  totalInquiries: number;
  researchImpact: number;
}

export interface SecurityStatus {
  headers: Record<string, string>;
  threatLevel: "LOW" | "ELEVATED" | "CRITICAL";
  recentEvents: number;
  systemState: string;
  tlsVersion: string;
}
