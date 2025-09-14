/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useMemo } from 'react';

interface VirtualizedListOptions {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Custom hook for virtualizing large lists
 * Improves performance by only rendering visible items
 */
export function useVirtualizedList({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualizedListOptions) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;

  const getVisibleRange = (scrollTop: number) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    const visibleStart = Math.max(0, start - overscan);

    return {
      start: visibleStart,
      end,
      offsetY: visibleStart * itemHeight,
    };
  };

  const getVisibleItems = (scrollTop: number) => {
    const { start, end, offsetY } = getVisibleRange(scrollTop);
    return {
      items: items.slice(start, end),
      startIndex: start,
      offsetY,
      totalHeight,
    };
  };

  return {
    getVisibleItems,
    totalHeight,
    itemHeight,
  };
}