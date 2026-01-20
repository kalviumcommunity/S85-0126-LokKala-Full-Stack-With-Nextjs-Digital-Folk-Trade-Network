import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

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