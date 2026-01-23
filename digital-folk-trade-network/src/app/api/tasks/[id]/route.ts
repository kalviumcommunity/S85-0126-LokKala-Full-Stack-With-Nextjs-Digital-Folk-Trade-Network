import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";

// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockTasks = [
  { id: 1, title: "Sketch landing page", status: "todo", assignee: "Alice" },
  { id: 2, title: "Refine artifact listing", status: "in-progress", assignee: "Bob" },
  { id: 3, title: "QA purchase flow", status: "done", assignee: "Charlie" },
];

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid task id", ERROR_CODES.BAD_REQUEST, 400);
    }

    // const task = await prisma.task.findUnique({ where: { id } });
    const task = mockTasks.find((entry) => entry.id === id);
    if (!task) {
      return sendError("Task not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(task, "Task found");
  } catch (err) {
    return sendError("Failed to fetch task", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid task id", ERROR_CODES.BAD_REQUEST, 400);
    }

    const body = await request.json();
    if (!body.title && !body.status && !body.assignee) {
      return sendError("No fields provided for update", ERROR_CODES.BAD_REQUEST, 400);
    }

    const existing = mockTasks.find((entry) => entry.id === id);
    if (!existing) {
      return sendError("Task not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // const updated = await prisma.task.update({ where: { id }, data: body });
    const updated = { ...existing, ...body };
    return sendSuccess(updated, "Task updated successfully");
  } catch (err) {
    return sendError("Failed to update task", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return sendError("Invalid task id", ERROR_CODES.BAD_REQUEST, 400);
    }

    const exists = mockTasks.some((entry) => entry.id === id);
    if (!exists) {
      return sendError("Task not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // await prisma.task.delete({ where: { id } });
    return sendSuccess({ id }, "Task deleted successfully");
  } catch (err) {
    return sendError("Failed to delete task", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}
