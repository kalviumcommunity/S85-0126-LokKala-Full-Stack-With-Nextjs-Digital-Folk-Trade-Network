import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { NextRequest } from "next/server";

// import { prisma } from "@/lib/prisma"; // Uncomment when wiring to your DB

const mockProjects = [
  { id: 1, name: "LokKala Marketplace", owner: "Alice", status: "planning" },
  { id: 2, name: "Folk Artifact Catalog", owner: "Bob", status: "in-progress" },
  { id: 3, name: "Payment Integration", owner: "Charlie", status: "done" },
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
    const status = searchParams.get("status")?.toLowerCase();
    const search = searchParams.get("search")?.toLowerCase();

    const filtered = mockProjects.filter((project) => {
      const matchesStatus = status ? project.status.toLowerCase() === status : true;
      const matchesSearch = search
        ? `${project.name} ${project.owner}`.toLowerCase().includes(search)
        : true;
      return matchesStatus && matchesSearch;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

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
      "Projects fetched successfully"
    );
  } catch (err) {
    return sendError("Failed to fetch projects", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.owner) {
      return sendError("Missing required fields: name and owner", ERROR_CODES.BAD_REQUEST, 400);
    }

    const created = {
      id: mockProjects.length + 1,
      status: body.status || "planning",
      ...body,
    };

    // TODO: Replace mock logic with DB persistence (e.g., prisma.project.create)
    return sendSuccess(created, "Project created successfully", 201);
  } catch (err) {
    return sendError("Failed to create project", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}