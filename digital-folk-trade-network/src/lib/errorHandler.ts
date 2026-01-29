import { logger } from './logger';

export function handleError(error: any, context: { req: Request }) {
  const env = process.env.NODE_ENV;
  const isDev = env === 'development';

  // Log error
  logger.error(
    `Error in ${context.req.method} ${context.req.url}`,
    {
      message: error.message,
      stack: isDev ? error.stack : 'REDACTED',
    }
  );

  // Prepare response
  const response: any = {
    success: false,
    message: isDev
      ? error.message
      : 'Something went wrong. Please try again later.',
  };
  if (isDev) {
    response.stack = error.stack;
  }

  return new Response(JSON.stringify(response), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}