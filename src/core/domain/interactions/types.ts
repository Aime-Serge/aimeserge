/** Topics offered in the contact form. Kept here (no zod) so client code stays light. */
export const CONTACT_INTERESTS = ["Hiring", "Freelance project", "Collaboration", "Research", "Other"] as const;

export interface ContactSubmission {
  name: string;
  email: string;
  contactType: "Individual" | "Business" | "Company";
  companyName?: string;
  jobTitle?: string;
  interest: string;
  budget?: string;
  timeline?: string;
  location?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  message: string;
  newsletterOptIn: boolean;
  /** Honeypot. Real visitors never see or fill this field. */
  website?: string;
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
