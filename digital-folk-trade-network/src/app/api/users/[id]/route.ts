import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockUsers = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 29 },
  { id: 2, name: "Bob", email: "bob@example.com", age: 32 },
];

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      return sendError("Invalid user id", ERROR_CODES.BAD_REQUEST, 400);
    }

    // Example: Replace with actual user lookup logic
    // const user = await prisma.user.findUnique({ where: { id: numericId } });
    // if (!user) return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    // return sendSuccess(user, "User found");

    const user = mockUsers.find((entry) => entry.id === numericId);
    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(user, "User found");
  } catch (err) {
    return sendError("Failed to fetch user", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const numericId = Number(params.id);
    if (Number.isNaN(numericId)) {
      return sendError("Invalid user id", ERROR_CODES.BAD_REQUEST, 400);
    }

    const payload = await request.json();
    const parsed = userSchema.partial().parse(payload);

    // TODO: Replace with DB update logic, e.g. prisma.user.update({ where: { id: numericId }, data: parsed })
    const existing = mockUsers.find((entry) => entry.id === numericId);
    if (!existing) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    const updatedUser = { ...existing, ...parsed };
    return sendSuccess(updatedUser, "User updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError("Validation Error", ERROR_CODES.BAD_REQUEST, 400, error.issues);
    }
    return sendError("Failed to update user", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const numericId = Number(params.id);
    if (Number.isNaN(numericId)) {
      return sendError("Invalid user id", ERROR_CODES.BAD_REQUEST, 400);
    }

    // TODO: Replace with DB delete logic
    const exists = mockUsers.some((entry) => entry.id === numericId);
    if (!exists) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess({ id: numericId }, "User deleted successfully");
  } catch (err) {
    return sendError("Failed to delete user", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}