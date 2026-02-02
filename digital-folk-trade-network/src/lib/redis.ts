// src/lib/redis.ts
// Redis is intentionally DISABLED in local development.
// Cache must NEVER break auth or routing.

export const redis = {
  async get(_key: string) {
    return null;
  },

  async set(
    _key: string,
    _value: string,
    _mode?: string,
    _ttl?: number
  ) {
    return null;
  },

  async del(_key: string) {
    return null;
  },
};
