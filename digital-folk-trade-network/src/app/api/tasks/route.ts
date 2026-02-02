import { requireAuthPayload } from "@/lib/auth";
import { checkAccess } from "@/lib/rbac";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { detectSqlInjection, sanitizeObject } from "@/lib/sanitize";
// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "tasks:read", resource: "tasks" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403, { permission: decision.permission });
    }

    // Example: Replace with actual task fetching logic
    // const tasks = await prisma.task.findMany();
    const tasks = [
      { id: 1, title: "Sample Task 1" },
      { id: 2, title: "Sample Task 2" }
    ];
    return sendSuccess(tasks, "Tasks fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch tasks",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthPayload(req);
    if (!auth) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decision = checkAccess({ role: auth.role, action: "tasks:write", resource: "tasks" });
    if (!decision.allowed) {
      return sendError("Forbidden", ERROR_CODES.FORBIDDEN, 403, { permission: decision.permission });
    }

    const body = await req.json();
    const data = sanitizeObject(body);

    const sqliHit = detectSqlInjection([data.title]);
    if (sqliHit) {
      return sendError(
        "Potential SQL injection detected; request blocked",
        ERROR_CODES.BAD_REQUEST,
        400,
        { input: sqliHit }
      );
    }

    if (!data.title) {
      return sendError(
        "Missing required field: title",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Example: Replace with actual task creation logic
    // const newTask = await prisma.task.create({ data });
    // return sendSuccess(newTask, "Task created successfully", 201);

    // For demonstration, just echo the data
    return sendSuccess(data, "Task created successfully", 201);
  } catch (err) {
    return sendError(
      "Internal Server Error",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}