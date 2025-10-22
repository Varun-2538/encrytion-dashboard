import { LogLevel } from '../types';

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const log = (level: LogLevel, module: string, message: string, error?: Error): void => {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] [${module}] ${message}`;

  switch (level) {
    case 'INFO':
      console.log(logMessage);
      break;
    case 'ERROR':
      console.error(logMessage);
      if (error && error.stack) {
        console.error(`[${timestamp}] [ERROR] [${module}] Stack: ${error.stack}`);
      }
      break;
    case 'WARN':
      console.warn(logMessage);
      break;
    case 'DEBUG':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logMessage);
      }
      break;
  }
};

export const logInfo = (module: string, message: string): void => {
  log('INFO', module, message);
};

export const logError = (module: string, message: string, error?: Error): void => {
  log('ERROR', module, message, error);
};

export const logWarn = (module: string, message: string): void => {
  log('WARN', module, message);
};

export const logDebug = (module: string, message: string): void => {
  log('DEBUG', module, message);
};
