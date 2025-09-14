/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Re-export the validated configuration from the shared environment module
export { config, validateConfiguration, validatedEnv } from './shared/config/environment';
export type { AppConfig, ConfigValidation } from './shared/config/environment';
