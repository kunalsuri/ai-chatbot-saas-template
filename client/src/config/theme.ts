/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Centralized Theme Configuration
 * ChatGPT-style color system with full dark/light mode support
 */

export const chatGPTTheme = {
  light: {
    // Main colors
    background: '#FFFFFF',
    foreground: '#202123',
    
    // Chat-specific areas
    chatArea: '#F9F9FB',
    sidebar: '#EAEAEA',
    
    // Interactive elements
    input: '#EAEAEA',
    inputFocus: '#565869',
    
    // Text colors
    textPrimary: '#202123',
    textSecondary: '#8E8EA0',
    placeholder: '#8E8EA0',
    
    // Accent colors
    accent: '#10A37F',
    accentHover: '#0D8A6B',
    
    // Chat elements
    sendButton: '#19C37D',
    sendButtonHover: '#22D68A',
    
    // Message bubbles
    userMessage: '#F9F9FB',
    assistantMessage: '#FFFFFF',
    
    // Borders
    border: '#EAEAEA',
    focusBorder: '#565869',
  },
  
  dark: {
    // Main colors - VSCode/ChatGPT inspired
    background: '#1e1e1e', // Main dashboard background
    foreground: '#ECECF1',
    
    // Chat-specific areas
    chatArea: '#252526', // Card/content area background
    sidebar: '#121212', // Distinctly darker sidebar
    sidebarSolid: '#121212',
    
    // Interactive elements
    input: '#2d2d30', // Input background
    inputFocus: '#565869',
    
    // Text colors
    textPrimary: '#ECECF1',
    textSecondary: '#8E8EA0',
    placeholder: '#8E8EA0',
    
    // Accent colors
    accent: '#10A37F',
    accentHover: '#0D8A6B',
    
    // Chat elements
    sendButton: '#19C37D',
    sendButtonHover: '#22D68A',
    
    // Message bubbles
    userMessage: '#2d2d30',
    assistantMessage: '#252526',
    
    // Borders
    border: '#3c3c3c',
    focusBorder: '#565869',
  }
} as const;

export const spacing = {
  // Consistent spacing system
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
} as const;

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px - pill-shaped for chat input
  full: '9999px',  // fully rounded
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  glow: '0 0 0 1px rgb(16 163 127 / 0.2), 0 0 0 4px rgb(16 163 127 / 0.1)',
} as const;

export const transitions = {
  fast: '0.15s ease-in-out',
  normal: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
} as const;

// Accessibility-compliant contrast ratios
export const accessibility = {
  // WCAG AA compliant contrast ratios
  minContrast: 4.5,
  largeTextContrast: 3,
  
  // Focus indicators
  focusRing: '2px solid var(--ring)',
  focusOffset: '2px',
  
  // Motion preferences
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  
  // High contrast mode
  highContrast: '@media (prefers-contrast: high)',
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof chatGPTTheme.light;
