import { handleError } from '@/lib/errorHandler';

export async function GET(req: Request) {
  try {
    // Your user logic here
    return new Response(JSON.stringify({ success: true, message: "User route accessible to all authenticated users." }), { status: 200 });
  } catch (error) {
    return handleError(error, { req });
  }
}