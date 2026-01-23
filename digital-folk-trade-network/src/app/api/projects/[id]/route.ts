import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockProjects = [
  { id: 1, name: "LokKala Marketplace", owner: "Alice", status: "planning" },
  { id: 2, name: "Folk Artifact Catalog", owner: "Bob", status: "in-progress" },
  { id: 3, name: "Payment Integration", owner: "Charlie", status: "done" },
];

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid project id", ERROR_CODES.BAD_REQUEST, 400);
    }

    // const project = await prisma.project.findUnique({ where: { id } });
    const project = mockProjects.find((entry) => entry.id === id);
    if (!project) {
      return sendError("Project not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(project, "Project found");
  } catch (err) {
    return sendError("Failed to fetch project", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid project id", ERROR_CODES.BAD_REQUEST, 400);
    }

    const body = await request.json();
    if (!body.name && !body.owner && !body.status) {
      return sendError("No fields provided for update", ERROR_CODES.BAD_REQUEST, 400);
    }

    // const updated = await prisma.project.update({ where: { id }, data: body });
    const existing = mockProjects.find((entry) => entry.id === id);
    if (!existing) {
      return sendError("Project not found", ERROR_CODES.NOT_FOUND, 404);
    }

    const updated = { ...existing, ...body };
    return sendSuccess(updated, "Project updated successfully");
  } catch (err) {
    return sendError("Failed to update project", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid project id", ERROR_CODES.BAD_REQUEST, 400);
    }

    const exists = mockProjects.some((entry) => entry.id === id);
    if (!exists) {
      return sendError("Project not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // await prisma.project.delete({ where: { id } });
    return sendSuccess({ id }, "Project deleted successfully");
  } catch (err) {
    return sendError("Failed to delete project", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}
