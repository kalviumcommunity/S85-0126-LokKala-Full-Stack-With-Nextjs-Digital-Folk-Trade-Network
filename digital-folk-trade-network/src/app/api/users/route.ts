import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({
      role: auth.role,
      action: "users:read",
      resource: "users",
    });

    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    // Example: Replace with actual user fetching logic
    // const users = await prisma.user.findMany();
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    return sendSuccess(users, "Users fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err,
    );
  }
}
