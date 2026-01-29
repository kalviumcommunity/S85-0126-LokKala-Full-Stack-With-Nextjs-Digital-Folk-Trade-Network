import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENV, isProd } from "./env";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type TokenPayload = {
  sub: number;
  email: string;
  role: Role;
  ver: number; // refresh token version for rotation
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
};

function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS });
}

function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS });
}

export function generateTokenPair(user: { id: number; email: string; role: Role; refreshTokenVersion: number }): TokenPair {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    ver: user.refreshTokenVersion,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    accessExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthPayloadFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function attachAuthCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getAccessTokenFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }

  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function requireAuthPayload(req: Request): Promise<TokenPayload | null> {
  const token = await getAccessTokenFromRequest(req);
  if (!token) return null;
  return verifyAccessToken(token);
}
