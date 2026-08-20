import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders } from '@/infrastructure/security/securityHeaders';
import { jwtVerify } from 'jose';

/**
 * Advanced Edge Middleware
 * Handles Zero-Trust Auth, CSP Injection, and Global Rate-Limiting logs.
 */
export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const developmentScriptSource = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  
  // Define a localized type for the NextRequest with geo/ip extensions
  interface AugmentedRequest extends NextRequest {
    ip?: string;
    geo?: {
      country?: string;
    };
  }

  const augRequest = request as AugmentedRequest;
  const ip = augRequest.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const country = augRequest.geo?.country || 'unknown';

  // 1. Advanced Security: Block Suspicious Regions (Optional/Configurable)
  const blockedCountries = ['XX']; // Placeholder for restricted regions if needed
  if (blockedCountries.includes(country)) {
    return new NextResponse('Access Denied: Geographic Security Policy.', { status: 403 });
  }

  // 2. CSP Injection
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}'${developmentScriptSource} https://*.supabase.co;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    frame-src 'self' https://www.youtube.com https://player.vimeo.com;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co https://vitals.vercel-insights.com;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('x-visitor-ip', ip);
  requestHeaders.set('x-visitor-country', country);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 3. Inject Security Headers into Response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Ensure CSP is also in the response headers for extra compatibility
  response.headers.set('Content-Security-Policy', cspHeader);

  // 4. Protect Admin & Dashboard (Zero-Trust)
  const isProtectedPath = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) return redirectToLogin(request);

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      if (payload.role !== 'authenticated' && payload.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return redirectToLogin(request);
    }
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
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
