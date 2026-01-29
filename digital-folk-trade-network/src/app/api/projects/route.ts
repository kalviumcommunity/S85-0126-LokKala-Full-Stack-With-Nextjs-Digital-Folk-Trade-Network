import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

export async function GET(req: Request) {
  try {
    const auth = requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "projects:read", resource: "projects" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403, { permission: decision.permission });
    }

    // Example: Replace with actual project fetching logic
    const projects = [{ id: 1, name: "Project A" }, { id: 2, name: "Project B" }];
    return sendSuccess(projects, "Projects fetched successfully");
  } catch (err) {
    return sendError("Failed to fetch projects", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}