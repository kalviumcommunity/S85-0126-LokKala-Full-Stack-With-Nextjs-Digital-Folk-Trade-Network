import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Example: Replace with actual user lookup logic
    // const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    // if (!user) {
    //   return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    // }
    // return sendSuccess(user, "User found");

    // Demo logic
    if (id === "1") {
      return sendSuccess({ id: 1, name: "Alice" }, "User found");
    } else if (id === "2") {
      return sendSuccess({ id: 2, name: "Bob" }, "User found");
    } else {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }
  } catch (err) {
    return sendError("Failed to fetch user", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}