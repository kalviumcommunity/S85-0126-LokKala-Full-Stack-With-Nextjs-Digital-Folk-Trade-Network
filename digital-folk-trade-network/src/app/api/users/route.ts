 RBAC
import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET(req: Request) {
  try {
    const auth = requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "users:read", resource: "users" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    // Example: Replace with actual user fetching logic
    // const users = await prisma.user.findMany();
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];
    return sendSuccess(users, "Users fetched successfully");
  } catch (err) {
    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const decision = checkAccess({ role: auth.role, action: "users:write", resource: "users" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }

    const body = await req.json();
    const data = userSchema.parse(body);

    // TODO: Insert user creation logic here (e.g., save to DB)
    // const user = await prisma.user.create({ data });

    return sendSuccess(data, "User created successfully", 201);
import { handleError } from '@/lib/errorHandler';

export async function GET(req: Request) {
  try {
    // Your user logic here
    return new Response(JSON.stringify({ success: true, message: "User route accessible to all authenticated users." }), { status: 200 });
 main
  } catch (error) {
    return handleError(error, { req });
  }
}