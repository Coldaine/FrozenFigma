/**
 * Token-to-Style Converter
 * 
 * This module provides utilities for converting design tokens to CSS styles,
 * with support for various component types and responsive design.
 */

import { TokenSet } from '../../schema';

// ============================================================================
// TOKEN-TO-STYLE CONVERSION UTILITIES
// ============================================================================

/**
 * Component type for style conversion
 */
export type ComponentTypeForStyle = 
  | 'button'
  | 'input'
  | 'card'
  | 'card-grid'
  | 'form'
  | 'slider'
  | 'toggle'
  | 'tabs'
  | 'modal'
  | 'tray'
  | 'select'
  | 'textarea'
  | 'progress'
  | 'tooltip'
  | 'popover'
  | 'drawer'
  | 'dialog'
  | 'generic';

/**
 * Style conversion options
 */
export interface StyleConversionOptions {
  /** Component type for specific styling rules */
  componentType?: ComponentTypeForStyle;
  /** Additional CSS properties to include */
  additionalStyles?: Record<string, string | number>;
  /** Whether to include responsive styles */
  includeResponsive?: boolean;
  /** Breakpoint values for responsive styles */
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Prefix for CSS variables (default: 'ff') */
  variablePrefix?: string;
}

/**
 * Converts a token set to CSS styles for a specific component type
 * 
 * @param tokens - The token set to convert
 * @param options - Conversion options
 * @returns CSS styles object
 */
export function tokensToStyles(tokens: TokenSet, options?: StyleConversionOptions): Record<string, unknown> {
  const opts: Required<StyleConversionOptions> = {
    componentType: options?.componentType || 'generic',
    additionalStyles: options?.additionalStyles || {},
    includeResponsive: options?.includeResponsive !== false,
    breakpoints: options?.breakpoints || { sm: 640, md: 768, lg: 1024, xl: 1280 },
    variablePrefix: options?.variablePrefix || 'ff',
 };
  
  let styles: Record<string, unknown> = {};
  
  // Apply base styles common to all components
  styles = {
    ...styles,
    ...getBaseStyles(tokens, opts.variablePrefix),
  };
  
  // Apply component-specific styles
  switch (opts.componentType) {
    case 'button':
      styles = { ...styles, ...getButtonStyles(tokens, opts.variablePrefix) };
      break;
    case 'input':
      styles = { ...styles, ...getInputStyles(tokens, opts.variablePrefix) };
      break;
    case 'card':
      styles = { ...styles, ...getCardStyles(tokens, opts.variablePrefix) };
      break;
    case 'modal':
      styles = { ...styles, ...getModalStyles(tokens, opts.variablePrefix) };
      break;
    case 'tooltip':
      styles = { ...styles, ...getTooltipStyles(tokens, opts.variablePrefix) };
      break;
    case 'card-grid':
    case 'form':
    case 'slider':
    case 'toggle':
    case 'tabs':
    case 'tray':
    case 'select':
    case 'textarea':
    case 'progress':
    case 'popover':
    case 'drawer':
    case 'dialog':
    case 'generic':
    default:
      // For other components, apply general styling
      styles = { ...styles, ...getGeneralComponentStyles(tokens, opts.componentType, opts.variablePrefix) };
      break;
  }
  
  // Add any additional styles
  styles = { ...styles, ...opts.additionalStyles };
  
  return styles;
}

/**
 * Gets base styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Base CSS styles
 */
function getBaseStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-bg-surface, ${tokens.colors['bg-surface'] || tokens.colors['bg-base'] || '#ffffff'})`;
    styles.color = `var(--${prefix}-color-text-primary, ${tokens.colors['text-primary'] || '#000000'})`;
  }
  
  // Apply font family
  if (tokens.typography?.fontFamily) {
    styles.fontFamily = `var(--${prefix}-font-family, "${tokens.typography.fontFamily}")`;
  }
  
  // Apply base font size
  if (tokens.typography?.sizes?.base) {
    styles.fontSize = `var(--${prefix}-font-size-base, ${tokens.typography.sizes.base}px)`;
  }
  
  // Apply line height
  if (tokens.typography?.lineHeights?.normal) {
    styles.lineHeight = `var(--${prefix}-line-height-normal, ${tokens.typography.lineHeights.normal})`;
  }
  
  // Apply border
  if (tokens.colors) {
    styles.borderColor = `var(--${prefix}-color-border-base, ${tokens.colors['border-base'] || '#e2e8f0'})`;
  }
  
  // Apply border radius
  if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-md, ${tokens.radius.md || 6}px)`;
  }
  
  // Apply transition
  if (tokens.transitions) {
    styles.transition = `var(--${prefix}-transition-normal, ${tokens.transitions['duration-normal'] || 250}ms ease)`;
  }
  
  return styles;
}

/**
 * Gets button-specific styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Button CSS styles
 */
function getButtonStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply button-specific background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-primary, ${tokens.colors.primary || '#3b82f6'})`;
    styles.color = `var(--${prefix}-color-text-inverse, ${tokens.colors['text-inverse'] || '#ffffff'})`;
    
    // Hover state
    styles[':hover'] = {
      backgroundColor: `var(--${prefix}-color-primary-600, ${tokens.colors['primary-60'] || '#2563eb'})`,
    };
    
    // Focus state
    styles[':focus'] = {
      outline: 'none',
      boxShadow: `0 0 0 3px var(--${prefix}-color-border-focus, ${tokens.colors['border-focus'] || tokens.colors.primary || '#3b82f6'})40`,
    };
    
    // Disabled state
    styles[':disabled'] = {
      backgroundColor: `var(--${prefix}-color-bg-surface, ${tokens.colors['bg-surface'] || '#f3f4f6'})`,
      color: `var(--${prefix}-color-text-disabled, ${tokens.colors['text-disabled'] || '#9ca3af'})`,
      cursor: 'not-allowed',
    };
  }
  
  // Apply button-specific padding
  if (tokens.spacing) {
    styles.padding = `var(--${prefix}-spacing-button-padding, ${tokens.spacing['button-padding'] || 12}px) var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`;
  }
  
  // Apply button-specific border radius
 if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-button-radius, ${tokens.radius['button-radius'] || tokens.radius.md || 6}px)`;
  }
  
  // Apply button-specific transition
  if (tokens.transitions) {
    styles.transition = `background-color var(--${prefix}-transition-button, ${tokens.transitions['button-transition'] || 200}ms ease), border-color var(--${prefix}-transition-button, ${tokens.transitions['button-transition'] || 200}ms ease)`;
  }
  
  // Apply font weight
 if (tokens.typography?.weights?.medium) {
    styles.fontWeight = `var(--${prefix}-font-weight-medium, ${tokens.typography.weights.medium})`;
  }
  
  return styles;
}

/**
 * Gets input-specific styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Input CSS styles
 */
function getInputStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply input background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-bg-surface, ${tokens.colors['bg-surface'] || '#ffffff'})`;
    styles.color = `var(--${prefix}-color-text-primary, ${tokens.colors['text-primary'] || '#0000'})`;
    styles.borderColor = `var(--${prefix}-color-border-base, ${tokens.colors['border-base'] || '#e2e8f0'})`;
    
    // Focus state
    styles[':focus'] = {
      outline: 'none',
      borderColor: `var(--${prefix}-color-border-focus, ${tokens.colors['border-focus'] || tokens.colors.primary || '#3b82f6'})`,
      boxShadow: `0 0 0 3px var(--${prefix}-color-border-focus, ${tokens.colors['border-focus'] || tokens.colors.primary || '#3b82f6'})40`,
    };
    
    // Disabled state
    styles[':disabled'] = {
      backgroundColor: `var(--${prefix}-color-bg-surface, ${tokens.colors['bg-surface'] || '#f3f4f6'})`,
      color: `var(--${prefix}-color-text-disabled, ${tokens.colors['text-disabled'] || '#9ca3af'})`,
      cursor: 'not-allowed',
    };
  }
  
  // Apply input padding
  if (tokens.spacing) {
    styles.padding = `var(--${prefix}-spacing-input-padding, ${tokens.spacing['input-padding'] || 12}px) var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`;
  }
  
  // Apply input border radius
  if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-input-radius, ${tokens.radius['input-radius'] || tokens.radius.md || 6}px)`;
  }
  
  // Apply input border width
  styles.borderWidth = '1px';
  styles.borderStyle = 'solid';
  
  // Apply input transition
  if (tokens.transitions) {
    styles.transition = `border-color var(--${prefix}-transition-input, ${tokens.transitions['input-transition'] || 200}ms ease), box-shadow var(--${prefix}-transition-input, ${tokens.transitions['input-transition'] || 20}ms ease)`;
  }
  
  return styles;
}

/**
 * Gets card-specific styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Card CSS styles
 */
function getCardStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply card background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-bg-surface, ${tokens.colors['bg-surface'] || '#ffffff'})`;
    styles.color = `var(--${prefix}-color-text-primary, ${tokens.colors['text-primary'] || '#00000'})`;
  }
  
  // Apply card padding
  if (tokens.spacing) {
    styles.padding = `var(--${prefix}-spacing-card-padding, ${tokens.spacing['card-padding'] || 16}px)`;
  }
  
  // Apply card border radius
  if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-card-radius, ${tokens.radius['card-radius'] || tokens.radius.md || 8}px)`;
  }
  
  // Apply card shadow
  if (tokens.shadows) {
    styles.boxShadow = `var(--${prefix}-shadow-card, ${tokens.shadows['card-shadow'] || tokens.shadows.base || '0 1px 3px 0 rgba(0, 0, 0, 0.1)'})`;
  }
  
  // Apply card border
  if (tokens.colors) {
    styles.borderColor = `var(--${prefix}-color-border-base, ${tokens.colors['border-base'] || '#e2e8f0'})`;
    styles.borderWidth = '1px';
    styles.borderStyle = 'solid';
  }
  
  return styles;
}

/**
 * Gets modal-specific styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Modal CSS styles
 */
function getModalStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply modal background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-bg-elevated, ${tokens.colors['bg-elevated'] || '#ffffff'})`;
    styles.color = `var(--${prefix}-color-text-primary, ${tokens.colors['text-primary'] || '#00000'})`;
  }
  
  // Apply modal padding
  if (tokens.spacing) {
    styles.padding = `var(--${prefix}-spacing-modal-padding, ${tokens.spacing['modal-padding'] || 24}px)`;
  }
  
  // Apply modal border radius
  if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-modal-radius, ${tokens.radius['modal-radius'] || tokens.radius.lg || 12}px)`;
 }
  
  // Apply modal shadow
  if (tokens.shadows) {
    styles.boxShadow = `var(--${prefix}-shadow-modal, ${tokens.shadows['modal-shadow'] || tokens.shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'})`;
  }
  
  // Apply modal transition
  if (tokens.transitions) {
    styles.transition = `opacity var(--${prefix}-transition-modal, ${tokens.transitions['modal-transition'] || 300}ms ease), transform var(--${prefix}-transition-modal, ${tokens.transitions['modal-transition'] || 300}ms ease)`;
  }
  
  return styles;
}

/**
 * Gets tooltip-specific styles from tokens
 * 
 * @param tokens - The token set
 * @param prefix - CSS variable prefix
 * @returns Tooltip CSS styles
 */
function getTooltipStyles(tokens: TokenSet, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply tooltip background and text colors
  if (tokens.colors) {
    styles.backgroundColor = `var(--${prefix}-color-bg-elevated, ${tokens.colors['bg-elevated'] || '#1f2937'})`;
    styles.color = `var(--${prefix}-color-text-inverse, ${tokens.colors['text-inverse'] || '#ffffff'})`;
  }
  
  // Apply tooltip padding
  if (tokens.spacing) {
    styles.padding = `var(--${prefix}-spacing-sm, ${tokens.spacing.sm || 8}px) var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`;
  }
  
  // Apply tooltip border radius
  if (tokens.radius) {
    styles.borderRadius = `var(--${prefix}-radius-sm, ${tokens.radius.sm || 4}px)`;
  }
  
  // Apply tooltip font size
 if (tokens.typography?.sizes?.sm) {
    styles.fontSize = `var(--${prefix}-font-size-sm, ${tokens.typography.sizes.sm || 14}px)`;
  }
  
  // Apply tooltip shadow
 if (tokens.shadows) {
    styles.boxShadow = `var(--${prefix}-shadow-tooltip, ${tokens.shadows['tooltip-shadow'] || tokens.shadows.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'})`;
 }
  
  // Apply tooltip transition
 if (tokens.transitions) {
    styles.transition = `opacity var(--${prefix}-transition-tooltip, ${tokens.transitions['tooltip-transition'] || 150}ms ease)`;
  }
  
  return styles;
}

/**
 * Gets general component styles
 * 
 * @param tokens - The token set
 * @param componentType - The component type
 * @param prefix - CSS variable prefix
 * @returns General component CSS styles
 */
function getGeneralComponentStyles(tokens: TokenSet, componentType: ComponentTypeForStyle, prefix: string): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply general spacing based on component type
  if (tokens.spacing) {
    switch (componentType) {
      case 'card-grid':
        styles.gap = `var(--${prefix}-spacing-grid-gap, ${tokens.spacing['grid-gap'] || 16}px)`;
        break;
      case 'form':
        styles.gap = `var(--${prefix}-spacing-form-gap, ${tokens.spacing['form-gap'] || 12}px)`;
        break;
      default:
        styles.margin = `var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`;
        break;
    }
 }
  
  return styles;
}

/**
 * Converts a specific token to a CSS value with fallbacks
 * 
 * @param tokens - The token set
 * @param tokenPath - Path to the token (e.g. 'colors.primary', 'spacing.md')
 * @param fallback - Fallback value if token is not found
 * @param prefix - CSS variable prefix
 * @returns CSS value with variable reference
 */
export function tokenToCSSValue(
  tokens: TokenSet,
  tokenPath: string,
  fallback?: string | number,
  prefix: string = 'ff'
): string {
  // Split the path by dots to navigate the object
  const pathParts = tokenPath.split('.');
  
  let current: unknown = tokens;
  
  for (const part of pathParts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      // If the token doesn't exist, return the fallback or a default value
      return fallback !== undefined ? fallback.toString() : '';
    }
  }
  
  // If we found a value, create a CSS variable reference
  const cssVarName = `--${prefix}-${pathParts.join('-')}`;
  return `var(${cssVarName}, ${current})`;
}

/**
 * Gets a responsive style object based on breakpoints
 * 
 * @param tokens - The token set
 * @param property - The CSS property to make responsive
 * @param prefix - CSS variable prefix
 * @returns Responsive style object
 */
export function getResponsiveStyles(
  tokens: TokenSet,
  property: string,
  prefix: string = 'ff'
): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  // Apply base style
 if (tokens.spacing) {
    styles[property] = `var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`;
  }
  
  // Apply responsive styles if spacing tokens exist
  if (tokens.spacing) {
    styles['@media (min-width: 640px)'] = {
      [property]: `var(--${prefix}-spacing-md, ${tokens.spacing.md || 16}px)`,
    };
    
    styles['@media (min-width: 768px)'] = {
      [property]: `var(--${prefix}-spacing-lg, ${tokens.spacing.lg || 24}px)`,
    };
    
    styles['@media (min-width: 1024px)'] = {
      [property]: `var(--${prefix}-spacing-xl, ${tokens.spacing.xl || 32}px)`,
    };
  }
  
  return styles;
}

/**
 * Creates a style object with token-based values for a specific component
 * 
 * @param componentType - The component type
 * @param tokens - The token set
 * @param customStyles - Custom styles to merge
 * @param prefix - CSS variable prefix
 * @returns Complete style object
 */
export function createComponentStyles(
  componentType: ComponentTypeForStyle,
  tokens: TokenSet,
  customStyles: Record<string, unknown> = {},
  prefix: string = 'ff'
): Record<string, unknown> {
  // Get base styles for the component
  const baseStyles = tokensToStyles(tokens, { componentType, variablePrefix: prefix });
  
  // Merge with custom styles
 return {
    ...baseStyles,
    ...(customStyles as Record<string, unknown>),
  };
}

/**
 * Validates that a token set can be converted to valid CSS styles
 * 
 * @param tokens - The token set to validate
 * @returns Validation result with success status and errors
 */
export function validateTokenToStyleConversion(tokens: TokenSet): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Validate colors
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      if (typeof value !== 'string') {
        errors.push(`Color token "${key}" must be a string, got ${typeof value}`);
      }
    }
  }
  
  // Validate spacing
  if (tokens.spacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      if (typeof value !== 'number') {
        errors.push(`Spacing token "${key}" must be a number, got ${typeof value}`);
      }
    }
  }
  
  // Validate typography
  if (tokens.typography) {
    if (tokens.typography.fontFamily && typeof tokens.typography.fontFamily !== 'string') {
      errors.push('Typography fontFamily must be a string');
    }
    
    if (tokens.typography.sizes) {
      for (const [key, value] of Object.entries(tokens.typography.sizes)) {
        if (typeof value !== 'number') {
          errors.push(`Typography size token "${key}" must be a number, got ${typeof value}`);
        }
      }
    }
    
    if (tokens.typography.weights) {
      for (const [key, value] of Object.entries(tokens.typography.weights)) {
        if (typeof value !== 'number') {
          errors.push(`Typography weight token "${key}" must be a number, got ${typeof value}`);
        }
      }
    }
    
    if (tokens.typography.lineHeights) {
      for (const [key, value] of Object.entries(tokens.typography.lineHeights)) {
        if (typeof value !== 'number') {
          errors.push(`Typography line height token "${key}" must be a number, got ${typeof value}`);
        }
      }
    }
  }
  
  // Validate radius
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      if (typeof value !== 'number') {
        errors.push(`Radius token "${key}" must be a number, got ${typeof value}`);
      }
    }
 }
  
  // Validate shadows
  if (tokens.shadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      if (typeof value !== 'string') {
        errors.push(`Shadow token "${key}" must be a string, got ${typeof value}`);
      }
    }
 }
  
  // Validate transitions
  if (tokens.transitions) {
    for (const [key, value] of Object.entries(tokens.transitions)) {
      if (typeof value !== 'number' && typeof value !== 'string') {
        errors.push(`Transition token "${key}" must be a number or string, got ${typeof value}`);
      }
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}