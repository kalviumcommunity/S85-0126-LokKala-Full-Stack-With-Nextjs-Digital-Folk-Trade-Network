import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockTasks = [
  { id: 1, title: "Sketch landing page", status: "todo", assignee: "Alice" },
  { id: 2, title: "Refine artifact listing", status: "in-progress", assignee: "Bob" },
  { id: 3, title: "QA purchase flow", status: "done", assignee: "Charlie" },
];

const parsePagination = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  if (page < 1 || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  return { page, limit, searchParams };
};

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req);
    if ("error" in pagination) {
      return sendError("Invalid pagination parameters", ERROR_CODES.BAD_REQUEST, 400, pagination.error);
    }

    const { page, limit, searchParams } = pagination;
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status")?.toLowerCase();

    const filteredTasks = mockTasks.filter((task) => {
      const matchesStatus = status ? task.status.toLowerCase() === status : true;
      const matchesSearch = search
        ? `${task.title} ${task.assignee}`.toLowerCase().includes(search)
        : true;
      return matchesStatus && matchesSearch;
    });

    const total = filteredTasks.length;
    const start = (page - 1) * limit;
    const data = filteredTasks.slice(start, start + limit);

    return sendSuccess(
      {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      "Tasks fetched successfully"
    );
  } catch (err) {
    return sendError("Failed to fetch tasks", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.title) {
      return sendError("Missing required field: title", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const newTask = {
      id: mockTasks.length + 1,
      status: data.status || "todo",
      assignee: data.assignee || "unassigned",
      ...data,
    };

    // TODO: Replace mock logic with DB persistence (e.g., prisma.task.create)
    return sendSuccess(newTask, "Task created successfully", 201);
  } catch (err) {
    return sendError("Internal Server Error", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}