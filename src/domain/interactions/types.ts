export interface ContactSubmission {
  name: string;
  email: string;
  contactType: "Individual" | "Business" | "Company";
  companyName: string;
  jobTitle: string;
  interest: string;
  budget: string;
  timeline: string;
  location: string;
  linkedinUrl: string;
  whatsapp: string;
  gender: string;
  maritalStatus: string;
  message: string;
  newsletterOptIn: boolean;
}

export interface SecurityLog {
  id: string;
  event_type: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, unknown>;
  severity: string;
  created_at: string;
}
