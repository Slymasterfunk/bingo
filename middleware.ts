import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Extracts the client's IP address from the request
 * Works with various headers that proxies/load balancers use
 */
function getClientIP(request: NextRequest): string | null {
  // Try common headers used by proxies/CDNs
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Vercel-specific headers
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }

  // No IP found
  return null;
}

/**
 * Checks if an IP address is in the whitelist
 */
function isIPWhitelisted(clientIP: string | null, whitelist: string[]): boolean {
  if (!clientIP) {
    return false;
  }

  // Normalize IP addresses (handle IPv4-mapped IPv6 addresses)
  const normalizedClientIP = clientIP.replace(/^::ffff:/, '');

  return whitelist.some(allowedIP => {
    const normalizedAllowedIP = allowedIP.trim().replace(/^::ffff:/, '');
    return normalizedClientIP === normalizedAllowedIP;
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply IP whitelisting to admin routes
  if (pathname.startsWith('/admin')) {
    const whitelistEnv = process.env.ADMIN_IP_WHITELIST;

    // If whitelist is not configured or empty, allow all (development mode)
    if (!whitelistEnv || whitelistEnv.trim() === '') {
      console.log('[Admin Access] IP whitelisting disabled - allowing all IPs');
      return NextResponse.next();
    }

    // Parse whitelist
    const whitelist = whitelistEnv.split(',').map(ip => ip.trim()).filter(ip => ip);

    if (whitelist.length === 0) {
      console.log('[Admin Access] IP whitelist is empty - allowing all IPs');
      return NextResponse.next();
    }

    // Get client IP
    const clientIP = getClientIP(request);

    // Check if IP is whitelisted
    if (isIPWhitelisted(clientIP, whitelist)) {
      console.log(`[Admin Access] Allowed IP: ${clientIP}`);
      return NextResponse.next();
    }

    // IP not whitelisted - block access
    console.warn(`[Admin Access] Blocked IP: ${clientIP || 'unknown'}`);

    // Redirect to unauthorized page with the IP info
    const url = request.nextUrl.clone();
    url.pathname = '/admin/unauthorized';
    url.searchParams.set('ip', clientIP || 'unknown');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
