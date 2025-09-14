/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Advanced Hooks
export { useAdvancedA11y, useFocusManagement, useARIAAttributes, useScreenReaderOptimization, useColorContrast } from './use-advanced-accessibility';
export { useGestureAnimations, useScrollParallax, useMorphingAnimation, useStaggeredAnimation, usePhysicsAnimation, useRespectMotionPreferences } from './use-advanced-animations';

// Shared Hooks
// AI Suggestions hooks removed
export { useCommandPalette } from './use-command-palette';
// Enhanced AI Suggestions hooks removed
export { useFormValidation } from './use-form-validation';
export { useMediaQuery } from './use-media-query';
export { useIsMobile } from './use-mobile';
export { usePostMutations } from './useMutations';
export { usePerformanceMonitor } from './use-performance-monitor';
export { usePWA } from './use-pwa';
export { useScrollAnimation, useParallaxScroll, useScrollProgress } from './use-scroll-animation';
export { useSmartMemo, useSmartCallback, useRenderTracker, useExpensiveComputation } from './use-smart-memoization';
export { useToast, toast } from './use-toast';
export { ConcurrentBoundary } from './use-concurrent-boundary';
export { useTypedEvent } from './use-typed-events';
