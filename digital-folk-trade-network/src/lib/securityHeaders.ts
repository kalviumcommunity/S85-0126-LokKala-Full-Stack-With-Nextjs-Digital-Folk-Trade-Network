import { NextResponse } from "next/server";

/**
 * Security Headers Configuration
 * 
 * These headers protect against common web vulnerabilities
 */

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    // HSTS - Force HTTPS connections
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    
    // XSS Protection
    "X-XSS-Protection": "1; mode=block",
    
    // Prevent clickjacking
    "X-Frame-Options": "SAMEORIGIN",
    
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create a response with security headers
 */
export function secureResponse(
  body?: BodyInit | null,
  init?: ResponseInit
): NextResponse {
  const response = new NextResponse(body, init);
  return applySecurityHeaders(response);
}

/**
 * Create a JSON response with security headers
 */
export function secureJsonResponse(
  data: unknown,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init);
  return applySecurityHeaders(response);
}
