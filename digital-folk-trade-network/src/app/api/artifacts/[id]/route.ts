import { NextRequest } from "next/server";
import { requireAuthPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppRole, checkAccess } from "@/lib/rbac";
import { withRBAC, verifyOwnership } from "@/lib/rbacMiddleware";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

/**
 * GET /api/artifacts/[id]
 * Get a specific artifact (Public, but logs access)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const artifactId = Number(id);
  
  // Get user if authenticated (optional)

  const auth = await requireAuthPayload(req);
  const role = (auth?.role || "GUEST") as AppRole;

  checkAccess({
    role,
    action: "artifacts:read",
    resource: "artifacts",
    userId: auth?.sub,
    metadata: { artifactId },
  });

  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
    },
  });

  if (!artifact) {
    return sendError("Artifact not found", ERROR_CODES.NOT_FOUND, 404);
  }

  return sendSuccess(artifact, "Artifact retrieved successfully");
}

/**
 * PUT /api/artifacts/[id]
 * Update an artifact (Owner or Admin only)
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const artifactId = Number(id);
  
  // Authenticate

  const auth = await requireAuthPayload(req);
  if (!auth) {
    return sendError("Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
  }

  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
  });

  if (!artifact) {
    return sendError("Artifact not found", ERROR_CODES.NOT_FOUND, 404);
  }

  const isOwner = verifyOwnership(artifact, "sellerId", auth.sub);

  const decision = checkAccess({
    role: auth.role as AppRole,
    action: "artifacts:update",
    resource: "artifacts",
    isOwner,
    userId: auth.sub,
    metadata: { artifactId, isOwner },
  });

  if (!decision.allowed) {
    return sendError(
      "You can only update your own artifacts",
      ERROR_CODES.FORBIDDEN,
      403
    );
  }

  const body = await req.json();

  const updated = await prisma.artifact.update({
    where: { id: artifactId },
    data: {
      ...body,
      updatedAt: new Date(),
    },
  });

  return sendSuccess(updated, "Artifact updated successfully");
}

/**
 * DELETE /api/artifacts/[id]
 * Delete an artifact (Owner or Admin only)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const artifactId = Number(id);

  const { user, error } = await withRBAC(req, {
    action: "artifacts:delete",
    resource: "artifacts",
  });

  if (error) return error;
  
  // Get artifact to check ownership

  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
  });

  if (!artifact) {
    return sendError("Artifact not found", ERROR_CODES.NOT_FOUND, 404);
  }

  const isOwner = verifyOwnership(artifact, "sellerId", user!.sub);

  if (user!.role !== "ADMIN" && !isOwner) {
    return sendError(
      "You can only delete your own artifacts",
      ERROR_CODES.FORBIDDEN,
      403
    );
  }

  await prisma.artifact.delete({
    where: { id: artifactId },
  });

  return sendSuccess({ id: artifactId }, "Artifact deleted successfully");
}
