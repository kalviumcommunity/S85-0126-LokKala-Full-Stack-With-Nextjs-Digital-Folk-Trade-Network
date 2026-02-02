import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface JwtPayload {
  email: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- API protection ---
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // RBAC
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
      }

      // Attach user info
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  }

  // --- Page protection ---
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
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
