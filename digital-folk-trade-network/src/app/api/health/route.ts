import { NextResponse } from "next/server";
import { setCorsHeaders } from "@/lib/cors";

/**
 * GET /api/health
 * Public health check endpoint with CORS enabled
 */
export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  
  const response = NextResponse.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
  
  // Apply CORS headers
  return setCorsHeaders(response, origin);
}

/**
 * OPTIONS /api/health
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, origin);
}
