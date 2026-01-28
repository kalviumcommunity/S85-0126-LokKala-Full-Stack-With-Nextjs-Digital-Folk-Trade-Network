import { requireAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

export async function GET(req: Request) {
  const payload = requireAuthPayload(req);
  if (!payload) {
    return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
  }

  return sendSuccess({ user, tokenVersion: payload.ver }, "Authenticated");
}
