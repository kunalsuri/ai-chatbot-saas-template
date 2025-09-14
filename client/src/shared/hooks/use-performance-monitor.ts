/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  processingStart?: number;
  startTime: number;
  value?: number;
  hadRecentInput?: boolean;
}

export function usePerformanceMonitor() {
  const reportMetric = useCallback((metric: Partial<PerformanceMetrics> & { name: string }) => {
    // In production, send to analytics service
    console.log('Performance Metric:', metric);
    
    // Example: Send to analytics
    // analytics.track('performance_metric', metric);
  }, []);

  useEffect(() => {
    // Measure Core Web Vitals
    
    // First Contentful Paint (FCP)
    const measureFCP = () => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
      if (fcpEntry) {
        reportMetric({
          name: 'FCP',
          fcp: fcpEntry.startTime
        });
      }
    };

    // Largest Contentful Paint (LCP)
    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        reportMetric({
          name: 'LCP',
          lcp: lastEntry.startTime
        });
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    };

    // First Input Delay (FID)
    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry;
          if (fidEntry.processingStart) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            reportMetric({
              name: 'FID',
              fid
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    };

    // Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry;
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            clsValue += clsEntry.value;
          }
        });
        
        reportMetric({
          name: 'CLS',
          cls: clsValue
        });
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    };

    // Time to First Byte (TTFB)
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        reportMetric({
          name: 'TTFB',
          ttfb
        });
      }
    };

    // Initialize measurements
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();

    // Report page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.now();
        reportMetric({
          name: 'PAGE_LOAD',
          value: loadTime
        });
      }, 0);
    });

  }, [reportMetric]);

  // Manual performance measurement utilities
  const measureComponentRender = useCallback((componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    reportMetric({
      name: 'COMPONENT_RENDER',
      component: componentName,
      duration: end - start
    });
  }, [reportMetric]);

  const measureAsyncOperation = useCallback(async (operationName: string, operation: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      
      reportMetric({
        name: 'ASYNC_OPERATION',
        operation: operationName,
        duration: end - start,
        success: true
      });
      
      return result;
    } catch (error) {
      const end = performance.now();
      
      reportMetric({
        name: 'ASYNC_OPERATION',
        operation: operationName,
        duration: end - start,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }, [reportMetric]);

  return {
    measureComponentRender,
    measureAsyncOperation,
    reportMetric
  };
}
