import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";

export async function GET() {
  try {
    // Example: Replace with actual project fetching logic
    const projects = [{ id: 1, name: "Project A" }, { id: 2, name: "Project B" }];
    return sendSuccess(projects, "Projects fetched successfully");
  } catch (err) {
    return sendError("Failed to fetch projects", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}