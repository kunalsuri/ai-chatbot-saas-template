/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
      csrfToken?: () => string;
    }
  }
}

// Custom request/response types for better type safety
export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface ApiResponse<T = unknown> extends Response {
  json(body: ApiResponseBody<T>): this;
}

export interface ApiResponseBody<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: ValidationError[];
  timestamp: string;
}

// Middleware types
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Session data interface
export interface SessionData {
  userId?: string;
  csrfSecret?: string;
}
