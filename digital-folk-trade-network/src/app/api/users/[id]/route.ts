import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const auth = requireAuthPayload(request);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const isOwner = auth.sub === Number(id);
    const decision = checkAccess({
      role: auth.role,
      action: "users:read",
      resource: `users/${id}`,
      isOwner,
      reason: isOwner ? "self profile" : undefined,
    });

    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    // Example: Replace with actual user lookup logic
    // const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    // if (!user) {
    //   return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    // }
    // return sendSuccess(user, "User found");

    // Demo logic
    if (id === "1") {
      return sendSuccess({ id: 1, name: "Alice" }, "User found");
    } else if (id === "2") {
      return sendSuccess({ id: 2, name: "Bob" }, "User found");
    } else {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }
  } catch (err) {
    return sendError("Failed to fetch user", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}