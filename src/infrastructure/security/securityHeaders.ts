export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' https://*.supabase.co; style-src 'self' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co https://vitals.vercel-insights.com; media-src 'self' blob: data: https://*.supabase.co; object-src 'none'; base-uri 'self'; frame-src 'self' https://www.youtube.com https://player.vimeo.com; frame-ancestors 'none'; upgrade-insecure-requests;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};
