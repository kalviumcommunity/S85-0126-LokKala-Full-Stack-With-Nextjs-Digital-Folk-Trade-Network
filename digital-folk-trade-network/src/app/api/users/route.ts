import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET() {
  try {
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
    const body = await req.json();
    const data = userSchema.parse(body);

    // TODO: Insert user creation logic here (e.g., save to DB)
    // const user = await prisma.user.create({ data });

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
    return sendError("Unexpected error", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}