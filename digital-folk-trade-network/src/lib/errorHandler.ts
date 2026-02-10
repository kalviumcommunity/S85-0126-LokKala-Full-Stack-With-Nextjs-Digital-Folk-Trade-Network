import { logger } from './logger';

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: 'Unknown error', stack: undefined };
}

export function handleError(error: unknown, context: { req: Request }) {
  const env = process.env.NODE_ENV;
  const isDev = env === 'development';
  const details = getErrorDetails(error);

  // Log error
  logger.error(
    `Error in ${context.req.method} ${context.req.url}`,
    {
      message: details.message,
      stack: isDev ? details.stack ?? 'REDACTED' : 'REDACTED',
    }
  );

  // Prepare response
  const response: Record<string, unknown> = {
    success: false,
    message: isDev
      ? details.message
      : 'Something went wrong. Please try again later.',
  };
  if (isDev) {
    response.stack = details.stack;
  }

  return new Response(JSON.stringify(response), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}