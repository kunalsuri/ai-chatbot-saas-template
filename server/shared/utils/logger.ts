/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import winston from 'winston';
import path from 'path';
import { AsyncLocalStorage } from 'async_hooks';

// Enhanced TypeScript interfaces for logging
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  traceId?: string;
  spanId?: string;
}

export interface LogMetadata extends Record<string, unknown> {
  type?: LogType;
  service?: string;
  operation?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  path?: string;
  success?: boolean;
  severity?: SecuritySeverity;
  category?: string;
  retryable?: boolean;
}

export interface StructuredLogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: LogContext;
  metadata?: LogMetadata;
  error?: SerializedError;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  cause?: unknown;
}

// Enums for better type safety
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug'
}

export enum LogType {
  REQUEST_START = 'request_start',
  REQUEST_END = 'request_end',
  REQUEST_ERROR = 'request_error',
  API_REQUEST = 'api_request',
  AUTH_EVENT = 'auth_event',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  SECURITY = 'security',
  PERFORMANCE_WARNING = 'performance_warning',
  SYSTEM = 'system'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Type guards for better error handling
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isErrorWithCode = (error: unknown): error is Error & { code: string | number } => {
  return isError(error) && 'code' in error;
};

export const serializeError = (error: unknown): SerializedError | undefined => {
  if (!error) return undefined;
  
  if (isError(error)) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: isErrorWithCode(error) ? error.code : undefined,
      cause: error.cause
    };
  }
  
  // Handle non-Error objects
  if (typeof error === 'object' && error !== null) {
    return {
      name: 'UnknownError',
      message: String(error),
      stack: undefined
    };
  }
  
  return {
    name: 'UnknownError',
    message: String(error),
    stack: undefined
  };
};

// Request context storage for correlation with enhanced typing
export const requestContext = new AsyncLocalStorage<LogContext>();

// Define log levels with const assertion for better type safety
const levels = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.HTTP]: 3,
  [LogLevel.DEBUG]: 4,
} as const;

type WinstonLogLevel = keyof typeof levels;

// Define colors for each level with const assertion
const colors = {
  [LogLevel.ERROR]: 'red',
  [LogLevel.WARN]: 'yellow',
  [LogLevel.INFO]: 'green',
  [LogLevel.HTTP]: 'magenta',
  [LogLevel.DEBUG]: 'white',
} as const;

winston.addColors(colors);

// Add request context to log entries
const addRequestContext = winston.format((info) => {
  const context = requestContext.getStore();
  if (context) {
    info.requestId = context.requestId;
    info.userId = context.userId;
    info.sessionId = context.sessionId;
    info.userAgent = context.userAgent;
    info.ip = context.ip;
  }
  return info;
});

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  addRequestContext(),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const requestId = info.requestId ? `[${String(info.requestId).slice(0, 8)}]` : '';
    const userId = info.userId ? `[user:${info.userId}]` : '';
    return `${info.timestamp} ${requestId}${userId} ${info.level}: ${info.message}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  addRequestContext(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,
});

// Enhanced logging interface with strict typing
export interface Logger {
  error(message: string, error?: unknown, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  http(message: string, metadata?: LogMetadata): void;
  debug(message: string, metadata?: LogMetadata): void;
  apiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): void;
  authEvent(event: string, userId?: string, details?: LogMetadata): void;
  externalService(service: string, operation: string, success: boolean, duration?: number, error?: unknown): void;
  database(operation: string, table?: string, duration?: number, error?: unknown): void;
  security(event: string, severity: SecuritySeverity, details?: LogMetadata): void;
}

// Enhanced logging methods with strict typing and better error handling
export const log: Logger = {
  error: (message: string, error?: unknown, metadata: LogMetadata = {}) => {
    const logData: LogMetadata & { message: string; error?: SerializedError } = { 
      message, 
      ...metadata,
      type: metadata.type || LogType.SYSTEM
    };
    
    const serializedError = serializeError(error);
    if (serializedError) {
      logData.error = serializedError;
    }
    
    logger.error(logData);
  },

  warn: (message: string, metadata: LogMetadata = {}) => {
    logger.warn({ 
      message, 
      ...metadata,
      type: metadata.type || LogType.SYSTEM
    });
  },

  info: (message: string, metadata: LogMetadata = {}) => {
    logger.info({ 
      message, 
      ...metadata,
      type: metadata.type || LogType.SYSTEM
    });
  },

  http: (message: string, metadata: LogMetadata = {}) => {
    logger.http({ 
      message, 
      ...metadata,
      type: metadata.type || LogType.REQUEST_START
    });
  },

  debug: (message: string, metadata: LogMetadata = {}) => {
    logger.debug({ 
      message, 
      ...metadata,
      type: metadata.type || LogType.SYSTEM
    });
  },

  // Specialized logging methods with enhanced type safety
  apiRequest: (method: string, path: string, statusCode: number, duration: number, userId?: string) => {
    logger.http('API Request', {
      method,
      path,
      statusCode,
      duration,
      userId,
      type: LogType.API_REQUEST,
      success: statusCode >= 200 && statusCode < 400
    });
  },

  authEvent: (event: string, userId?: string, details: LogMetadata = {}) => {
    logger.info('Authentication Event', {
      event,
      userId,
      ...details,
      type: LogType.AUTH_EVENT
    });
  },

  externalService: (service: string, operation: string, success: boolean, duration?: number, error?: unknown) => {
    const level: WinstonLogLevel = success ? LogLevel.INFO : LogLevel.ERROR;
    const serializedError = serializeError(error);
    
    logger[level]('External Service Call', {
      service,
      operation,
      success,
      duration,
      error: serializedError,
      type: LogType.EXTERNAL_SERVICE,
      retryable: !success && (!isError(error) || error.name !== 'ValidationError')
    });
  },

  database: (operation: string, table?: string, duration?: number, error?: unknown) => {
    const level: WinstonLogLevel = error ? LogLevel.ERROR : LogLevel.DEBUG;
    const serializedError = serializeError(error);
    
    logger[level]('Database Operation', {
      operation,
      table,
      duration,
      error: serializedError,
      type: LogType.DATABASE,
      retryable: !!error && (!isError(error) || !error.message.includes('constraint'))
    });
  },

  security: (event: string, severity: SecuritySeverity, details: LogMetadata = {}) => {
    const level: WinstonLogLevel = severity === SecuritySeverity.CRITICAL || severity === SecuritySeverity.HIGH 
      ? LogLevel.ERROR 
      : LogLevel.WARN;
      
    logger[level]('Security Event', {
      event,
      severity,
      ...details,
      type: LogType.SECURITY,
      retryable: false // Security events should never be retried
    });
  }
};

// Ensure logs directory exists
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;
