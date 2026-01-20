import { ENV, isDevelopment } from '@/lib/env';
import { sendSuccess, sendError , ERROR_CODES } from "@/lib/responseHandler";

export async function GET() {
  try {
    // Accessing server-side only variables (safe)
    const hasDatabase = !!ENV.DATABASE_URL;
    const hasJwtSecret = !!ENV.JWT_SECRET;

    // Build the response data
    const data = {
      message: 'Environment Variables Demo - Server Side',
      environment: {
        nodeEnv: ENV.NODE_ENV,
        isDevelopment: isDevelopment,
        appName: ENV.NEXT_PUBLIC_APP_NAME,
        appVersion: ENV.NEXT_PUBLIC_APP_VERSION,
        apiBaseUrl: ENV.NEXT_PUBLIC_API_BASE_URL,
      },
      configStatus: {
        database: hasDatabase ? '✅ Configured' : '❌ Missing',
        authentication: hasJwtSecret ? '✅ Configured' : '❌ Missing',
        stripe: ENV.STRIPE_SECRET_KEY ? '✅ Configured' : '⚠️ Test mode',
      },
      security: {
        secretsExposed: false,
        jwtSecretExposed: '***' + (ENV.JWT_SECRET ? ENV.JWT_SECRET.slice(-4) : ''),
        databaseUrlExposed: '***' + (ENV.DATABASE_URL ? ENV.DATABASE_URL.split('@').pop() : ''),
      },
      note: 'Server-side environment variables are safe. Never expose secrets in API responses.',
    };

    return sendSuccess(data, "Env info fetched successfully");
  } catch (err) {
    return sendError("Failed to fetch env info", ERROR_CODES.INTERNAL_ERROR, 500, err);
  }
}