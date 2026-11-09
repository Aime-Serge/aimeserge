import { Certificate, Broadcast, Testimonial } from "./types";

// Content lives in Supabase only (single source of truth). These empty
// fallbacks are used for one request when the database is unreachable.
export const fallbackCertificates: Certificate[] = [];

export const fallbackBroadcasts: Broadcast[] = [];

/**
 * Testimonials shown on /resume.
 *
 * Intentionally empty. The previous four entries were marked "verified" but
 * could not be matched to the CV or any public profile. Showing unverifiable
 * quotes is the fastest way to lose a recruiter's trust.
 *
 * Add a quote only when: the person agreed in writing, the name/role/company
 * are real, and ideally a public source exists (e.g. a LinkedIn recommendation
 * URL in `context`). Then set verified: true.
 */
export const testimonials: Testimonial[] = [];
