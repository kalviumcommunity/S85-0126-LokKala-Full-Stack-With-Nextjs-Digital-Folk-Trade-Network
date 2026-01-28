import { prisma } from "@/lib/prisma";
import { attachAuthCookies, generateTokenPair } from "@/lib/auth";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, role: true, refreshTokenVersion: true },
    });

    if (!user) {
      return sendError("Invalid email or password", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return sendError("Invalid email or password", ERROR_CODES.UNAUTHORIZED, 401);
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
          accessExpiresInSeconds: tokens.accessExpiresIn,
          refreshExpiresInSeconds: tokens.refreshExpiresIn,
          refreshTokenVersion: updated.refreshTokenVersion,
        },
        "Login successful"
      ),
      tokens
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(
        "Validation error",
        ERROR_CODES.BAD_REQUEST,
        400,
        error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
      );
    }

    return sendError("Unable to login", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
