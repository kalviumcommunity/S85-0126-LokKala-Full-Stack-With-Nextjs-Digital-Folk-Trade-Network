import { clearAuthCookies, getAuthPayloadFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

/**
 * Logout endpoint
 * - Clears both access and refresh token cookies
 * - Increments user's refresh token version to invalidate all existing refresh tokens
 * - Provides defense against token replay attacks
 */
export async function POST() {
  try {
    // Get user from current session
    const payload = await getAuthPayloadFromCookies();
    
    if (payload) {
      // Invalidate all refresh tokens by incrementing version
      await prisma.user.update({
        where: { id: payload.sub },
        data: { refreshTokenVersion: { increment: 1 } },
      });
      
      console.log(`[SECURITY] User ${payload.email} logged out. Refresh token version rotated to prevent replay attacks.`);
    }

    // Clear cookies regardless of session state
    const response = clearAuthCookies(
      sendSuccess(
        { message: "Logged out successfully" },
        "Logout successful"
      )
    );

    return response;
  } catch (error) {
    return sendError(
      "Unable to logout",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error
    );
  }
}
