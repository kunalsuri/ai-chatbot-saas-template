/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ApiErrorResponse, ValidationError } from "../types/express";

/**
 * Validation middleware factory for request body validation
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorResponse: ApiErrorResponse = {
          error: "Validation failed",
          details: validationErrors,
          timestamp: new Date().toISOString(),
        };

        return res.status(400).json(errorResponse);
      }

      const errorResponse: ApiErrorResponse = {
        error: "Invalid request format",
        timestamp: new Date().toISOString(),
      };

      return res.status(400).json(errorResponse);
    }
  };
}

/**
 * Validation middleware factory for query parameters
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorResponse: ApiErrorResponse = {
          error: "Invalid query parameters",
          details: validationErrors,
          timestamp: new Date().toISOString(),
        };

        return res.status(400).json(errorResponse);
      }

      const errorResponse: ApiErrorResponse = {
        error: "Invalid query format",
        timestamp: new Date().toISOString(),
      };

      return res.status(400).json(errorResponse);
    }
  };
}

/**
 * Validation middleware factory for URL parameters
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorResponse: ApiErrorResponse = {
          error: "Invalid URL parameters",
          details: validationErrors,
          timestamp: new Date().toISOString(),
        };

        return res.status(400).json(errorResponse);
      }

      const errorResponse: ApiErrorResponse = {
        error: "Invalid parameter format",
        timestamp: new Date().toISOString(),
      };

      return res.status(400).json(errorResponse);
    }
  };
}
