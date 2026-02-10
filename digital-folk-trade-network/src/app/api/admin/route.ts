import { requireAdmin } from "@/lib/rbacMiddleware";
import { sendSuccess } from "@/lib/responseHandler";

/**
 * GET /api/admin
 * Admin-only endpoint
 */
export async function GET(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  
  return sendSuccess(
    {
      message: "Welcome Admin! You have full access.",
      user: {
        id: user!.sub,
        email: user!.email,
        role: user!.role,
      },
    },
    "Admin access granted"
  );
}
