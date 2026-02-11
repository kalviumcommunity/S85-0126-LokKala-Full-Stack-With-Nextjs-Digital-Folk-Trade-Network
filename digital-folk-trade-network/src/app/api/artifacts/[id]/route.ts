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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  
  // Get user if authenticated (optional)
  const auth = await requireAuthPayload(req);
  const role = (auth?.role || "GUEST") as AppRole;
  
  // Check read permission (all roles can read)
  checkAccess({
    role,
    action: "artifacts:read",
    resource: "artifacts",
    userId: auth?.sub,
    metadata: { artifactId: id },
  });
  
  const artifact = await prisma.artifact.findUnique({
    where: { id },
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  
  // Authenticate
  const auth = await requireAuthPayload(req);
  if (!auth) {
    return sendError("Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
  }
  
  // Get artifact to check ownership
  const artifact = await prisma.artifact.findUnique({
    where: { id },
  });
  
  if (!artifact) {
    return sendError("Artifact not found", ERROR_CODES.NOT_FOUND, 404);
  }
  
  // Check if user is owner
  const isOwner = verifyOwnership(artifact, "sellerId", auth.sub);
  
  // Check permission
  const decision = checkAccess({
    role: auth.role as AppRole,
    action: "artifacts:update",
    resource: "artifacts",
    isOwner,
    userId: auth.sub,
    metadata: { artifactId: id, isOwner },
  });
  
  if (!decision.allowed) {
    return sendError(
      "You can only update your own artifacts",
      ERROR_CODES.FORBIDDEN,
      403
    );
  }
  
  // Parse request body
  const body = await req.json();
  
  // Update artifact
  const updated = await prisma.artifact.update({
    where: { id },
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


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { user, error } = await withRBAC(req, {
    action: "artifacts:delete",
    resource: "artifacts",
  });
  
  if (error) return error;

  
  const { id: idStr } = await params;
  const id = Number(idStr);

  
  // Get artifact to check ownership
  const artifact = await prisma.artifact.findUnique({
    where: { id },
  });
  
  if (!artifact) {
    return sendError("Artifact not found", ERROR_CODES.NOT_FOUND, 404);
  }
  
  // Check ownership (admin can delete any, artists can delete own)
  const isOwner = verifyOwnership(artifact, "sellerId", user!.sub);
  
  if (user!.role !== "ADMIN" && !isOwner) {
    return sendError(
      "You can only delete your own artifacts",
      ERROR_CODES.FORBIDDEN,
      403
    );
  }
  
  // Delete artifact
  await prisma.artifact.delete({
    where: { id },
  });
  
  return sendSuccess({ id }, "Artifact deleted successfully");
}
