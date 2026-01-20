import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, artifacts, orders, reviews] = await Promise.all([
      prisma.user.count(),
      prisma.artifact.count(),
      prisma.order.count(),
      prisma.review.count(),
    ]);

    const data = {
      totals: { users, artifacts, orders, reviews }
    };

    return sendSuccess(data, "Prisma health check successful");
  } catch (error) {
    console.error('Prisma health check failed', error);
    return sendError(
      "Prisma health check failed",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}