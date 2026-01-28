import { clearAuthCookies } from "@/lib/auth";
import { sendSuccess } from "@/lib/responseHandler";

export async function POST() {
  const response = clearAuthCookies(sendSuccess({ loggedOut: true }, "Logged out"));
  return response;
}
