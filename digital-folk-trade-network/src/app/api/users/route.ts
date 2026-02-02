import { prisma } from "@/lib/prisma";
import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";

const USERS_CACHE_KEY = "users:list";
const USERS_CACHE_TTL_SECONDS = 60;

/* =========================
   GET /api/users
   ========================= */
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

    // 1️⃣ Try cache first
    try {
      const cached = await redis.get(USERS_CACHE_KEY);
      if (cached) {
        const cachedUsers = JSON.parse(cached);
        return sendSuccess(cachedUsers, "Users fetched from cache");
      }
    } catch (error) {
      console.warn("[Cache] read failed", error);
    }

    // 2️⃣ Fetch from DB
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

    // 3️⃣ Store in cache
    try {
      await redis.set(
        USERS_CACHE_KEY,
        JSON.stringify(users),
        "EX",
        USERS_CACHE_TTL_SECONDS
      );
    } catch (error) {
      console.warn("[Cache] write failed", error);
    }

    return sendSuccess(users, "Users fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}

/* =========================
   POST /api/users
   ========================= */
export async function POST(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({
      role: auth.role,
      action: "users:write",
      resource: "users",
    });

    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    const body = await req.json();
    const data = userSchema.parse(body);

    // TODO: create user in DB
    // const user = await prisma.user.create({ data });

    // Invalidate cache
    await redis.del(USERS_CACHE_KEY);

    return sendSuccess(data, "User created successfully", 201);
  } catch (err) {
    return sendError(
      "Failed to create user",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}
