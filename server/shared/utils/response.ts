/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Response } from 'express';

/**
 * Send a standardized success response
 */
export function sendSuccessResponse(res: Response, data: any, status = 200): Response {
  return res.status(status).json({
    success: true,
    data
  });
}

/**
 * Send a standardized error response
 */
export function sendErrorResponse(
  res: Response, 
  status = 500, 
  errorType = 'Server Error',
  message = 'An unexpected error occurred',
  details?: any
): Response {
  return res.status(status).json({
    success: false,
    error: {
      type: errorType,
      message,
      details
    }
  });
}
