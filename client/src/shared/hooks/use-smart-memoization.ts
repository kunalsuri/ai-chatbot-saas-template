/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { ComponentId } from '@/shared/types/advanced-types';
import { useEventEmitter } from './use-typed-events';

// Performance tracking for memoization
interface MemoizationMetrics {
  componentId: ComponentId;
  hitCount: number;
  missCount: number;
  lastAccess: number;
  memoryUsage: number;
  computationTime: number[];
}

class MemoizationTracker {
  private metrics = new Map<string, MemoizationMetrics>();
  private maxEntries = 1000;

  track(key: string, componentId: ComponentId, hit: boolean, computationTime?: number) {
    const existing = this.metrics.get(key) || {
      componentId,
      hitCount: 0,
      missCount: 0,
      lastAccess: Date.now(),
      memoryUsage: 0,
      computationTime: [],
    };

    if (hit) {
      existing.hitCount++;
    } else {
      existing.missCount++;
      if (computationTime) {
        existing.computationTime.push(computationTime);
        // Keep only last 10 measurements
        if (existing.computationTime.length > 10) {
          existing.computationTime = existing.computationTime.slice(-10);
        }
      }
    }

    existing.lastAccess = Date.now();
    this.metrics.set(key, existing);

    // Cleanup old entries
    if (this.metrics.size > this.maxEntries) {
      const oldestKey = Array.from(this.metrics.entries())
        .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)[0][0];
      this.metrics.delete(oldestKey);
    }
  }

  getMetrics(key?: string) {
    if (key) {
      return this.metrics.get(key);
    }
    return Array.from(this.metrics.entries()).map(([key, metrics]) => ({
      key,
      ...metrics,
      hitRate: metrics.hitCount / (metrics.hitCount + metrics.missCount),
      avgComputationTime: metrics.computationTime.reduce((a, b) => a + b, 0) / metrics.computationTime.length || 0,
    }));
  }

  clear() {
    this.metrics.clear();
  }
}

const globalMemoTracker = new MemoizationTracker();

// Enhanced useMemo with performance tracking
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options?: {
    componentId?: ComponentId;
    trackUsage?: boolean;
    maxAge?: number;
    debugName?: string;
  }
): T {
  const { componentId, trackUsage = false, maxAge, debugName } = options || {};
  const keyRef = useRef<string>();
  const timestampRef = useRef<number>();
  const { emit } = useEventEmitter();

  // Generate stable key for tracking
  if (!keyRef.current) {
    keyRef.current = `${componentId || 'unknown'}-${debugName || 'memo'}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const memoized = useMemo(() => {
    const start = performance.now();
    
    // Check if cached value is expired
    if (maxAge && timestampRef.current && Date.now() - timestampRef.current > maxAge) {
      timestampRef.current = Date.now();
      if (trackUsage && keyRef.current) {
        globalMemoTracker.track(keyRef.current, componentId!, false);
      }
    }

    const result = factory();
    const end = performance.now();
    const computationTime = end - start;

    if (trackUsage && keyRef.current && componentId) {
      globalMemoTracker.track(keyRef.current, componentId, false, computationTime);
      
      // Emit performance metric
      emit('performance:metric', {
        name: 'memo-computation',
        value: computationTime,
        category: 'render',
      });
    }

    timestampRef.current = Date.now();
    return result;
  }, deps);

  return memoized;
}

// Enhanced useCallback with usage tracking
export function useSmartCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options?: {
    componentId?: ComponentId;
    trackUsage?: boolean;
    debugName?: string;
  }
): T {
  const { componentId, trackUsage = false, debugName } = options || {};
  const callCountRef = useRef(0);
  const { emit } = useEventEmitter();

  return useCallback((...args: Parameters<T>) => {
    if (trackUsage && componentId) {
      callCountRef.current++;
      emit('performance:metric', {
        name: 'callback-invocation',
        value: callCountRef.current,
        category: 'user-interaction',
      });
    }

    return callback(...args);
  }, deps) as T;
}

// Hook for component render tracking
export function useRenderTracker(componentId: ComponentId, debugName?: string) {
  const renderCountRef = useRef(0);
  const lastRenderRef = useRef<number>(Date.now());
  const { emit } = useEventEmitter();

  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderRef.current;
    lastRenderRef.current = now;

    emit('performance:metric', {
      name: 'component-render',
      value: timeSinceLastRender,
      category: 'render',
    });

    // Log excessive re-renders
    if (renderCountRef.current > 10 && timeSinceLastRender < 100) {
      console.warn(`Component ${debugName || componentId} is re-rendering frequently:`, {
        renderCount: renderCountRef.current,
        timeSinceLastRender,
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    resetRenderCount: () => { renderCountRef.current = 0; },
  };
}

// Hook for expensive computation optimization
export function useExpensiveComputation<T, Args extends any[]>(
  computation: (...args: Args) => T,
  options?: {
    componentId?: ComponentId;
    cacheSize?: number;
    ttl?: number;
    debugName?: string;
  }
) {
  const { componentId, cacheSize = 10, ttl = 5 * 60 * 1000, debugName } = options || {};
  const cacheRef = useRef(new Map<string, { value: T; timestamp: number }>());
  const { emit } = useEventEmitter();

  const compute = useCallback((...args: Args): T => {
    const key = JSON.stringify(args);
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    // Return cached value if valid
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      if (componentId) {
        globalMemoTracker.track(`${componentId}-${debugName}`, componentId, true);
      }
      return cached.value;
    }

    // Compute new value
    const start = performance.now();
    const result = computation(...args);
    const computationTime = performance.now() - start;

    // Cache the result
    cacheRef.current.set(key, { value: result, timestamp: now });

    // Cleanup old entries
    if (cacheRef.current.size > cacheSize) {
      const oldestKey = Array.from(cacheRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      cacheRef.current.delete(oldestKey);
    }

    // Track performance
    if (componentId) {
      globalMemoTracker.track(`${componentId}-${debugName}`, componentId, false, computationTime);
      emit('performance:metric', {
        name: 'expensive-computation',
        value: computationTime,
        category: 'render',
      });
    }

    return result;
  }, [computation, componentId, cacheSize, ttl, debugName]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      entries: Array.from(cacheRef.current.entries()).map(([key, { timestamp }]) => ({
        key,
        age: Date.now() - timestamp,
      })),
    };
  }, []);

  return {
    compute,
    clearCache,
    getCacheStats,
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitor(componentId: ComponentId) {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const { emit } = useEventEmitter();

  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / 1024 / 1024; // MB
        setMemoryUsage(usage);
        
        emit('performance:metric', {
          name: 'memory-usage',
          value: usage,
          category: 'memory',
        });

        // Warn about high memory usage
        if (usage > 100) {
          console.warn(`High memory usage detected: ${usage.toFixed(2)}MB`);
        }
      }
    };

    measureMemory();
    const interval = setInterval(measureMemory, 5000);

    return () => clearInterval(interval);
  }, [componentId, emit]);

  return {
    memoryUsage,
    isHighUsage: memoryUsage > 100,
  };
}

// Export performance utilities
export const PerformanceUtils = {
  getMemoizationMetrics: globalMemoTracker.getMetrics.bind(globalMemoTracker),
  clearMemoizationMetrics: globalMemoTracker.clear.bind(globalMemoTracker),
};
