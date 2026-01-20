import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
// import { prisma } from "@/lib/prisma"; // Uncomment if you use Prisma

export async function GET() {
  try {
    // Example: Replace with actual task fetching logic
    // const tasks = await prisma.task.findMany();
    const tasks = [
      { id: 1, title: "Sample Task 1" },
      { id: 2, title: "Sample Task 2" }
    ];
    return sendSuccess(tasks, "Tasks fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch tasks",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.title) {
      return sendError(
        "Missing required field: title",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Example: Replace with actual task creation logic
    // const newTask = await prisma.task.create({ data });
    // return sendSuccess(newTask, "Task created successfully", 201);

    // For demonstration, just echo the data
    return sendSuccess(data, "Task created successfully", 201);
  } catch (err) {
    return sendError(
      "Internal Server Error",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}