/**
 * Theme Gate Validator
 * 
 * This module provides validation for themes and tokens in the gate system,
 * ensuring that themes meet quality and consistency standards before being
 * applied or exported.
 */

import { TokenSet, Command } from '../../schema';
import { validateTokens } from '../../app/theme/themeUtils';
import { getThemeManager } from '../../app/theme/themeManager';
import { validateTokensForComponent, validateAccessibilityTokens, validateResponsiveTokens, validateTokenSetCompleteness } from '../../app/theme/tokenValidation';

// ============================================================================
// THEME GATE VALIDATOR
// ============================================================================

/**
 * Theme validation result
 */
export interface ThemeValidationResult {
  /** Overall success status */
  success: boolean;
  /** Individual validation results */
  validations: {
    /** Token validation result */
    tokens: { success: boolean; errors?: string[] };
    /** Token set completeness validation result */
    completeness?: { success: boolean; errors?: string[]; warnings?: string[]; suggestions?: string[] };
    /** Accessibility validation result */
    accessibility?: { success: boolean; errors?: string[]; warnings?: string[]; suggestions?: string[] };
    /** Responsive design validation result */
    responsive?: { success: boolean; errors?: string[]; warnings?: string[]; suggestions?: string[] };
    /** Component-specific validation results */
    components?: Record<string, { success: boolean; errors?: string[]; warnings?: string[]; suggestions?: string[] }>;
  };
  /** Combined errors from all validations */
  errors: string[];
  /** Combined warnings from all validations */
  warnings: string[];
  /** Suggestions for improvement */
  suggestions: string[];
}

/**
 * Theme gate validation options
 */
export interface ThemeGateValidationOptions {
  /** Whether to validate token completeness */
  validateCompleteness?: boolean;
  /** Whether to validate accessibility compliance */
  validateAccessibility?: boolean;
  /** Whether to validate responsive design compliance */
  validateResponsive?: boolean;
  /** Component types to validate specifically */
  validateComponents?: string[];
  /** Whether to fail on warnings */
  failOnWarnings?: boolean;
  /** Custom validation rules */
  customRules?: Array<(tokens: TokenSet) => { success: boolean; errors?: string[]; warnings?: string[]; suggestions?: string[] }>;
}

/**
 * Validates a theme in the gate system
 * 
 * @param tokens - Token set to validate
 * @param options - Validation options
 * @returns Theme validation result
 */
export function validateThemeInGate(
  tokens: TokenSet,
  options?: ThemeGateValidationOptions
): ThemeValidationResult {
  const opts: Required<ThemeGateValidationOptions> = {
    validateCompleteness: options?.validateCompleteness !== false,
    validateAccessibility: options?.validateAccessibility !== false,
    validateResponsive: options?.validateResponsive !== false,
    validateComponents: options?.validateComponents || [],
    failOnWarnings: !!options?.failOnWarnings,
    customRules: options?.customRules || [],
  };
  
  // Initialize result
  const result: ThemeValidationResult = {
    success: true,
    validations: {
      tokens: { success: true, errors: [] },
    },
    errors: [],
    warnings: [],
    suggestions: [],
  };
  
  // 1. Validate basic token structure
  result.validations.tokens = validateTokens(tokens);
  
  // 2. Validate token set completeness if requested
  if (opts.validateCompleteness) {
    result.validations.completeness = validateTokenSetCompleteness(tokens);
  }
  
  // 3. Validate accessibility compliance if requested
  if (opts.validateAccessibility) {
    result.validations.accessibility = validateAccessibilityTokens(tokens);
  }
  
  // 4. Validate responsive design compliance if requested
  if (opts.validateResponsive) {
    result.validations.responsive = validateResponsiveTokens(tokens);
  }
  
  // 5. Validate component-specific tokens if requested
  if (opts.validateComponents.length > 0) {
    result.validations.components = {};
    
    for (const componentType of opts.validateComponents) {
      result.validations.components[componentType] = validateTokensForComponent(tokens, componentType);
    }
  }
  
  // 6. Apply custom validation rules if provided
  const customResults = [];
  for (const rule of opts.customRules) {
    const customResult = rule(tokens);
    customResults.push(customResult);
    
    if (!customResult.success) {
      result.errors.push(...(customResult.errors || []));
      result.warnings.push(...(customResult.warnings || []));
    }
  }
  
  // Collect all errors and warnings
  result.errors = [
    ...(result.validations.tokens.errors || []),
    ...(result.validations.completeness?.errors || []),
    ...(result.validations.accessibility?.errors || []),
    ...(result.validations.responsive?.errors || []),
    ...Object.values(result.validations.components || {}).flatMap(v => v.errors || []),
    ...customResults.flatMap(r => r.errors || []),
  ];
  
  result.warnings = [
    ...(result.validations.completeness?.warnings || []),
    ...(result.validations.accessibility?.warnings || []),
    ...(result.validations.responsive?.warnings || []),
    ...Object.values(result.validations.components || {}).flatMap(v => v.warnings || []),
    ...customResults.flatMap(r => r.warnings || []),
  ];
  
  // Collect suggestions
  result.suggestions = [
    ...(result.validations.completeness?.suggestions || []),
    ...(result.validations.accessibility?.suggestions || []),
    ...(result.validations.responsive?.suggestions || []),
    ...Object.values(result.validations.components || {}).flatMap(v => v.suggestions || []),
    ...customResults.flatMap(r => r.suggestions || []),
  ];
  
  // Determine overall success
  result.success = result.errors.length === 0;
  
  // Fail on warnings if requested
  if (opts.failOnWarnings && result.warnings.length > 0) {
    result.success = false;
  }
  
  return result;
}

/**
 * Validates a theme command in the gate system
 * 
 * @param command - Command to validate
 * @param options - Validation options
 * @returns Theme validation result
 */
export function validateThemeCommandInGate(
  command: Command,
  options?: ThemeGateValidationOptions
): ThemeValidationResult {
  // For SET_TOKENS commands, validate the tokens
  if (command.type === 'SET_TOKENS') {
    return validateThemeInGate(command.tokens, options);
  }
  
  // For other commands, validate against current theme
  const themeManager = getThemeManager();
  const currentTokens = themeManager.getCurrentTokens();
  if (currentTokens) {
    return validateThemeInGate(currentTokens, options);
  }
  
  // If no current tokens, create default tokens for validation
  const defaultTokens = createDefaultTokens();
  return validateThemeInGate(defaultTokens, options);
}

/**
 * Creates default tokens for validation
 * 
 * @returns Default token set
 */
function createDefaultTokens(): TokenSet {
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
      'bg-base': '#ffffff',
      'bg-surface': '#f8fafc',
      'text-primary': '#0f172a',
      'text-secondary': '#64748b',
      'border-base': '#e2e8f0',
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
      'md': 16,
      'lg': 24,
      'xl': 32,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      sizes: {
        'sm': 14,
        'base': 16,
        'lg': 18,
        'xl': 20,
      },
      weights: {
        'normal': 400,
        'medium': 500,
        'bold': 700,
      },
      lineHeights: {
        'normal': 1.5,
        'tight': 1.25,
        'loose': 1.75,
      },
    },
    radius: {
      '0': 0,
      '1': 1,
      '2': 2,
      '4': 4,
      '8': 8,
      'md': 6,
      'lg': 8,
    },
    shadows: {
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    transitions: {
      'duration-normal': 250,
      'easing-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  };
}

/**
 * Validates theme contrast ratios for accessibility
 * 
 * @param tokens - Token set to validate
 * @returns Validation result with contrast issues
 */
export function validateThemeContrast(
  tokens: TokenSet
): { success: boolean; errors: string[]; warnings: string[]; suggestions: string[] } {
  const result = {
    success: true,
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[],
  };
  
  // Check text/background color contrasts
  if (tokens.colors) {
    // Define color pairs to check
    const colorPairs = [
      { text: 'text-primary', background: 'bg-base' },
      { text: 'text-secondary', background: 'bg-base' },
      { text: 'text-primary', background: 'bg-surface' },
      { text: 'text-secondary', background: 'bg-surface' },
    ];
    
    // For each pair, check if both colors exist
    for (const pair of colorPairs) {
      const textColor = tokens.colors[pair.text];
      const bgColor = tokens.colors[pair.background];
      
      if (textColor && bgColor) {
        // In a real implementation, we would calculate the actual contrast ratio
        // For now, we'll just add a note that contrast checking should be done
        result.warnings.push(`Contrast between ${pair.text} and ${pair.background} should be verified for accessibility`);
        result.suggestions.push(`Verify contrast ratio between ${pair.text} (${textColor}) and ${pair.background} (${bgColor}) meets WCAG standards`);
      }
    }
  }
  
  // Update success status
  result.success = result.errors.length === 0;
  
  return result;
}

/**
 * Validates theme consistency across categories
 * 
 * @param tokens - Token set to validate
 * @returns Validation result with consistency issues
 */
export function validateThemeConsistency(
  tokens: TokenSet
): { success: boolean; errors: string[]; warnings: string[]; suggestions: string[] } {
  const result = {
    success: true,
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[],
  };
  
  // Check for consistent naming patterns
  if (tokens.colors) {
    const colorKeys = Object.keys(tokens.colors);
    
    // Check for primary color variants
    const primaryVariants = colorKeys.filter(key => key.startsWith('primary-'));
    if (primaryVariants.length > 0 && !tokens.colors.primary) {
      result.errors.push('Primary color variants exist but no base primary color defined');
    }
    
    // Check for consistent spacing scales
    if (tokens.spacing) {
      const spacingKeys = Object.keys(tokens.spacing);
      
      // Check for common spacing tokens
      const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
      const missingSpacing = requiredSpacing.filter(token => !spacingKeys.includes(token));
      
      if (missingSpacing.length > 0) {
        result.warnings.push(`Missing common spacing tokens: ${missingSpacing.join(', ')}`);
        result.suggestions.push(`Add common spacing tokens for consistency: ${missingSpacing.join(', ')}`);
      }
    }
    
    // Check for consistent typography scales
    if (tokens.typography) {
      const fontSizeKeys = Object.keys(tokens.typography.sizes || {});
      
      // Check for common font size tokens
      const requiredFontSizes = ['xs', 'sm', 'base', 'lg', 'xl'];
      const missingFontSizes = requiredFontSizes.filter(token => !fontSizeKeys.includes(token));
      
      if (missingFontSizes.length > 0) {
        result.warnings.push(`Missing common font size tokens: ${missingFontSizes.join(', ')}`);
        result.suggestions.push(`Add common font size tokens for consistency: ${missingFontSizes.join(', ')}`);
      }
    }
    
    // Check for consistent radius scales
    if (tokens.radius) {
      const radiusKeys = Object.keys(tokens.radius);
      
      // Check for common radius tokens
      const requiredRadius = ['sm', 'md', 'lg'];
      const missingRadius = requiredRadius.filter(token => !radiusKeys.includes(token));
      
      if (missingRadius.length > 0) {
        result.warnings.push(`Missing common radius tokens: ${missingRadius.join(', ')}`);
        result.suggestions.push(`Add common radius tokens for consistency: ${missingRadius.join(', ')}`);
      }
    }
  }
  
  // Update success status
  result.success = result.errors.length === 0;
  
  return result;
}

/**
 * Validates theme performance considerations
 * 
 * @param tokens - Token set to validate
 * @returns Validation result with performance issues
 */
export function validateThemePerformance(
  tokens: TokenSet
): { success: boolean; errors: string[]; warnings: string[]; suggestions: string[] } {
  const result = {
    success: true,
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[],
  };
  
  // Check for excessive shadows
  if (tokens.shadows) {
    const shadowCount = Object.keys(tokens.shadows).length;
    if (shadowCount > 20) {
      result.warnings.push(`Excessive number of shadow tokens (${shadowCount}) may impact performance`);
      result.suggestions.push('Consider reducing the number of shadow tokens for better performance');
    }
  }
  
  // Check for excessive transitions
  if (tokens.transitions) {
    const transitionCount = Object.keys(tokens.transitions).length;
    if (transitionCount > 30) {
      result.warnings.push(`Excessive number of transition tokens (${transitionCount}) may impact performance`);
      result.suggestions.push('Consider reducing the number of transition tokens for better performance');
    }
  }
  
  // Check for excessive colors
  if (tokens.colors) {
    const colorCount = Object.keys(tokens.colors).length;
    if (colorCount > 100) {
      result.warnings.push(`Excessive number of color tokens (${colorCount}) may impact performance`);
      result.suggestions.push('Consider reducing the number of color tokens for better performance');
    }
  }
  
  // Update success status
  result.success = result.errors.length === 0;
  
  return result;
}

/**
 * Runs comprehensive theme validation
 * 
 * @param tokens - Token set to validate
 * @param options - Validation options
 * @returns Comprehensive validation result
 */
export function runComprehensiveThemeValidation(
  tokens: TokenSet,
  options?: ThemeGateValidationOptions
): ThemeValidationResult {
  // Run standard gate validation
  const gateResult = validateThemeInGate(tokens, options);
  
  // Run additional validations
  const contrastResult = validateThemeContrast(tokens);
  const consistencyResult = validateThemeConsistency(tokens);
  const performanceResult = validateThemePerformance(tokens);
  
  // Combine all results
  const combinedResult: ThemeValidationResult = {
    success: gateResult.success && contrastResult.success && consistencyResult.success && performanceResult.success,
    validations: gateResult.validations,
    errors: [
      ...gateResult.errors,
      ...contrastResult.errors,
      ...consistencyResult.errors,
      ...performanceResult.errors,
    ],
    warnings: [
      ...gateResult.warnings,
      ...contrastResult.warnings,
      ...consistencyResult.warnings,
      ...performanceResult.warnings,
    ],
    suggestions: [
      ...gateResult.suggestions,
      ...contrastResult.suggestions,
      ...consistencyResult.suggestions,
      ...performanceResult.suggestions,
    ],
  };
  
  return combinedResult;
}