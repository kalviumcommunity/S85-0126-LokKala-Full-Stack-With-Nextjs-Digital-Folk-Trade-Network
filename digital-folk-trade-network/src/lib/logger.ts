type LogLevel = 'info' | 'error';

interface LogMeta {
  [key: string]: any;
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
  const logEntry = {
    level,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};