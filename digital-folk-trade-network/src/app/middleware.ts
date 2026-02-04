import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const ACCESS_TOKEN_COOKIE = "accessToken";

interface JwtPayload {
  sub: number;
  email: string;
  role: "ADMIN" | "USER";
  ver: number;
  iat?: number;
  exp?: number;
}

/**
 * Middleware for protecting routes with JWT authentication
 * 
 * Security Features:
 * - Reads access token from HTTP-only cookie (primary method)
 * - Falls back to Authorization header for API clients
 * - Implements Role-Based Access Control (RBAC)
 * - Prevents unauthorized access to protected routes
 * 
 * Protected Routes:
 * - /dashboard/* - Requires authentication
 * - /api/admin/* - Requires ADMIN role
 * - /api/users/* - Requires authentication
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- API protection ---
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    // Try to get token from cookie first (preferred), then Authorization header
    let token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    
    if (!token) {
      const authHeader = req.headers.get("authorization");
      token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required. No access token found." },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;

      // RBAC - Check for admin role
      if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Access denied. Admin privileges required." },
          { status: 403 }
        );
      }

      // Attach user info to request headers for downstream use
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.sub.toString());
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      const message = error instanceof jwt.TokenExpiredError 
        ? "Access token expired. Please refresh your session." 
        : "Invalid access token.";
      
      return NextResponse.json(
        { success: false, message },
        { status: 401 }
      );
    }
  }

  // --- Page protection ---
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Token expired or invalid - redirect to login
      // Note: Client-side should automatically refresh via AuthContext
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/api/admin/:path*",
    "/api/users/:path*",
  ],
};
