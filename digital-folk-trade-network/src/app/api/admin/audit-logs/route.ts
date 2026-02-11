
import { requireAdmin } from "@/lib/rbacMiddleware";
import { getAuditLogs, getAuditStats } from "@/lib/rbac";
import { sendSuccess } from "@/lib/responseHandler";

/**
 * GET /api/admin/audit-logs
 * Get RBAC audit logs (Admin only)
 * 
 * Query params:
 * - limit: number of logs to return (default: 100)
 */
export async function GET(req: Request) {
  // Require admin role
  const { error } = await requireAdmin(req);
  if (error) return error;
  
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 100;
  
  const logs = getAuditLogs(limit);
  const stats = getAuditStats();
  
  return sendSuccess(
    {
      logs,
      stats,
      meta: {
        limit,
        returned: logs.length,
      },
    },
    "Audit logs retrieved successfully"
  );
}
