import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getEnvVar } from '@/infrastructure/utils/env';

/**
 * Edge middleware for page routes.
 *  1. Sets the Content-Security-Policy (static headers live in next.config.ts).
 *  2. Guards /admin and /dashboard with the signed auth_token cookie.
 *
 * /api routes are NOT matched: each admin API route must call requireAdminApi().
 */
const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' is needed by Next.js inline bootstrap scripts unless nonces are adopted.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.supabase.co https://i.ytimg.com",
  "media-src 'self' blob: data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;
    const jwtSecret = getEnvVar('JWT_SECRET');
    const adminEmail = getEnvVar('ADMIN_EMAIL');

    if (!token || !jwtSecret || !adminEmail) return redirectToLogin(request);

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
        algorithms: ['HS256'],
      });
      if (payload.role !== 'authenticated' || payload.email !== adminEmail) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return redirectToLogin(request);
    }
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', CSP);

  // Never let browsers or proxies keep a copy of private pages.
  if (isProtectedPath || pathname.startsWith('/login')) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url);
  url.searchParams.set('callbackUrl', request.nextUrl.pathname);
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth_token');
  return response;
}

export const config = {
  // Skip API routes, Next internals and static files (saves an edge invocation per asset).
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|pdf|txt|xml|json|webmanifest)$).*)',
  ],
};
