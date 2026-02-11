import { NextRequest } from "next/server";
import { requireAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

const USERS_CACHE_TTL_SECONDS = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 main
  try {
    const { id } = await params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return sendError("Invalid user id", ERROR_CODES.BAD_REQUEST, 400);
    }


    const auth = await requireAuthPayload(request);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const isOwner = auth.sub === userId;

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

    const cacheKey = `user:${userId}`;
    const cacheStart = Date.now();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const user = JSON.parse(cached);
        console.log(`[Cache] ${cacheKey} hit (${Date.now() - cacheStart}ms)`);
        return sendSuccess(user, "User found (cache)");
      }
    } catch (error) {
      console.warn(`[Cache] ${cacheKey} read failed`, error);
    }

    const dbStart = Date.now();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    try {
      await redis.set(
        cacheKey,
        JSON.stringify(user),
        "EX",
        USERS_CACHE_TTL_SECONDS
      );
      console.log(
        `[Cache] ${cacheKey} miss -> cached for ${USERS_CACHE_TTL_SECONDS}s (${Date.now() - dbStart}ms)`
      );
    } catch (error) {
      console.warn(`[Cache] ${cacheKey} write failed`, error);
    }

    return sendSuccess(user, "User found");
  } catch (err) {
    return sendError(
      "Failed to fetch user",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}
