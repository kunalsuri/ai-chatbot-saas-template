/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ComponentId } from '@shared/types/advanced-types';
import { useEventEmitter } from './use-typed-events';

interface ConcurrentBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ isLoading: boolean }>;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  priority?: 'high' | 'normal' | 'low';
  componentId?: ComponentId;
  timeout?: number;
}

// Using React's ErrorInfo type for compatibility with ErrorBoundary
type ErrorInfoType = React.ErrorInfo;

// Default loading component with priority-based styling
function DefaultLoadingFallback({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">
        {isLoading ? 'Loading...' : 'Preparing...'}
      </span>
    </div>
  );
}

// Enhanced error fallback with recovery options
function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
      <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <div className="flex gap-2">
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export function ConcurrentBoundary({
  children,
  fallback: Fallback = DefaultLoadingFallback,
  errorFallback: ErrorFallback = DefaultErrorFallback,
  priority = 'normal',
  componentId,
  timeout = 10000,
}: ConcurrentBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { emit } = useEventEmitter();

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with context
    console.error('ConcurrentBoundary caught error:', {
      error: error.message,
      componentId,
      priority,
      retryCount,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Emit error event for monitoring
    if (componentId) {
      emit('performance:metric', {
        name: 'boundary-error',
        value: retryCount,
        category: 'render',
      });
    }
  }, [componentId, priority, retryCount, emit]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setIsTimedOut(false);
    
    if (componentId) {
      emit('ui:interaction', {
        component: componentId,
        action: 'error-retry',
        metadata: { retryCount: retryCount + 1 },
      });
    }
  }, [componentId, retryCount, emit]);

  // Set up timeout for loading states
  useEffect(() => {
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTimedOut(true);
        console.warn(`ConcurrentBoundary timeout after ${timeout}ms`, { componentId });
      }, timeout);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
    return undefined;
  }, [timeout, componentId, retryCount]);

  // Enhanced fallback with timeout handling
  const EnhancedFallback = useCallback(() => {
    if (isTimedOut) {
      return (
        <div className="p-6 border border-warning/20 rounded-lg bg-warning/5">
          <h3 className="text-lg font-semibold text-warning mb-2">Loading is taking longer than expected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This might be due to a slow connection or server issues.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return <Fallback isLoading={!isTimedOut} />;
  }, [isTimedOut, Fallback, handleRetry])

  return (
    <ErrorBoundary
      onError={handleError}
      fallbackRender={({ error }) => (
        <ErrorFallback error={error} retry={handleRetry} />
      )}
      resetKeys={[retryCount]}
    >
      <Suspense fallback={<EnhancedFallback />}>
        <div 
          data-priority={priority}
          data-component-id={componentId}
          style={{
            // Priority-based rendering hints
            contentVisibility: priority === 'low' ? 'auto' : 'visible',
            containIntrinsicSize: priority === 'low' ? '200px' : 'none',
          }}
        >
          {children}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

// Hook for managing concurrent rendering priorities
export function useConcurrentPriority() {
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  
  const startTransition = useCallback((callback: () => void, newPriority: typeof priority = 'normal') => {
    setPriority(newPriority);
    
    // Use React's startTransition if available (React 18+)
    if ('startTransition' in React) {
      (React as any).startTransition(callback);
    } else {
      callback();
    }
  }, []);

  return {
    priority,
    setPriority,
    startTransition,
  };
}
