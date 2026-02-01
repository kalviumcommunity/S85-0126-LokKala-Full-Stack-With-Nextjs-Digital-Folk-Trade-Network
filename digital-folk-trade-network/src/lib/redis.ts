import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const globalForRedis = global as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    // Prevent runaway retry storms during local dev
    maxRetriesPerRequest: 2,
  });

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
}
