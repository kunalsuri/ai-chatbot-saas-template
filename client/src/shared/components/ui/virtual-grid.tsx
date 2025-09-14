/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 8,
  overscan = 5,
  className = '',
  onScroll
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { columnsPerRow, visibleItems, totalHeight, offsetY } = useMemo(() => {
    const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rowHeight = itemHeight + gap;
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      Math.ceil(items.length / columnsPerRow) - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    
    const startIndex = startRow * columnsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsPerRow - 1);
    
    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => {
      const absoluteIndex = startIndex + index;
      const row = Math.floor(absoluteIndex / columnsPerRow);
      const col = absoluteIndex % columnsPerRow;
      
      return {
        item,
        index: absoluteIndex,
        x: col * (itemWidth + gap),
        y: row * rowHeight
      };
    });
    
    const totalRows = Math.ceil(items.length / columnsPerRow);
    const totalHeight = totalRows * rowHeight - gap;
    const offsetY = startRow * rowHeight;

    return { columnsPerRow, visibleItems, totalHeight, offsetY };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, scrollTop, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, x, y }) => (
          <motion.div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: (index % columnsPerRow) * 0.05 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Hook for virtual grid
export function useVirtualGrid<T>(
  items: T[],
  itemWidth: number,
  itemHeight: number,
  containerWidth: number,
  containerHeight: number,
  gap = 8,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const virtualGrid = useMemo(() => {
    const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rowHeight = itemHeight + gap;
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      Math.ceil(items.length / columnsPerRow) - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    
    const startIndex = startRow * columnsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsPerRow - 1);
    
    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => {
      const absoluteIndex = startIndex + index;
      const row = Math.floor(absoluteIndex / columnsPerRow);
      const col = absoluteIndex % columnsPerRow;
      
      return {
        item,
        index: absoluteIndex,
        x: col * (itemWidth + gap),
        y: row * rowHeight
      };
    });
    
    const totalRows = Math.ceil(items.length / columnsPerRow);
    const totalHeight = totalRows * rowHeight - gap;

    return {
      items: visibleItems,
      totalHeight,
      columnsPerRow,
      startIndex,
      endIndex
    };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, scrollTop, overscan]);

  return {
    virtualGrid,
    scrollTop,
    setScrollTop
  };
}
