/**
 * Token-Based Component Styling System
 * 
 * This module provides React hooks and utilities for applying token-based styles
 * to components, with support for dynamic theme switching and component-specific
 * styling rules.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TokenSet } from '../../schema';
import { tokensToStyles, ComponentTypeForStyle, StyleConversionOptions } from './tokenToStyleConverter';
import { getCurrentTokens } from './themeManager';

// ============================================================================
// TOKEN-BASED COMPONENT STYLING SYSTEM
// ============================================================================

/**
 * Options for the useTokenStyles hook
 */
export interface UseTokenStylesOptions extends StyleConversionOptions {
  /** Whether to subscribe to theme changes (default: true) */
  subscribeToThemeChanges?: boolean;
}

/**
 * Custom hook for applying token-based styles to components
 * 
 * @param componentType - The component type for specific styling rules
 * @param options - Hook options
 * @returns CSS styles object that updates with theme changes
 */
export function useTokenStyles(
  componentType: ComponentTypeForStyle = 'generic',
  options?: UseTokenStylesOptions
): Record<string, unknown> {
  const opts: Required<UseTokenStylesOptions> = useMemo(() => ({
    componentType,
    additionalStyles: options?.additionalStyles || {},
    includeResponsive: options?.includeResponsive !== false,
    breakpoints: options?.breakpoints || { sm: 640, md: 768, lg: 1024, xl: 1280 },
    variablePrefix: options?.variablePrefix || 'ff',
    subscribeToThemeChanges: options?.subscribeToThemeChanges !== false,
  }), [componentType, options]);
  
  // Get initial tokens
 const initialTokens = getCurrentTokens() || getDefaultTokens();
  const [styles, setStyles] = useState<Record<string, unknown>>(
    tokensToStyles(initialTokens, opts)
 );
  
  useEffect(() => {
    if (opts.subscribeToThemeChanges) {
      // For now, we'll use a simple interval to check for changes
      // In a real implementation, we'd have a proper event system
      const interval = setInterval(() => {
        // This is a simplified approach - in a real app we'd have proper eventing
        const currentTokens = getCurrentTokens();
        const currentStyles = tokensToStyles(currentTokens || getDefaultTokens(), opts);
        
        // Simple comparison - in a real app we'd need a more sophisticated approach
        setStyles(currentStyles);
      }, 1000); // Check every second for theme changes
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [opts]);
  
  return styles;
}

/**
 * Gets default tokens for use when no theme is available
 * 
 * @returns Default token set
 */
function getDefaultTokens(): TokenSet {
  return {
    colors: {
      primary: '#3b82f6',
      'primary-50': '#eff6ff',
      'primary-10': '#dbeafe',
      'primary-200': '#bfdbfe',
      'primary-300': '#93c5fd',
      'primary-40': '#60a5fa',
      'primary-600': '#2563eb',
      'primary-700': '#1d4ed8',
      'primary-800': '#1e40af',
      'primary-900': '#1e3a8a',
      secondary: '#64748b',
      'secondary-50': '#f8fafc',
      'secondary-100': '#f1f5f9',
      'secondary-200': '#e2e8f0',
      'secondary-300': '#cbd5e1',
      'secondary-400': '#94a3b8',
      'secondary-500': '#64748b',
      'secondary-600': '#475569',
      'secondary-700': '#334155',
      'secondary-800': '#1e293b',
      'secondary-900': '#0f172a',
      'bg-base': '#ffffff',
      'bg-surface': '#f8fafc',
      'bg-elevated': '#ffffff',
      'bg-overlay': 'rgba(0, 0, 0, 0.5)',
      'bg-accent': '#3b82f6',
      'text-primary': '#0f172a',
      'text-secondary': '#64748b',
      'text-muted': '#94a3b8',
      'text-disabled': '#cbd5e1',
      'text-inverse': '#ffffff',
      'border-base': '#e2e8f0',
      'border-muted': '#cbd5e1',
      'border-accent': '#3b82f6',
      'border-focus': '#3b82f6',
      success: '#10b981',
      'success-50': '#ecfdf5',
      'success-100': '#d1fae5',
      'success-20': '#a7f3d0',
      'success-300': '#6ee7b7',
      'success-400': '#34d399',
      'success-500': '#10b981',
      'success-600': '#059669',
      'success-700': '#047857',
      'success-800': '#065f46',
      'success-900': '#064e3b',
      warning: '#f59e0b',
      'warning-50': '#fffbeb',
      'warning-100': '#fef3c7',
      'warning-200': '#fde68a',
      'warning-300': '#fcd34d',
      'warning-400': '#fbbf24',
      'warning-500': '#f59e0b',
      'warning-600': '#d97706',
      'warning-700': '#b45309',
      'warning-800': '#92400e',
      'warning-900': '#78350f',
      error: '#ef4444',
      'error-50': '#fef2f2',
      'error-100': '#fee2e2',
      'error-20': '#fecaca',
      'error-300': '#fca5a5',
      'error-400': '#f87171',
      'error-500': '#ef444',
      'error-600': '#dc2626',
      'error-700': '#b91c1c',
      'error-800': '#991b1b',
      'error-900': '#7f1d1d',
      info: '#3b82f6',
      white: '#ffffff',
      black: '#000',
      'gray-50': '#f9fafb',
      'gray-100': '#f3f4f6',
      'gray-200': '#e5e7eb',
      'gray-300': '#d1d5db',
      'gray-400': '#9ca3af',
      'gray-500': '#6b7280',
      'gray-600': '#4b5563',
      'gray-700': '#374151',
      'gray-800': '#1f2937',
      'gray-900': '#111827',
    },
    spacing: {
      '0': 0,
      '1': 1,
      '2': 2,
      '4': 4,
      '8': 8,
      '12': 12,
      '16': 16,
      '20': 20,
      '24': 24,
      '32': 32,
      '40': 40,
      '48': 48,
      '56': 56,
      '64': 64,
      '80': 80,
      '96': 96,
      'xs': 8,
      'sm': 12,
      'md': 16,
      'lg': 24,
      'xl': 32,
      '2xl': 48,
      '3xl': 64,
      'component-gap': 16,
      'section-gap': 32,
      'grid-gap': 16,
      'form-gap': 12,
      'button-padding': 12,
      'input-padding': 12,
      'card-padding': 16,
      'modal-padding': 24,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      sizes: {
        'xs': 12,
        'sm': 14,
        'base': 16,
        'lg': 18,
        'xl': 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
      },
      weights: {
        'hairline': 100,
        'thin': 200,
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
        'black': 900,
      },
      lineHeights: {
        'none': 1,
        'tight': 1.25,
        'snug': 1.375,
        'normal': 1.5,
        'relaxed': 1.625,
        'loose': 2,
      },
    },
    radius: {
      '0': 0,
      '1': 1,
      '2': 2,
      '4': 4,
      '8': 8,
      '12': 12,
      '16': 16,
      '20': 20,
      '24': 24,
      '32': 32,
      '40': 40,
      '48': 48,
      '56': 56,
      '64': 64,
      'xs': 2,
      'sm': 4,
      'md': 6,
      'lg': 8,
      'xl': 12,
      '2xl': 16,
      '3xl': 24,
      'full': 9999,
      'button-radius': 6,
      'input-radius': 6,
      'card-radius': 8,
      'modal-radius': 12,
      'avatar-radius': 999,
      'badge-radius': 12,
    },
    shadows: {
      'none': 'none',
      'sm': '0 1px 2px 0 rgba(0, 0, 0.05)',
      'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0.05)',
      'button-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'card-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      'modal-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'popover-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'dropdown-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'tooltip-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'toast-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
    transitions: {
      'duration-instant': 0,
      'duration-fastest': 75,
      'duration-faster': 150,
      'duration-fast': 200,
      'duration-normal': 250,
      'duration-slow': 300,
      'duration-slower': 400,
      'duration-slowest': 500,
      'button-transition': 200,
      'input-transition': 200,
      'modal-transition': 300,
      'drawer-transition': 300,
      'tooltip-transition': 150,
      'easing-linear': 'linear',
      'easing-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'easing-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'easing-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'easing-bounce': 'cubic-bezier(0.5, 0.05, 0.5, 0.95)',
    },
  };
}

/**
 * Higher-order component for applying token-based styles
 * 
 * @param Component - The component to wrap
 * @param componentType - The component type for specific styling rules
 * @param options - Styling options
 * @returns Component with token-based styles applied
 */
export function withTokenStyles<T extends Record<string, unknown> & { style?: React.CSSProperties }>(
  Component: React.ComponentType<T>,
  componentType: ComponentTypeForStyle = 'generic',
 options?: UseTokenStylesOptions
) {
  return function TokenStyledComponent(props: T) {
    const styles = useTokenStyles(componentType, options);
    
    const mergedStyle: React.CSSProperties = {
      ...(props.style as React.CSSProperties || {}),
      ...(styles as React.CSSProperties || {}),
    };
  return <Component {...(props as T)} style={mergedStyle} />;
  };
}

/**
 * Context provider for token-based styling
 */
export const TokenStyleContext = React.createContext<TokenSet | null>(null);

/**
 * Hook to access the current token set from context
 * 
 * @returns Current token set
 */
export function useTokens(): TokenSet | null {
  return React.useContext(TokenStyleContext);
}

/**
 * Hook to get a specific token value
 * 
 * @param tokenPath - Path to the token (e.g. 'colors.primary', 'spacing.md')
 * @param fallback - Fallback value if token is not found
 * @returns Token value or fallback
 */
export function useTokenValue(tokenPath: string, fallback?: string | number): string | number | undefined {
  const tokens = useTokens();
  
  if (!tokens) {
    return fallback;
  }
  
  // Split the path by dots to navigate the object
  const pathParts = tokenPath.split('.');
  
  let current: unknown = tokens;
  
  for (const part of pathParts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback;
    }
  }
  
  if (typeof current === 'string' || typeof current === 'number') {
    return current as string | number;
  }
  return fallback;
}

/**
 * Hook to apply token-based conditional styles
 * 
 * @param conditions - Array of condition-style pairs
 * @returns Styles object based on conditions
 */
export function useConditionalTokenStyles(
  conditions: Array<{ condition: boolean; componentType: ComponentTypeForStyle; options?: StyleConversionOptions }>
): Record<string, unknown> {
  // Get current tokens once at the top level (proper hook usage)
  const [tokens, setTokens] = useState<TokenSet | null>(() => getCurrentTokens() || getDefaultTokens());
  
  // Subscribe to theme changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTokens = getCurrentTokens();
      if (currentTokens) {
        setTokens(currentTokens);
      }
    }, 1000); // Check every second for theme changes
    
    return () => clearInterval(interval);
  }, []);
  
  // Build styles from conditions using pure converter (no hooks in loop)
  const allStyles: Record<string, unknown> = {};
  const currentTokens = tokens || getDefaultTokens();
  
  for (const { condition, componentType, options } of conditions) {
    if (condition) {
      // Use pure tokensToStyles converter instead of hook
      const styles = tokensToStyles(currentTokens, { componentType, ...options });
      Object.assign(allStyles, styles);
    }
  }
  
  return allStyles;
}

/**
 * Hook to apply responsive token-based styles
 * 
 * @param baseComponentType - Base component type
 * @param responsiveRules - Object with breakpoint-component type mappings
 * @param options - Base styling options
 * @returns Responsive styles object
 */
export function useResponsiveTokenStyles(
  baseComponentType: ComponentTypeForStyle,
  _responsiveRules: {
    sm?: ComponentTypeForStyle;
    md?: ComponentTypeForStyle;
    lg?: ComponentTypeForStyle;
    xl?: ComponentTypeForStyle;
  },
  options?: UseTokenStylesOptions
): Record<string, unknown> {
  const baseStyles = useTokenStyles(baseComponentType, options);
  
  // For responsive styles, we'd typically use CSS media queries
  // This is a simplified implementation - a real implementation would require
 // more sophisticated responsive handling
  const responsiveStyles: Record<string, unknown> = { ...baseStyles };
  
  // In a real implementation, we'd add media query styles here based on _responsiveRules
  // For now, we'll just return the base styles
  return responsiveStyles;
}