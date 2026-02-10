/** @jest-environment node */
import { GET, POST } from "@/app/api/users/route";
import * as authModule from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as rbacModule from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { ERROR_CODES } from "@/lib/responseHandler";

jest.mock("@/lib/auth", () => ({ requireAuthPayload: jest.fn() }));
jest.mock("@/lib/rbac", () => ({ checkAccess: jest.fn() }));
jest.mock("@/lib/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

const mockAuth = authModule as jest.Mocked<typeof authModule>;
const mockRbac = rbacModule as jest.Mocked<typeof rbacModule>;
const mockRedis = redis as jest.Mocked<typeof redis>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const authAdmin = { role: "ADMIN" };

describe("API /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("rejects when unauthenticated", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(null);

      const res = await GET(new Request("http://localhost/api/users"));
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    });

    it("rejects when forbidden", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue({ role: "USER" });
      mockRbac.checkAccess.mockReturnValue({ allowed: false });

      const res = await GET(new Request("http://localhost/api/users"));
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.error.code).toBe(ERROR_CODES.FORBIDDEN);
    });

    it("returns cached users when present", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(authAdmin);
      mockRbac.checkAccess.mockReturnValue({ allowed: true });
      const cachedUsers = [{ id: "1", name: "Cached", email: "c@e.com", role: "ADMIN", createdAt: "2024-01-01" }];
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedUsers));

      const res = await GET(new Request("http://localhost/api/users"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual(cachedUsers);
      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    });

    it("hits DB and caches when no cache entry", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(authAdmin);
      mockRbac.checkAccess.mockReturnValue({ allowed: true });
      mockRedis.get.mockResolvedValue(null);
      const users = [{ id: "2", name: "DB User", email: "db@e.com", role: "USER", createdAt: new Date().toISOString() }];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockRedis.set.mockResolvedValue(true);

      const res = await GET(new Request("http://localhost/api/users"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual(users);
      expect(mockRedis.set).toHaveBeenCalledWith(
        "users:list",
        JSON.stringify(users),
        "EX",
        60,
      );
    });
  });

  describe("POST", () => {
    const baseBody = { name: "Alice", email: "alice@example.com", age: 22 };

    it("rejects when unauthorized", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(null);

      const res = await POST(
        new Request("http://localhost/api/users", { method: "POST", body: JSON.stringify(baseBody) })
      );
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    });

    it("rejects when forbidden", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue({ role: "USER" });
      mockRbac.checkAccess.mockReturnValue({ allowed: false });

      const res = await POST(
        new Request("http://localhost/api/users", { method: "POST", body: JSON.stringify(baseBody) })
      );
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.error.code).toBe(ERROR_CODES.FORBIDDEN);
    });

    it("returns validation errors", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(authAdmin);
      mockRbac.checkAccess.mockReturnValue({ allowed: true });

      const res = await POST(
        new Request("http://localhost/api/users", { method: "POST", body: JSON.stringify({}) })
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe(ERROR_CODES.BAD_REQUEST);
      expect((body.error.details as unknown[]).length).toBeGreaterThan(0);
    });

    it("blocks potential SQL injection", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(authAdmin);
      mockRbac.checkAccess.mockReturnValue({ allowed: true });

      const res = await POST(
        new Request("http://localhost/api/users", {
          method: "POST",
          body: JSON.stringify({ name: "' OR 1=1", email: "evil@example.com", age: 25 }),
        }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe(ERROR_CODES.BAD_REQUEST);
      const details = body.error.details as Record<string, unknown>;
      expect(String(details.input)).toContain("' OR 1=1");
    });

    it("creates user and invalidates cache", async () => {
      mockAuth.requireAuthPayload.mockResolvedValue(authAdmin);
      mockRbac.checkAccess.mockReturnValue({ allowed: true });
      mockRedis.del.mockResolvedValue(true);

      const res = await POST(
        new Request("http://localhost/api/users", {
          method: "POST",
          body: JSON.stringify(baseBody),
        }),
      );
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.data.name).toBe(baseBody.name);
      expect(mockRedis.del).toHaveBeenCalledWith("users:list");
    });
  });
});
