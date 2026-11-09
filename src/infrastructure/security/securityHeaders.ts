/**
 * Static security headers. Applied to every route (pages AND /api) from
 * next.config.ts. The Content-Security-Policy is built in middleware.ts
 * so it can differ between dev and production; it is not duplicated here.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Microphone is allowed for this origin only (voice input in the AI chat).
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
};
