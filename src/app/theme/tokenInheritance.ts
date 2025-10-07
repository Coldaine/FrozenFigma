/**
 * Token Inheritance and Override Utilities
 * 
 * This module provides utilities for handling token inheritance,
 * merging tokens with inheritance rules, and applying overrides.
 */

import { TokenSet } from '../../schema';

// ============================================================================
// TOKEN INHERITANCE UTILITIES
// ============================================================================

/**
 * Merges multiple token sets with inheritance rules.
 * Later token sets override earlier ones for the same token.
 * 
 * @param baseTokens - Base token set to inherit from
 * @param overrideTokens - Token sets to apply on top of base (in order)
 * @returns Merged token set with inheritance applied
 */
export function mergeTokenSets(baseTokens: TokenSet, ...overrideTokens: Partial<TokenSet>[]): TokenSet {
  // Start with a deep copy of the base tokens
  const result: TokenSet = JSON.parse(JSON.stringify(baseTokens));
  
  // Apply each override token set in order
  for (const override of overrideTokens) {
    if (!override) continue;
    
    // Merge colors
    if (override.colors) {
      result.colors = { ...result.colors, ...override.colors };
    }
    
    // Merge spacing
    if (override.spacing) {
      result.spacing = { ...result.spacing, ...override.spacing };
    }
    
    // Merge typography
    if (override.typography) {
      if (!result.typography) {
        result.typography = { fontFamily: 'system-ui', sizes: {}, weights: {}, lineHeights: {} };
      }
      
      if (override.typography?.fontFamily) {
        result.typography.fontFamily = override.typography.fontFamily;
      }
      
      if (override.typography?.sizes) {
        result.typography.sizes = { ...result.typography.sizes, ...override.typography.sizes };
      }
      
      if (override.typography?.weights) {
        result.typography.weights = { ...result.typography.weights, ...override.typography.weights };
      }
      
      if (override.typography?.lineHeights) {
        result.typography.lineHeights = { ...result.typography.lineHeights, ...override.typography.lineHeights };
      }
    }
    
    // Merge radius
    if (override.radius) {
      result.radius = { ...result.radius, ...override.radius };
    }
    
    // Merge shadows
    if (override.shadows) {
      result.shadows = { ...result.shadows, ...override.shadows };
    }
    
    // Merge transitions
    if (override.transitions) {
      result.transitions = { ...result.transitions, ...override.transitions };
    }
 }
  
  return result;
}

/**
 * Creates a token set that inherits from a parent with specific overrides
 * 
 * @param parentTokens - The parent token set to inherit from
 * @param overrides - Specific tokens to override in the child
 * @returns A new token set with inheritance and overrides applied
 */
export function createInheritedTokenSet(parentTokens: TokenSet, overrides: Partial<TokenSet> = {}): TokenSet {
  return mergeTokenSets(parentTokens, overrides);
}

/**
 * Applies token overrides to a base token set
 * 
 * @param baseTokens - Base token set
 * @param overrides - Override values to apply
 * @returns New token set with overrides applied
 */
export function applyTokenOverrides(baseTokens: TokenSet, overrides: Partial<TokenSet>): TokenSet {
  return mergeTokenSets(baseTokens, overrides);
}

/**
 * Resolves a token value with fallbacks
 * 
 * @param tokens - The token set to resolve from
 * @param tokenPath - Path to the token (e.g. 'colors.primary', 'spacing.md')
 * @param fallback - Fallback value if token is not found
 * @returns Resolved token value or fallback
 */
export function resolveTokenValue(tokens: TokenSet, tokenPath: string, fallback?: any) {
  // Split the path by dots to navigate the object
  const pathParts = tokenPath.split('.');
  
  let current: any = tokens;
  
  for (const part of pathParts) {
    if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return fallback;
    }
  }
  
  return current !== undefined ? current : fallback;
}

/**
 * Creates a token resolver function for a specific token set
 * 
 * @param tokens - The token set to create resolver for
 * @returns Function that can resolve tokens from this set
 */
export function createTokenResolver(tokens: TokenSet) {
  return (tokenPath: string, fallback?: any) => resolveTokenValue(tokens, tokenPath, fallback);
}

/**
 * Validates that a token set follows inheritance rules
 * 
 * @param tokens - The token set to validate
 * @param parentTokens - Optional parent token set to validate against
 * @returns Validation result with success status and errors
 */
export function validateTokenInheritance(tokens: TokenSet, parentTokens?: TokenSet): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // If parent tokens are provided, check for consistency
  if (parentTokens) {
    // Validate that required token categories exist
    if (!tokens.colors && parentTokens.colors) {
      errors.push('Token set must define colors when parent has colors');
    }
    
    if (!tokens.spacing && parentTokens.spacing) {
      errors.push('Token set must define spacing when parent has spacing');
    }
    
    if (!tokens.typography && parentTokens.typography) {
      errors.push('Token set must define typography when parent has typography');
    }
    
    if (!tokens.radius && parentTokens.radius) {
      errors.push('Token set must define radius when parent has radius');
    }
  }
  
  // Validate that tokens have valid values
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      if (typeof value !== 'string') {
        errors.push(`Color token "${key}" must be a string, got ${typeof value}`);
      }
    }
  }
  
  if (tokens.spacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      if (typeof value !== 'number') {
        errors.push(`Spacing token "${key}" must be a number, got ${typeof value}`);
      } else if (value < 0) {
        errors.push(`Spacing token "${key}" must be non-negative, got ${value}`);
      }
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Creates a derived token set based on semantic relationships
 * 
 * @param baseTokens - The base token set to derive from
 * @returns A new token set with derived values
 */
export function deriveTokens(baseTokens: TokenSet): TokenSet {
  const derivedTokens = JSON.parse(JSON.stringify(baseTokens)) as TokenSet;
  
  // Derive additional color variants if not present
 if (derivedTokens.colors) {
    // Derive primary variants if not present
    if (derivedTokens.colors.primary && !derivedTokens.colors['primary-50']) {
      derivedTokens.colors['primary-500'] = derivedTokens.colors.primary;
    }
    
    // Derive text colors if not present
    if (derivedTokens.colors.primary && !derivedTokens.colors['text-primary']) {
      derivedTokens.colors['text-primary'] = derivedTokens.colors.primary;
    }
    
    // Derive background colors if not present
    if (!derivedTokens.colors['bg-surface'] && derivedTokens.colors['bg-base']) {
      derivedTokens.colors['bg-surface'] = derivedTokens.colors['bg-base'];
    }
  }
  
  // Derive spacing relationships
  if (derivedTokens.spacing) {
    // Ensure common spacing tokens exist
    if (!derivedTokens.spacing.xs) derivedTokens.spacing.xs = derivedTokens.spacing['4'] || 8;
    if (!derivedTokens.spacing.sm) derivedTokens.spacing.sm = derivedTokens.spacing['8'] || 12;
    if (!derivedTokens.spacing.md) derivedTokens.spacing.md = derivedTokens.spacing['16'] || 16;
    if (!derivedTokens.spacing.lg) derivedTokens.spacing.lg = derivedTokens.spacing['24'] || 24;
    if (!derivedTokens.spacing.xl) derivedTokens.spacing.xl = derivedTokens.spacing['32'] || 32;
  }
  
  // Derive typography relationships
 if (derivedTokens.typography) {
    if (!derivedTokens.typography.sizes) derivedTokens.typography.sizes = {};
    
    // Ensure common typography tokens exist
    if (!derivedTokens.typography.sizes.base) derivedTokens.typography.sizes.base = 16;
    if (!derivedTokens.typography.sizes.sm) derivedTokens.typography.sizes.sm = 14;
    if (!derivedTokens.typography.sizes.lg) derivedTokens.typography.sizes.lg = 18;
    
    if (!derivedTokens.typography.weights) derivedTokens.typography.weights = {};
    if (!derivedTokens.typography.weights.normal) derivedTokens.typography.weights.normal = 400;
    if (!derivedTokens.typography.weights.medium) derivedTokens.typography.weights.medium = 500;
    if (!derivedTokens.typography.weights.bold) derivedTokens.typography.weights.bold = 700;
  }
  
  // Derive radius relationships
  if (derivedTokens.radius) {
    // Ensure common radius tokens exist
    if (!derivedTokens.radius.sm) derivedTokens.radius.sm = derivedTokens.radius['4'] || 4;
    if (!derivedTokens.radius.md) derivedTokens.radius.md = derivedTokens.radius['6'] || 6;
    if (!derivedTokens.radius.lg) derivedTokens.radius.lg = derivedTokens.radius['8'] || 8;
  }
  
  return derivedTokens;
}

/**
 * Applies a theme variant to a base token set
 * 
 * @param baseTokens - The base token set
 * @param variant - The variant to apply (e.g., 'compact', 'spacious', 'high-contrast')
 * @returns A new token set with the variant applied
 */
export function applyThemeVariant(baseTokens: TokenSet, variant: 'compact' | 'spacious' | 'high-contrast' | 'reduced-motion' | string): TokenSet {
  const variantOverrides: Partial<TokenSet> = {};
  
  switch (variant) {
    case 'compact':
      // Reduce spacing for compact layout
      variantOverrides.spacing = {
        'xs': 4,
        'sm': 6,
        'md': 8,
        'lg': 12,
        'xl': 16,
        'component-gap': 8,
        'section-gap': 16,
        'button-padding': 8,
        'input-padding': 8,
        'card-padding': 12,
        'modal-padding': 16,
      };
      
      // Adjust typography for compact layout
      if (baseTokens.typography?.sizes) {
        variantOverrides.typography = {
          ...baseTokens.typography, // Preserve existing typography properties
          sizes: {
            ...baseTokens.typography.sizes,
            'xs': 11,
            'sm': 12,
            'base': 14,
            'lg': 16,
            'xl': 18,
          }
        };
      }
      break;
      
    case 'spacious':
      // Increase spacing for spacious layout
      variantOverrides.spacing = {
        'xs': 12,
        'sm': 16,
        'md': 24,
        'lg': 32,
        'xl': 48,
        'component-gap': 32,
        'section-gap': 64,
        'button-padding': 20,
        'input-padding': 20,
        'card-padding': 24,
        'modal-padding': 36,
      };
      
      // Adjust typography for spacious layout
      if (baseTokens.typography?.sizes) {
        variantOverrides.typography = {
          ...baseTokens.typography, // Preserve existing typography properties
          sizes: {
            ...baseTokens.typography.sizes,
            'base': 18,
            'lg': 20,
            'xl': 24,
          }
        };
      }
      break;
      
    case 'high-contrast':
      // Enhance contrast for accessibility
      variantOverrides.colors = {
        'text-primary': '#000000',
        'text-secondary': '#000000',
        'bg-base': '#ffffff',
        'bg-surface': '#ffffff',
        'border-base': '#0000',
        'border-accent': '#000000',
      };
      
      // Increase border widths for visibility
      variantOverrides.spacing = {
        ...variantOverrides.spacing,
        '1': 2,
        '2': 4,
      };
      break;
      
    case 'reduced-motion':
      // Minimize animations for reduced motion
      variantOverrides.transitions = {
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
      };
      break;
  }
  
  return mergeTokenSets(baseTokens, variantOverrides);
}