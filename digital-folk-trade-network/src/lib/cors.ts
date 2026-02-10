import { NextResponse } from "next/server";

/**
 * CORS Configuration
 * 
 * Configures Cross-Origin Resource Sharing for API routes
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://your-production-domain.com", // Replace with your actual domain
];

// Allowed HTTP methods
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

// Allowed headers
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "Origin",
];

/**
 * Set CORS headers on a response
 */
export function setCorsHeaders(
  response: NextResponse,
  origin?: string | null
): NextResponse {
  // Check if origin is allowed
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    // In development, allow all origins
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
  
  response.headers.set(
    "Access-Control-Allow-Methods",
    ALLOWED_METHODS.join(", ")
  );
  
  response.headers.set(
    "Access-Control-Allow-Headers",
    ALLOWED_HEADERS.join(", ")
  );
  
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  
  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(origin?: string | null): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, origin);
}

/**
 * Middleware helper for API routes
 */
export function withCors(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    const origin = req.headers.get("origin");
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return handleCorsPreFlight(origin);
    }
    
    // Execute the handler
    const response = await handler(req);
    
    // Add CORS headers to the response
    return setCorsHeaders(response, origin);
  };
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === "development") return true;
  return ALLOWED_ORIGINS.includes(origin);
}
