import { requireAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
// import { handleError } from '@/lib/errorHandler'; // formatting: keep imports at the top if needed

const USERS_CACHE_KEY = "users:list";
const USERS_CACHE_TTL_SECONDS = 60;

export async function GET(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "users:read", resource: "users" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    const cacheStart = Date.now();
    try {
      const cached = await redis.get(USERS_CACHE_KEY);
      if (cached) {
        const users = JSON.parse(cached);
        console.log(`[Cache] ${USERS_CACHE_KEY} hit (${Date.now() - cacheStart}ms)`);
        return sendSuccess(users, "Users fetched from cache");
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
    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function POST(req: Request) {
  try {
form_handling
    // 1. You must get the auth payload first before checking permissions
    const auth = await requireAuthPayload(req);
    if (!auth) {
        return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    // 2. Now check access using the auth data
    const auth = requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

 main
    const decision = checkAccess({ role: auth.role, action: "users:write", resource: "users" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    const body = await req.json();
    const data = userSchema.parse(body);

    // TODO: Insert user creation logic here (e.g., save to DB)
    // const user = await prisma.user.create({ data });

    await redis.del(USERS_CACHE_KEY);
    console.log(`[Cache] ${USERS_CACHE_KEY} invalidated after POST /api/users`);

    return sendSuccess(data, "User created successfully", 201);
  } catch (err) {
    // 3. Added the missing catch block to close the function
    return sendError("Failed to create user", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}