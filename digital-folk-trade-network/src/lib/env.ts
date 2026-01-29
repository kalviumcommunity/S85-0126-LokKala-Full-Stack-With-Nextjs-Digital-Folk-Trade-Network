import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 chars"),
	JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET should be at least 32 chars"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("❌ Invalid environment variables", parsed.error.flatten().fieldErrors);
	throw new Error("Invalid environment variables. Check .env values.");
}

export const ENV = parsed.data;
export type Env = typeof ENV;

export const isProd = ENV.NODE_ENV === "production";
export const isDev = ENV.NODE_ENV === "development";