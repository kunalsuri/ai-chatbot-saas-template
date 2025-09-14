/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      const result = cn('btn', 'btn-primary');
      expect(result).toBe('btn btn-primary');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('btn', isActive && 'active');
      expect(result).toBe('btn active');
    });

    it('filters out falsy values', () => {
      const result = cn('btn', false && 'hidden', null, undefined, 'visible');
      expect(result).toBe('btn visible');
    });
  });
});