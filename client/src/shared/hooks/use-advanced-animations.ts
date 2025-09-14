/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useCallback, useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform, MotionValue, useAnimationControls } from 'framer-motion';
import { ComponentId } from '@/shared/types/advanced-types';

// Advanced animation presets with physics-based motion
export const animationPresets = {
  // Micro-interactions
  gentle: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 30,
    mass: 0.5,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 1.2,
  },
  smooth: {
    type: 'tween' as const,
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  // Complex animations
  morphing: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
  elastic: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 10,
    mass: 1.5,
  },
};

// Advanced variants for complex animations
export const advancedVariants = {
  // Card interactions
  cardHover: {
    initial: { scale: 1, rotateY: 0, z: 0 },
    hover: { 
      scale: 1.02, 
      rotateY: 5, 
      z: 50,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      transition: animationPresets.gentle,
    },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  },
  
  // List item animations
  listItem: {
    hidden: { 
      opacity: 0, 
      x: -20, 
      scale: 0.95,
      filter: 'blur(4px)',
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        ...animationPresets.gentle,
        delay: index * 0.05,
      },
    }),
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      filter: 'blur(2px)',
      transition: { duration: 0.2 },
    },
  },

  // Modal animations
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        ...animationPresets.snappy,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      filter: 'blur(4px)',
      transition: { duration: 0.2 },
    },
  },

  // Page transitions
  pageTransition: {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.98,
      filter: 'blur(4px)',
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        ...animationPresets.gentle,
        staggerChildren: 0.05,
      },
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 1.02,
      filter: 'blur(2px)',
      transition: { duration: 0.3 },
    },
  },
};

// Hook for gesture-based interactions
export function useGestureAnimations(componentId: ComponentId) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const scale = useSpring(1, animationPresets.gentle);
  const rotate = useTransform(dragX, [-100, 100], [-5, 5]);
  const opacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragStart = useCallback(() => {
    scale.set(1.05);
  }, [scale]);

  const handleDragEnd = useCallback(() => {
    scale.set(1);
    dragX.set(0);
    dragY.set(0);
  }, [scale, dragX, dragY]);

  return {
    dragX,
    dragY,
    scale,
    rotate,
    opacity,
    handleDragStart,
    handleDragEnd,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.1,
  };
}

// Hook for scroll-triggered animations with parallax
export function useScrollParallax(offset: number = 0.5) {
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  
  const parallaxY = useTransform(y, [0, 1], [0, offset * 100]);
  const parallaxOpacity = useTransform(y, [0, 0.5, 1], [1, 0.8, 0.3]);

  return {
    y: parallaxY,
    opacity: parallaxOpacity,
    setScrollY: y.set,
  };
}

// Hook for morphing animations
export function useMorphingAnimation() {
  const controls = useAnimationControls();
  const [currentShape, setCurrentShape] = useState<'circle' | 'square' | 'triangle'>('circle');

  const morphTo = useCallback(async (shape: typeof currentShape) => {
    if (shape === currentShape) return;

    await controls.start({
      scale: 0.8,
      rotate: 180,
      transition: { duration: 0.2 },
    });

    setCurrentShape(shape);

    await controls.start({
      scale: 1,
      rotate: 0,
      borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0%' : '0%',
      clipPath: shape === 'triangle' 
        ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
        : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      transition: animationPresets.morphing,
    });
  }, [controls, currentShape]);

  return {
    controls,
    currentShape,
    morphTo,
  };
}

// Hook for staggered animations
export function useStaggeredAnimation<T>(
  items: T[],
  staggerDelay: number = 0.1
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const animateIn = useCallback(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * staggerDelay * 1000);
    });
  }, [items, staggerDelay]);

  const animateOut = useCallback(() => {
    setVisibleItems(new Set());
  }, []);

  const isVisible = useCallback((index: number) => {
    return visibleItems.has(index);
  }, [visibleItems]);

  return {
    animateIn,
    animateOut,
    isVisible,
    visibleCount: visibleItems.size,
  };
}

// Hook for physics-based interactions
export function usePhysicsAnimation() {
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });
  const rotate = useSpring(0, { stiffness: 400, damping: 25 });

  const applyForce = useCallback((forceX: number, forceY: number, torque: number = 0) => {
    x.set(x.get() + forceX);
    y.set(y.get() + forceY);
    rotate.set(rotate.get() + torque);
  }, [x, y, rotate]);

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
    rotate.set(0);
  }, [x, y, rotate]);

  return {
    x,
    y,
    rotate,
    applyForce,
    reset,
  };
}

// Hook for respecting motion preferences
export function useRespectMotionPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useState(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  });

  const getTransition = useCallback((preset: keyof typeof animationPresets) => {
    return prefersReducedMotion 
      ? { duration: 0 } 
      : animationPresets[preset];
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getTransition,
    safeVariants: (variants: any) => 
      prefersReducedMotion 
        ? Object.keys(variants).reduce((acc, key) => ({
          ...acc,
          [key]: { ...variants[key], transition: { duration: 0 } }
        }), {})
        : variants,
  };
}
