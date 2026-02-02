import { requireAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { detectSqlInjection, sanitizeObject } from "@/lib/sanitize";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

const USERS_CACHE_KEY = "users:list";
const USERS_CACHE_TTL_SECONDS = 60;

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

    const cacheStart = Date.now();
    try {
      const cached = await redis.get(USERS_CACHE_KEY);
      if (cached) {
        const cachedUsers = JSON.parse(cached);
        console.log(`[Cache] ${USERS_CACHE_KEY} hit (${Date.now() - cacheStart}ms)`);
        return sendSuccess(cachedUsers, "Users fetched from cache");
      }
    } catch (error) {
      console.warn(`[Cache] ${USERS_CACHE_KEY} read failed`, error);
    }

    const dbStart = Date.now();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    try {
      await redis.set(USERS_CACHE_KEY, JSON.stringify(users), "EX", USERS_CACHE_TTL_SECONDS);
      console.log(
        `[Cache] ${USERS_CACHE_KEY} miss -> cached for ${USERS_CACHE_TTL_SECONDS}s (${Date.now() - dbStart}ms)`
      );
    } catch (error) {
      console.warn(`[Cache] ${USERS_CACHE_KEY} write failed`, error);
    }

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

export async function POST(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "users:write", resource: "users" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    const body = await req.json();
    const parsed = userSchema.parse(body);
    const data = sanitizeObject(parsed);

    const sqliHit = detectSqlInjection([data.name, data.email]);
    if (sqliHit) {
      return sendError(
        "Potential SQL injection detected; request blocked",
        ERROR_CODES.BAD_REQUEST,
        400,
        { input: sqliHit }
      );
    }

    // TODO: Insert user creation logic here (e.g., save to DB)
    // const user = await prisma.user.create({ data });

    await redis.del(USERS_CACHE_KEY);
    console.log(`[Cache] ${USERS_CACHE_KEY} invalidated after POST /api/users`);

    return sendSuccess(data, "User created successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        "Validation Error",
        ERROR_CODES.BAD_REQUEST,
        400,
        error.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        }))
      );
    }

    return sendError("Failed to create user", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
