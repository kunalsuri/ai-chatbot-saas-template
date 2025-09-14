/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentId } from '@/shared/types/advanced-types';
import { useEventEmitter } from './use-typed-events';

// Advanced accessibility context
interface AccessibilityContext {
  screenReaderActive: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  voiceControl: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusVisible: boolean;
}

interface AccessibilityAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  category: 'navigation' | 'status' | 'error' | 'success' | 'info';
}

interface FocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  skipLinks?: boolean;
  autoFocus?: boolean;
}

// Enhanced accessibility hook
export function useAdvancedA11y(componentId: ComponentId) {
  const [context, setContext] = useState<AccessibilityContext>({
    screenReaderActive: detectScreenReader(),
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fontSize: getFontSizePreference(),
    keyboardNavigation: false,
    voiceControl: detectVoiceControl(),
    colorBlindness: 'none',
    focusVisible: false,
  });

  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
  const announcementTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { emit } = useEventEmitter();

  // Live region for announcements
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Enhanced announcement system
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    category: AccessibilityAnnouncement['category'] = 'info'
  ) => {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      category,
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Clear announcement after appropriate time
    const timeoutId = setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== announcement));
    }, priority === 'assertive' ? 3000 : 1500);

    const key = `${message}-${Date.now()}`;
    announcementTimeouts.current.set(key, timeoutId);

    // Track accessibility usage
    emit('ui:interaction', {
      component: componentId,
      action: 'accessibility-announcement',
      metadata: { priority, category, message: message.substring(0, 50) },
    });
  }, [componentId, emit]);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setContext(prev => ({ ...prev, keyboardNavigation: true, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setContext(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Media query listeners
  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setContext(prev => ({ ...prev, highContrast: e.matches }));
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setContext(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      announcementTimeouts.current.forEach(timeout => clearTimeout(timeout));
      announcementTimeouts.current.clear();
    };
  }, []);

  return {
    context,
    announce,
    announcements,
    liveRegionRef,
  };
}

// Focus management hook
export function useFocusManagement(options: FocusManagementOptions = {}) {
  const { trapFocus = false, restoreFocus = true, skipLinks = true } = options;
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { emit } = useEventEmitter();

  const trapFocusInContainer = useCallback((e: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      restorePreviousFocus();
    }
  }, [trapFocus, restoreFocus]);

  const savePreviousFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    if (restoreFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [restoreFocus]);

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElement = containerRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    focusableElement?.focus();
  }, []);

  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', trapFocusInContainer);
      return () => document.removeEventListener('keydown', trapFocusInContainer);
    }
  }, [trapFocus, trapFocusInContainer]);

  return {
    containerRef,
    savePreviousFocus,
    restorePreviousFocus,
    focusFirstElement,
  };
}

// ARIA attributes hook
export function useARIAAttributes(componentId: ComponentId) {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, string>>({});

  const setARIA = useCallback((attribute: string, value: string) => {
    setAriaAttributes(prev => ({
      ...prev,
      [`aria-${attribute}`]: value,
    }));
  }, []);

  const removeARIA = useCallback((attribute: string) => {
    setAriaAttributes(prev => {
      const newAttrs = { ...prev };
      delete newAttrs[`aria-${attribute}`];
      return newAttrs;
    });
  }, []);

  // Common ARIA patterns
  const setExpanded = useCallback((expanded: boolean) => {
    setARIA('expanded', expanded.toString());
  }, [setARIA]);

  const setSelected = useCallback((selected: boolean) => {
    setARIA('selected', selected.toString());
  }, [setARIA]);

  const setPressed = useCallback((pressed: boolean) => {
    setARIA('pressed', pressed.toString());
  }, [setARIA]);

  const setInvalid = useCallback((invalid: boolean, errorMessage?: string) => {
    setARIA('invalid', invalid.toString());
    if (invalid && errorMessage) {
      setARIA('describedby', `${componentId}-error`);
    } else {
      removeARIA('describedby');
    }
  }, [setARIA, removeARIA, componentId]);

  return {
    ariaAttributes,
    setARIA,
    removeARIA,
    setExpanded,
    setSelected,
    setPressed,
    setInvalid,
  };
}

// Screen reader optimization hook
export function useScreenReaderOptimization() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Enhanced screen reader detection
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = !!(
        window.speechSynthesis ||
        (navigator as any).userAgent.includes('NVDA') ||
        (navigator as any).userAgent.includes('JAWS') ||
        (navigator as any).userAgent.includes('VoiceOver') ||
        document.querySelector('[aria-live]') ||
        window.getComputedStyle(document.body).speak !== undefined
      );

      setIsScreenReaderActive(hasScreenReader);
    };

    detectScreenReader();

    // Listen for screen reader specific events
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target && (e.target as Element).getAttribute('aria-label')) {
        setIsScreenReaderActive(true);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const optimizeForScreenReader = useCallback((element: HTMLElement) => {
    if (!isScreenReaderActive) return;

    // Add screen reader specific optimizations
    if (!element.getAttribute('role')) {
      element.setAttribute('role', 'region');
    }

    // Ensure proper labeling
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const id = heading.id || `heading-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = id;
        element.setAttribute('aria-labelledby', id);
      }
    }
  }, [isScreenReaderActive]);

  return {
    isScreenReaderActive,
    optimizeForScreenReader,
  };
}

// Color contrast utilities
export function useColorContrast() {
  const [highContrastMode, setHighContrastMode] = useState(
    window.matchMedia('(prefers-contrast: high)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => setHighContrastMode(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const getContrastRatio = useCallback((foreground: string, background: string): number => {
    // Simplified contrast ratio calculation
    const getLuminance = (color: string): number => {
      // This is a simplified version - in production, use a proper color library
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(x => {
        const val = parseInt(x) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const meetsWCAG = useCallback((ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }, []);

  return {
    highContrastMode,
    getContrastRatio,
    meetsWCAG,
  };
}

// Utility functions
function detectScreenReader(): boolean {
  return !!(
    window.speechSynthesis ||
    (navigator as any).userAgent.includes('NVDA') ||
    (navigator as any).userAgent.includes('JAWS') ||
    (navigator as any).userAgent.includes('VoiceOver')
  );
}

function detectVoiceControl(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

function getFontSizePreference(): 'small' | 'medium' | 'large' | 'extra-large' {
  const fontSize = window.getComputedStyle(document.documentElement).fontSize;
  const size = parseInt(fontSize);
  
  if (size >= 24) return 'extra-large';
  if (size >= 20) return 'large';
  if (size >= 16) return 'medium';
  return 'small';
}
