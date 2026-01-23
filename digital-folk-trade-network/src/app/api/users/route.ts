import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { userSchema } from "@/lib/schemas/userSchema";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockUsers = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 29 },
  { id: 2, name: "Bob", email: "bob@example.com", age: 32 },
  { id: 3, name: "Charlie", email: "charlie@example.com", age: 24 },
  { id: 4, name: "Diana", email: "diana@example.com", age: 28 },
];

const parsePagination = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  if (page < 1 || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  return { page, limit, searchParams };
};

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    if ("error" in pagination) {
      return sendError(
        "Invalid pagination parameters",
        ERROR_CODES.BAD_REQUEST,
        400,
        pagination.error
      );
    }

    const { page, limit, searchParams } = pagination;
    const search = searchParams.get("search")?.toLowerCase();

    const filteredUsers = search
      ? mockUsers.filter((user) =>
          `${user.name} ${user.email}`.toLowerCase().includes(search)
        )
      : mockUsers;

    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const data = filteredUsers.slice(start, start + limit);

    return sendSuccess(
      {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      "Users fetched successfully"
    );
  } catch (err) {
    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = userSchema.parse(body);

    // TODO: Replace mock logic with DB persistence (e.g., prisma.user.create)
    const createdUser = { id: mockUsers.length + 1, ...data };

    return sendSuccess(createdUser, "User created successfully", 201);
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