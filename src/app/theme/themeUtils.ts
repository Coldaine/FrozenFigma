/**
 * Theme and Token Utilities
 * 
 * This module provides utilities for working with design tokens and themes,
 * including validation, transformation, and application of tokens to the DOM.
 */

import { TokenSet, EnhancedTokenSet, SemanticColorTokens, SemanticSpacingTokens, SemanticTypographyTokens, SemanticRadiusTokens, SemanticShadowTokens, SemanticTransitionTokens } from '../../schema';

// ============================================================================
// TOKEN VALIDATION UTILITIES
// ============================================================================

/**
 * Validates a token set against the schema
 * @param tokens - The token set to validate
 * @returns Validation result with success status and errors
 */
export function validateTokens(tokens: any): { success: boolean; errors?: string[] } {
  try {
    // Basic validation to check if tokens have required properties
    if (!tokens || typeof tokens !== 'object') {
      return { success: false, errors: ['Tokens must be an object'] };
    }

    const errors: string[] = [];

    // Validate colors if present
    if (tokens.colors) {
      if (typeof tokens.colors !== 'object') {
        errors.push('Colors must be an object');
      } else {
        for (const [key, value] of Object.entries(tokens.colors)) {
          if (typeof value !== 'string') {
            errors.push(`Color token "${key}" must be a string`);
          } else if (!isValidColor(value)) {
            errors.push(`Color token "${key}" has invalid value: "${value}"`);
          }
        }
      }
    }

    // Validate spacing if present
    if (tokens.spacing) {
      if (typeof tokens.spacing !== 'object') {
        errors.push('Spacing must be an object');
      } else {
        for (const [key, value] of Object.entries(tokens.spacing)) {
          if (typeof value !== 'number') {
            errors.push(`Spacing token "${key}" must be a number`);
          } else if (value < 0) {
            errors.push(`Spacing token "${key}" must be non-negative`);
          }
        }
      }
    }

    // Validate typography if present
    if (tokens.typography) {
      if (typeof tokens.typography !== 'object') {
        errors.push('Typography must be an object');
      } else {
        if (tokens.typography.fontFamily && typeof tokens.typography.fontFamily !== 'string') {
          errors.push('Typography fontFamily must be a string');
        }
        
        if (tokens.typography.sizes && typeof tokens.typography.sizes !== 'object') {
          errors.push('Typography sizes must be an object');
        } else if (tokens.typography.sizes) {
          for (const [key, value] of Object.entries(tokens.typography.sizes)) {
            if (typeof value !== 'number') {
              errors.push(`Typography size token "${key}" must be a number`);
            }
          }
        }
        
        if (tokens.typography.weights && typeof tokens.typography.weights !== 'object') {
          errors.push('Typography weights must be an object');
        } else if (tokens.typography.weights) {
          for (const [key, value] of Object.entries(tokens.typography.weights)) {
            if (typeof value !== 'number') {
              errors.push(`Typography weight token "${key}" must be a number`);
            } else if (value < 100 || value > 900 || value % 100 !== 0) {
              errors.push(`Typography weight token "${key}" must be a valid font weight (100-900, multiple of 100)`);
            }
          }
        }
      }
    }

    // Validate radius if present
    if (tokens.radius) {
      if (typeof tokens.radius !== 'object') {
        errors.push('Radius must be an object');
      } else {
        for (const [key, value] of Object.entries(tokens.radius)) {
          if (typeof value !== 'number') {
            errors.push(`Radius token "${key}" must be a number`);
          } else if (value < 0) {
            errors.push(`Radius token "${key}" must be non-negative`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    };
  }
}

/**
 * Validates if a string is a valid CSS color
 * @param color - The color string to validate
 * @returns True if the color is valid, false otherwise
 */
function isValidColor(color: string): boolean {
  // Create a temporary element to test the color
  const el = document.createElement('div');
  el.style.color = color;
 return el.style.color !== '';
}

/**
 * Validates an enhanced token set with comprehensive semantic tokens
 * @param tokens - The enhanced token set to validate
 * @returns Validation result with success status and errors
 */
export function validateEnhancedTokens(tokens: any): { success: boolean; errors?: string[] } {
  try {
    if (!tokens || typeof tokens !== 'object') {
      return { success: false, errors: ['Tokens must be an object'] };
    }

    const errors: string[] = [];

    // Validate each token category
    if (tokens.colors) {
      const colorValidation = validateSemanticColorTokens(tokens.colors);
      if (!colorValidation.success) {
        errors.push(...(colorValidation.errors || []));
      }
    }

    if (tokens.spacing) {
      const spacingValidation = validateSemanticSpacingTokens(tokens.spacing);
      if (!spacingValidation.success) {
        errors.push(...(spacingValidation.errors || []));
      }
    }

    if (tokens.typography) {
      const typographyValidation = validateSemanticTypographyTokens(tokens.typography);
      if (!typographyValidation.success) {
        errors.push(...(typographyValidation.errors || []));
      }
    }

    if (tokens.radius) {
      const radiusValidation = validateSemanticRadiusTokens(tokens.radius);
      if (!radiusValidation.success) {
        errors.push(...(radiusValidation.errors || []));
      }
    }

    if (tokens.shadows) {
      const shadowValidation = validateSemanticShadowTokens(tokens.shadows);
      if (!shadowValidation.success) {
        errors.push(...(shadowValidation.errors || []));
      }
    }

    if (tokens.transitions) {
      const transitionValidation = validateSemanticTransitionTokens(tokens.transitions);
      if (!transitionValidation.success) {
        errors.push(...(transitionValidation.errors || []));
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    };
 }
}

/**
 * Validates semantic color tokens
 */
function validateSemanticColorTokens(colors: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof colors !== 'object') {
    return { success: false, errors: ['Color tokens must be an object'] };
  }
  
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== 'string') {
      errors.push(`Color token "${key}" must be a string`);
    } else if (!isValidColor(value)) {
      errors.push(`Color token "${key}" has invalid value: "${value}"`);
    }
  }
  
 return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates semantic spacing tokens
 */
function validateSemanticSpacingTokens(spacing: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof spacing !== 'object') {
    return { success: false, errors: ['Spacing tokens must be an object'] };
  }
  
  for (const [key, value] of Object.entries(spacing)) {
    if (typeof value !== 'number') {
      errors.push(`Spacing token "${key}" must be a number`);
    } else if (value < 0) {
      errors.push(`Spacing token "${key}" must be non-negative`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates semantic typography tokens
 */
function validateSemanticTypographyTokens(typography: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof typography !== 'object') {
    return { success: false, errors: ['Typography tokens must be an object'] };
  }
  
 if (typography.fontFamily && typeof typography.fontFamily !== 'string') {
    errors.push('Typography fontFamily must be a string');
  }
  
  if (typography.sizes && typeof typography.sizes !== 'object') {
    errors.push('Typography sizes must be an object');
  } else if (typography.sizes) {
    for (const [key, value] of Object.entries(typography.sizes)) {
      if (typeof value !== 'number') {
        errors.push(`Typography size token "${key}" must be a number`);
      }
    }
 }
  
  if (typography.weights && typeof typography.weights !== 'object') {
    errors.push('Typography weights must be an object');
  } else if (typography.weights) {
    for (const [key, value] of Object.entries(typography.weights)) {
      if (typeof value !== 'number') {
        errors.push(`Typography weight token "${key}" must be a number`);
      } else if (value < 100 || value > 900 || value % 100 !== 0) {
        errors.push(`Typography weight token "${key}" must be a valid font weight (100-900, multiple of 100)`);
      }
    }
  }
  
  if (typography.lineHeights && typeof typography.lineHeights !== 'object') {
    errors.push('Typography lineHeights must be an object');
  } else if (typography.lineHeights) {
    for (const [key, value] of Object.entries(typography.lineHeights)) {
      if (typeof value !== 'number') {
        errors.push(`Typography lineHeight token "${key}" must be a number`);
      }
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates semantic radius tokens
 */
function validateSemanticRadiusTokens(radius: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof radius !== 'object') {
    return { success: false, errors: ['Radius tokens must be an object'] };
  }
  
  for (const [key, value] of Object.entries(radius)) {
    if (typeof value !== 'number') {
      errors.push(`Radius token "${key}" must be a number`);
    } else if (value < 0) {
      errors.push(`Radius token "${key}" must be non-negative`);
    }
 }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates semantic shadow tokens
 */
function validateSemanticShadowTokens(shadows: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof shadows !== 'object') {
    return { success: false, errors: ['Shadow tokens must be an object'] };
  }
  
  for (const [key, value] of Object.entries(shadows)) {
    if (typeof value !== 'string') {
      errors.push(`Shadow token "${key}" must be a string`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates semantic transition tokens
 */
function validateSemanticTransitionTokens(transitions: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (typeof transitions !== 'object') {
    return { success: false, errors: ['Transition tokens must be an object'] };
  }
  
  for (const [key, value] of Object.entries(transitions)) {
    if (key.includes('duration') && typeof value !== 'number') {
      errors.push(`Transition duration token "${key}" must be a number`);
    } else if (key.includes('easing') && typeof value !== 'string') {
      errors.push(`Transition easing token "${key}" must be a string`);
    } else if (!key.includes('duration') && !key.includes('easing') && typeof value !== 'number') {
      errors.push(`Transition token "${key}" must be a number`);
    }
 }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ============================================================================
// TOKEN TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transforms a token set into CSS custom properties (CSS variables)
 * @param tokens - The token set to transform
 * @param prefix - Optional prefix for CSS variables (default: 'ff')
 * @returns Object containing CSS custom properties
 */
export function tokensToCSSVariables(tokens: TokenSet, prefix: string = 'ff'): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Transform colors
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      cssVars[`--${prefix}-color-${key}`] = value;
    }
  }
  
  // Transform spacing
  if (tokens.spacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      cssVars[`--${prefix}-spacing-${key}`] = `${value}px`;
    }
  }
  
  // Transform typography
  if (tokens.typography) {
    if (tokens.typography.fontFamily) {
      cssVars[`--${prefix}-font-family`] = tokens.typography.fontFamily;
    }
    
    if (tokens.typography.sizes) {
      for (const [key, value] of Object.entries(tokens.typography.sizes)) {
        cssVars[`--${prefix}-font-size-${key}`] = `${value}px`;
      }
    }
    
    if (tokens.typography.weights) {
      for (const [key, value] of Object.entries(tokens.typography.weights)) {
        cssVars[`--${prefix}-font-weight-${key}`] = `${value}`;
      }
    }
    
    if (tokens.typography.lineHeights) {
      for (const [key, value] of Object.entries(tokens.typography.lineHeights)) {
        cssVars[`--${prefix}-line-height-${key}`] = `${value}`;
      }
    }
  }
  
 // Transform radius
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      cssVars[`--${prefix}-radius-${key}`] = `${value}px`;
    }
  }
  
  // Transform shadows
  if (tokens.shadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      cssVars[`--${prefix}-shadow-${key}`] = value;
    }
  }
  
  // Transform transitions
  if (tokens.transitions) {
    for (const [key, value] of Object.entries(tokens.transitions)) {
      cssVars[`--${prefix}-transition-${key}`] = typeof value === 'number' ? `${value}ms` : value;
    }
  }
  
  return cssVars;
}

/**
 * Transforms an enhanced token set into CSS custom properties (CSS variables)
 * @param tokens - The enhanced token set to transform
 * @param prefix - Optional prefix for CSS variables (default: 'ff')
 * @returns Object containing CSS custom properties
 */
export function enhancedTokensToCSSVariables(tokens: EnhancedTokenSet, prefix: string = 'ff'): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Transform colors
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      cssVars[`--${prefix}-color-${key}`] = value;
    }
  }
  
  // Transform spacing
  if (tokens.spacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      cssVars[`--${prefix}-spacing-${key}`] = `${value}px`;
    }
  }
  
  // Transform typography
  if (tokens.typography) {
    if (tokens.typography.fontFamily) {
      cssVars[`--${prefix}-font-family`] = tokens.typography.fontFamily;
    }
    
    if (tokens.typography['font-family-secondary']) {
      cssVars[`--${prefix}-font-family-secondary`] = tokens.typography['font-family-secondary'];
    }
    
    if (tokens.typography['font-family-mono']) {
      cssVars[`--${prefix}-font-family-mono`] = tokens.typography['font-family-mono'];
    }
    
    // Size tokens
    const sizeKeys = Object.keys(tokens.typography).filter(key => key.startsWith('size-'));
    for (const key of sizeKeys) {
      const value = (tokens.typography as any)[key];
      if (typeof value === 'number') {
        cssVars[`--${prefix}-${key}`] = `${value}px`;
      }
    }
    
    // Weight tokens
    const weightKeys = Object.keys(tokens.typography).filter(key => key.startsWith('weight-'));
    for (const key of weightKeys) {
      const value = (tokens.typography as any)[key];
      if (typeof value === 'number') {
        cssVars[`--${prefix}-${key}`] = `${value}`;
      }
    }
    
    // Line height tokens
    const lineHeightKeys = Object.keys(tokens.typography).filter(key => key.startsWith('line-height-'));
    for (const key of lineHeightKeys) {
      const value = (tokens.typography as any)[key];
      if (typeof value === 'number') {
        cssVars[`--${prefix}-${key}`] = `${value}`;
      }
    }
    
    // Letter spacing tokens
    const letterSpacingKeys = Object.keys(tokens.typography).filter(key => key.startsWith('letter-spacing-'));
    for (const key of letterSpacingKeys) {
      const value = (tokens.typography as any)[key];
      if (typeof value === 'number') {
        cssVars[`--${prefix}-${key}`] = `${value}`;
      }
    }
  }
  
  // Transform radius
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      cssVars[`--${prefix}-radius-${key}`] = `${value}px`;
    }
  }
  
  // Transform shadows
  if (tokens.shadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      cssVars[`--${prefix}-shadow-${key}`] = value;
    }
  }
  
  // Transform transitions
  if (tokens.transitions) {
    // Duration tokens
    const durationKeys = Object.keys(tokens.transitions).filter(key => key.includes('duration'));
    for (const key of durationKeys) {
      const value = (tokens.transitions as any)[key];
      if (typeof value === 'number') {
        cssVars[`--${prefix}-${key}`] = `${value}ms`;
      }
    }
    
    // Easing tokens
    const easingKeys = Object.keys(tokens.transitions).filter(key => key.includes('easing'));
    for (const key of easingKeys) {
      const value = (tokens.transitions as any)[key];
      if (typeof value === 'string') {
        cssVars[`--${prefix}-${key}`] = value;
      }
    }
  }
  
  // Transform additional tokens
 if (tokens.sizes) {
    for (const [key, value] of Object.entries(tokens.sizes)) {
      cssVars[`--${prefix}-size-${key}`] = `${value}px`;
    }
  }
  
 if (tokens.zIndices) {
    for (const [key, value] of Object.entries(tokens.zIndices)) {
      cssVars[`--${prefix}-z-${key}`] = `${value}`;
    }
 }
  
  if (tokens.breakpoints) {
    for (const [key, value] of Object.entries(tokens.breakpoints)) {
      cssVars[`--${prefix}-breakpoint-${key}`] = `${value}px`;
    }
  }
  
  if (tokens.opacities) {
    for (const [key, value] of Object.entries(tokens.opacities)) {
      cssVars[`--${prefix}-opacity-${key}`] = `${value}`;
    }
  }
  
  if (tokens.motion) {
    for (const [key, value] of Object.entries(tokens.motion)) {
      cssVars[`--${prefix}-motion-${key}`] = value;
    }
  }
  
  return cssVars;
}

/**
 * Applies tokens to the document root as CSS custom properties
 * @param tokens - The token set to apply
 * @param prefix - Optional prefix for CSS variables (default: 'ff')
 */
export function applyTokensToDOM(tokens: TokenSet | EnhancedTokenSet, prefix: string = 'ff'): void {
  const isEnhanced = 'colors' in tokens && typeof (tokens as EnhancedTokenSet).colors === 'object' && 
                     'primary' in (tokens as EnhancedTokenSet).colors;
  
  const cssVars = isEnhanced 
    ? enhancedTokensToCSSVariables(tokens as EnhancedTokenSet, prefix)
    : tokensToCSSVariables(tokens as TokenSet, prefix);
  
  const root = document.documentElement;
  
  // Apply CSS variables to the root element
 for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(key, value);
 }
}

/**
 * Creates a default token set with common design values
 * @returns A default token set
 */
export function createDefaultTokens(): TokenSet {
 return {
    colors: {
      primary: '#3b82f6',
      'primary-50': '#eff6ff',
      'primary-100': '#dbeafe',
      'primary-200': '#bfdbfe',
      'primary-300': '#93c5fd',
      'primary-400': '#60a5fa',
      'primary-500': '#3b82f6',
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
      'success-200': '#a7f3d0',
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
      'warning-60': '#d97706',
      'warning-700': '#b45309',
      'warning-800': '#92400e',
      'warning-900': '#78350f',
      error: '#ef4444',
      'error-50': '#fef2f2',
      'error-100': '#fee2e2',
      'error-200': '#fecaca',
      'error-300': '#fca5a5',
      'error-400': '#f87171',
      'error-500': '#ef4444',
      'error-600': '#dc2626',
      'error-700': '#b91c1c',
      'error-800': '#991b1b',
      'error-900': '#7f1d',
      info: '#3b82f6',
      white: '#ffffff',
      black: '#000000',
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
      'avatar-radius': 9999,
      'badge-radius': 12,
    },
    shadows: {
      'none': 'none',
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
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
      'duration-slow': 30,
      'duration-slower': 400,
      'duration-slowest': 500,
      'button-transition': 200,
      'input-transition': 200,
      'modal-transition': 30,
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
 * Creates a dark theme token set based on the default tokens
 * @returns A dark theme token set
 */
export function createDarkThemeTokens(): TokenSet {
  return {
    colors: {
      primary: '#60a5fa',
      'primary-50': '#eff6ff',
      'primary-100': '#dbeafe',
      'primary-200': '#bfdbfe',
      'primary-300': '#93c5fd',
      'primary-400': '#60a5fa',
      'primary-500': '#3b82f6',
      'primary-600': '#2563eb',
      'primary-700': '#1d4ed8',
      'primary-800': '#1e40af',
      'primary-900': '#1e3a8a',
      secondary: '#94a3b8',
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
      'bg-base': '#0f172a',
      'bg-surface': '#1e293b',
      'bg-elevated': '#334155',
      'bg-overlay': 'rgba(0, 0, 0, 0.5)',
      'bg-accent': '#3b82f6',
      'text-primary': '#f1f5f9',
      'text-secondary': '#94a3b8',
      'text-muted': '#64748b',
      'text-disabled': '#475569',
      'text-inverse': '#0f172a',
      'border-base': '#475569',
      'border-muted': '#334155',
      'border-accent': '#60a5fa',
      'border-focus': '#3b82f6',
      success: '#34d39',
      'success-50': '#ecfdf5',
      'success-100': '#d1fae5',
      'success-200': '#a7f3d0',
      'success-300': '#6ee7b7',
      'success-400': '#34d399',
      'success-500': '#10b981',
      'success-600': '#059669',
      'success-700': '#047857',
      'success-800': '#065f46',
      'success-900': '#064e3b',
      warning: '#fbbf24',
      'warning-50': '#fffbeb',
      'warning-100': '#fef3c7',
      'warning-200': '#fde68a',
      'warning-300': '#fcd34d',
      'warning-400': '#fbbf24',
      'warning-500': '#f59e0b',
      'warning-600': '#d9706',
      'warning-700': '#b45309',
      'warning-800': '#92400e',
      'warning-900': '#78350f',
      error: '#f87171',
      'error-50': '#fef2f2',
      'error-100': '#fee2e2',
      'error-200': '#fecaca',
      'error-300': '#fca5a5',
      'error-400': '#f87171',
      'error-500': '#ef4444',
      'error-600': '#dc2626',
      'error-700': '#b91c1c',
      'error-800': '#91b1b',
      'error-900': '#7f1d1d',
      info: '#60a5fa',
      white: '#ffffff',
      black: '#000000',
      'gray-50': '#f9fafb',
      'gray-10': '#f3f4f6',
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
      'avatar-radius': 9999,
      'badge-radius': 12,
    },
    shadows: {
      'none': 'none',
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
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
      'duration-slow': 30,
      'duration-slower': 400,
      'duration-slowest': 500,
      'button-transition': 200,
      'input-transition': 200,
      'modal-transition': 30,
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
 * Creates a high contrast theme token set
 * @returns A high contrast theme token set
 */
export function createHighContrastTokens(): TokenSet {
  return {
    colors: {
      primary: '#ffffff',
      'primary-50': '#ffffff',
      'primary-100': '#ffffff',
      'primary-200': '#ffffff',
      'primary-300': '#ffffff',
      'primary-400': '#ffffff',
      'primary-500': '#ffffff',
      'primary-600': '#ffffff',
      'primary-700': '#ffffff',
      'primary-800': '#ffffff',
      'primary-900': '#ffffff',
      secondary: '#ffffff',
      'secondary-50': '#ffffff',
      'secondary-100': '#ffffff',
      'secondary-200': '#ffffff',
      'secondary-300': '#ffffff',
      'secondary-400': '#ffffff',
      'secondary-500': '#ffffff',
      'secondary-60': '#ffffff',
      'secondary-700': '#ffffff',
      'secondary-800': '#ffffff',
      'secondary-900': '#ffffff',
      'bg-base': '#0000',
      'bg-surface': '#00000',
      'bg-elevated': '#00000',
      'bg-overlay': 'rgba(0, 0, 0, 0.8)',
      'bg-accent': '#ffffff',
      'text-primary': '#ffffff',
      'text-secondary': '#ffffff',
      'text-muted': '#ffffff',
      'text-disabled': '#808080',
      'text-inverse': '#00000',
      'border-base': '#ffffff',
      'border-muted': '#ffffff',
      'border-accent': '#ffffff',
      'border-focus': '#ffffff',
      success: '#00ff00',
      'success-50': '#00ff00',
      'success-100': '#00ff00',
      'success-200': '#00ff00',
      'success-300': '#00ff00',
      'success-400': '#0ff00',
      'success-500': '#00ff00',
      'success-600': '#00ff00',
      'success-700': '#00ff00',
      'success-800': '#00ff00',
      'success-900': '#00ff00',
      warning: '#ffff00',
      'warning-50': '#ffff00',
      'warning-100': '#ffff00',
      'warning-200': '#ffff00',
      'warning-300': '#ffff00',
      'warning-400': '#ffff00',
      'warning-500': '#ffff00',
      'warning-600': '#ffff00',
      'warning-700': '#ffff00',
      'warning-800': '#ffff00',
      'warning-900': '#ffff00',
      error: '#ff0000',
      'error-50': '#ff0000',
      'error-100': '#ff0000',
      'error-200': '#ff0000',
      'error-300': '#ff0000',
      'error-400': '#ff0000',
      'error-500': '#ff0000',
      'error-600': '#ff0000',
      'error-700': '#ff0000',
      'error-800': '#ff0000',
      'error-900': '#ff0000',
      info: '#00ffff',
      white: '#ffffff',
      black: '#00000',
      'gray-50': '#ffffff',
      'gray-100': '#ffffff',
      'gray-200': '#c0c0c0',
      'gray-300': '#a0a0a0',
      'gray-400': '#808080',
      'gray-500': '#808080',
      'gray-600': '#808080',
      'gray-700': '#808080',
      'gray-800': '#808080',
      'gray-900': '#808080',
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
        'xs': 14,
        'sm': 16,
        'base': 18,
        'lg': 20,
        'xl': 24,
        '2xl': 30,
        '3xl': 36,
        '4xl': 48,
        '5xl': 60,
        '6xl': 72,
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
      '1': 0,
      '2': 0,
      '4': 0,
      '8': 0,
      '12': 0,
      '16': 0,
      '20': 0,
      '24': 0,
      '32': 0,
      '40': 0,
      '48': 0,
      '56': 0,
      '64': 0,
      'xs': 0,
      'sm': 0,
      'md': 0,
      'lg': 0,
      'xl': 0,
      '2xl': 0,
      '3xl': 0,
      'full': 0,
      'button-radius': 0,
      'input-radius': 0,
      'card-radius': 0,
      'modal-radius': 0,
      'avatar-radius': 0,
      'badge-radius': 0,
    },
    shadows: {
      'none': 'none',
      'sm': '0 0 2px #ffffff',
      'base': '0 0 2px #ffffff',
      'md': '0 0 0 2px #ffffff',
      'lg': '0 0 2px #ffffff',
      'xl': '0 0 2px #ffffff',
      '2xl': '0 0 0 2px #ffffff',
      'inner': 'inset 0 0 2px #ffffff',
      'button-shadow': '0 0 2px #ffffff',
      'card-shadow': '0 0 0 2px #ffffff',
      'modal-shadow': '0 0 2px #ffffff',
      'popover-shadow': '0 0 0 2px #ffffff',
      'dropdown-shadow': '0 0 2px #ffffff',
      'tooltip-shadow': '0 0 2px #ffffff',
      'toast-shadow': '0 0 0 2px #ffffff',
    },
    transitions: {
      'duration-instant': 0,
      'duration-fastest': 0,
      'duration-faster': 0,
      'duration-fast': 0,
      'duration-normal': 0,
      'duration-slow': 0,
      'duration-slower': 0,
      'duration-slowest': 0,
      'button-transition': 0,
      'input-transition': 0,
      'modal-transition': 0,
      'drawer-transition': 0,
      'tooltip-transition': 0,
      'easing-linear': 'linear',
      'easing-in': 'linear',
      'easing-out': 'linear',
      'easing-in-out': 'linear',
      'easing-bounce': 'linear',
    },
  };
}