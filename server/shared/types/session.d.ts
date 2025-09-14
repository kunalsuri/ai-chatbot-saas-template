/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    csrfSecret?: string;
  }
}