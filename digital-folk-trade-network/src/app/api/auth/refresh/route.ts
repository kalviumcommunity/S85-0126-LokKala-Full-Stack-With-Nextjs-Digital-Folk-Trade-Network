import { prisma } from "@/lib/prisma";
import {
  attachAuthCookies,
  generateTokenPair,
  getRefreshTokenFromCookies,
  verifyRefreshToken,
} from "@/lib/auth";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

export async function POST() {
  try {
    const token = getRefreshTokenFromCookies();
    if (!token) {
      return sendError("Refresh token missing", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return sendError("Invalid refresh token", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, refreshTokenVersion: true },
    });

    if (!user || user.refreshTokenVersion !== payload.ver) {
      return sendError("Refresh token expired or rotated", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenVersion: { increment: 1 } },
      select: { id: true, email: true, name: true, role: true, refreshTokenVersion: true },
    });

    const tokens = generateTokenPair(updated);
    const response = attachAuthCookies(
      sendSuccess(
        {
          user: updated,
          rotatedFromVersion: payload.ver,
          newRefreshTokenVersion: updated.refreshTokenVersion,
          accessExpiresInSeconds: tokens.accessExpiresIn,
          refreshExpiresInSeconds: tokens.refreshExpiresIn,
        },
        "Refresh token rotated"
      ),
      tokens
    );

    return response;
  } catch (error) {
    return sendError("Unable to refresh session", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
