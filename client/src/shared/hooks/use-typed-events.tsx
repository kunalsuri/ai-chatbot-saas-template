/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useCallback, useEffect, useRef } from 'react';
import { TypedEventMap, TypedEventEmitter } from '@/shared/types/advanced-types';

// Type-safe event emitter implementation
class TypedEventEmitterImpl {
  private listeners = new Map<keyof TypedEventMap, Set<Function>>();

  on<K extends keyof TypedEventMap>(
    event: K,
    listener: (data: TypedEventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit<K extends keyof TypedEventMap>(event: K, data: TypedEventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof TypedEventMap>(
    event: K,
    listener: (data: TypedEventMap[K]) => void
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  removeAllListeners(event?: keyof TypedEventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Global event emitter instance
const globalEventEmitter = new TypedEventEmitterImpl();

// Hook for type-safe event handling
export function useTypedEvent<K extends keyof TypedEventMap>(
  event: K,
  handler: (data: TypedEventMap[K]) => void,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = globalEventEmitter.on(event, (data) => {
      handlerRef.current(data);
    });

    return unsubscribe;
  }, [event, ...deps]);
}

// Hook for emitting events
export function useEventEmitter() {
  const emit = useCallback(<K extends keyof TypedEventMap>(
    event: K,
    data: TypedEventMap[K]
  ) => {
    globalEventEmitter.emit(event, data);
  }, []);

  return { emit };
}

// Hook for event history tracking
export function useEventHistory<K extends keyof TypedEventMap>(
  event: K,
  maxHistory: number = 10
) {
  const historyRef = useRef<TypedEventMap[K][]>([]);

  useTypedEvent(event, (data) => {
    historyRef.current = [data, ...historyRef.current.slice(0, maxHistory - 1)];
  });

  return historyRef.current;
}

// Export the global emitter for direct use
export { globalEventEmitter as eventEmitter };
