/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// User-specific types moved from shared/types
export interface User {
  id: string;
  username: string;
  email: string;
  plan: string;
  createdAt: Date;
}
