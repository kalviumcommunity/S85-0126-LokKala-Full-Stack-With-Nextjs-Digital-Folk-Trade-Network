import { NextResponse } from "next/server";
import { requireAuthPayload, TokenPayload } from "./auth";
import { AppRole, checkAccess } from "./rbac";
import { ERROR_CODES, sendError } from "./responseHandler";

/* =========================
   Types
   ========================= */

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface RBACOptions {
  action: string;
  resource?: string;
  requireOwnership?: boolean;
  customCheck?: (user: TokenPayload) => boolean;
}

/* =========================
   Middleware Helpers
   ========================= */

/**
 * Protect API route with authentication and authorization
 * 
 * @example
 * export async function DELETE(req: Request, { params }: { params: { id: string } }) {
 *   const { user, error } = await withRBAC(req, {
 *     action: "artifacts:delete",
 *     resource: "artifacts",
 *     requireOwnership: true,
 *   });
 *   
 *   if (error) return error;
 *   
 *   // User is authenticated and authorized
 *   // ...
 * }
 */
export async function withRBAC(
  req: Request,
  options: RBACOptions
): Promise<{ user?: TokenPayload; error?: NextResponse }> {
  // 1. Authenticate
  const auth = await requireAuthPayload(req);
  
  if (!auth) {
    return {
      error: sendError("Authentication required", ERROR_CODES.UNAUTHORIZED, 401),
    };
  }
  
  // 2. Custom check (if provided)
  if (options.customCheck && !options.customCheck(auth)) {
    return {
      error: sendError("Access denied", ERROR_CODES.FORBIDDEN, 403),
    };
  }
  
  // 3. RBAC check
  const decision = checkAccess({
    role: auth.role as AppRole,
    action: options.action,
    resource: options.resource,
    isOwner: options.requireOwnership,
    userId: auth.sub,
  });
  
  if (!decision.allowed) {
    return {
      error: sendError(
        decision.reason || "Insufficient permissions",
        ERROR_CODES.FORBIDDEN,
        403
      ),
    };
  }
  
  // Success - user is authenticated and authorized
  return { user: auth };
}

/**
 * Require specific role(s)
 * 
 * @example
 * export async function POST(req: Request) {
 *   const { user, error } = await requireRole(req, ["ADMIN", "ARTIST"]);
 *   if (error) return error;
 *   // ...
 * }
 */
export async function requireRole(
  req: Request,
  roles: AppRole | AppRole[]
): Promise<{ user?: TokenPayload; error?: NextResponse }> {
  const auth = await requireAuthPayload(req);
  
  if (!auth) {
    return {
      error: sendError("Authentication required", ERROR_CODES.UNAUTHORIZED, 401),
    };
  }
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(auth.role as AppRole)) {
    return {
      error: sendError(
        `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
        ERROR_CODES.FORBIDDEN,
        403
      ),
    };
  }
  
  return { user: auth };
}

/**
 * Require admin role
 * 
 * @example
 * export async function DELETE(req: Request) {
 *   const { user, error } = await requireAdmin(req);
 *   if (error) return error;
 *   // ...
 * }
 */
export async function requireAdmin(
  req: Request
): Promise<{ user?: TokenPayload; error?: NextResponse }> {
  return requireRole(req, "ADMIN");
}

/**
 * Check ownership of a resource
 * Useful when you need to verify user owns the resource before allowing action
 * 
 * @example
 * export async function PUT(req: Request, { params }: { params: { id: string } }) {
 *   const auth = await requireAuthPayload(req);
 *   if (!auth) return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
 *   
 *   const artifact = await prisma.artifact.findUnique({ where: { id: Number(params.id) } });
 *   if (!artifact) return sendError("Not found", ERROR_CODES.NOT_FOUND, 404);
 *   
 *   const isOwner = artifact.sellerId === auth.sub;
 *   
 *   const decision = checkAccess({
 *     role: auth.role as AppRole,
 *     action: "artifacts:update",
 *     isOwner,
 *     userId: auth.sub,
 *   });
 *   
 *   if (!decision.allowed) {
 *     return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
 *   }
 *   
 *   // ...
 * }
 */
export function verifyOwnership<T extends { [key: string]: unknown }>(
  resource: T,
  ownerField: keyof T,
  userId: number
): boolean {
  return resource[ownerField] === userId;
}

/**
 * Higher-order function to protect route handlers
 * 
 * @example
 * export const DELETE = protectRoute(
 *   async (req: Request, { params }: { params: { id: string } }) => {
 *     // Handler code here
 *     return NextResponse.json({ success: true });
 *   },
 *   {
 *     action: "artifacts:delete",
 *     resource: "artifacts",
 *   }
 * );
 */
export function protectRoute<T extends unknown[]>(
  handler: (req: Request, ...args: T) => Promise<NextResponse>,
  options: RBACOptions
) {
  return async (req: Request, ...args: T): Promise<NextResponse> => {
    const { user, error } = await withRBAC(req, options);
    
    if (error) {
      return error;
    }
    
    // Attach user to request for convenience
    (req as AuthenticatedRequest).user = user;
    
    return handler(req, ...args);
  };
}
