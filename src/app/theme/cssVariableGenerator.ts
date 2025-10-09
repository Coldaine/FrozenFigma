/**
 * CSS Variable Generator
 * 
 * This module provides utilities for generating CSS custom properties (variables)
 * from token sets, with support for different output formats and validation.
 */

import { TokenSet, EnhancedTokenSet } from '../../schema';
import { tokensToCSSVariables, enhancedTokensToCSSVariables } from './themeUtils';

// ============================================================================
// CSS VARIABLE GENERATION UTILITIES
// ============================================================================

/**
 * CSS output format options
 */
export type CSSOutputFormat = 'css' | 'sass' | 'less' | 'stylus';

/**
 * CSS variable generation options
 */
export interface CSSVariableOptions {
  /** CSS variable prefix (default: 'ff') */
  prefix?: string;
  /** Whether to include comments (default: true) */
  includeComments?: boolean;
  /** Output format (default: 'css') */
  format?: CSSOutputFormat;
  /** Whether to minify output (default: false) */
 minify?: boolean;
  /** Whether to include semantic comments (default: true) */
  includeSemanticComments?: boolean;
}

/**
 * Generates CSS custom properties from a token set
 * 
 * @param tokens - The token set to convert
 * @param options - Generation options
 * @returns CSS custom properties as a string
 */
export function generateCSSVariables(tokens: TokenSet | EnhancedTokenSet, options?: CSSVariableOptions): string {
  const opts: Required<CSSVariableOptions> = {
    prefix: options?.prefix || 'ff',
    includeComments: options?.includeComments !== false,
    format: options?.format || 'css',
    minify: !!options?.minify,
    includeSemanticComments: options?.includeSemanticComments !== false,
  };
  
  // Determine if this is an enhanced token set
 const isEnhanced = 'colors' in tokens && typeof (tokens as EnhancedTokenSet).colors === 'object' && 
                     'primary' in (tokens as EnhancedTokenSet).colors;
  
  // Convert tokens to CSS variables
  const cssVars = isEnhanced 
    ? enhancedTokensToCSSVariables(tokens as EnhancedTokenSet, opts.prefix)
    : tokensToCSSVariables(tokens as TokenSet, opts.prefix);
  
  // Generate the CSS output based on format
  return generateCSSOutput(cssVars, opts);
}

/**
 * Generates CSS output from CSS variables based on format
 * 
 * @param cssVars - The CSS variables to output
 * @param options - Generation options
 * @returns Formatted CSS output
 */
function generateCSSOutput(cssVars: Record<string, string>, options: Required<CSSVariableOptions>): string {
  switch (options.format) {
    case 'sass':
      return generateSassOutput(cssVars, options);
    case 'less':
      return generateLessOutput(cssVars, options);
    case 'stylus':
      return generateStylusOutput(cssVars, options);
    case 'css':
    default:
      return generateCSSOutputFormat(cssVars, options);
 }
}

/**
 * Generates standard CSS output
 * 
 * @param cssVars - The CSS variables to output
 * @param options - Generation options
 * @returns CSS output string
 */
function generateCSSOutputFormat(cssVars: Record<string, string>, options: Required<CSSVariableOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '/* Design Tokens - Generated CSS Variables */\n';
  }
  
  if (!options.minify) {
    output += ':root {\n';
  } else {
    output += ':root{';
  }
  
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
    if (options.minify) {
      output += `${key}:${value};`;
    } else {
      output += ` ${key}: ${value};`;
      if (i < entries.length - 1) output += '\n';
    }
  }
  
  if (options.minify) {
    output += '}';
  } else {
    output += '\n}';
  }
  
  return output;
}

/**
 * Generates SASS output
 * 
 * @param cssVars - The CSS variables to output
 * @param options - Generation options
 * @returns SASS output string
 */
function generateSassOutput(cssVars: Record<string, string>, options: Required<CSSVariableOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '// Design Tokens - Generated SASS Variables\n';
  }
  
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Convert CSS variable name to SASS variable name
    const sassVarName = `$${key.replace(/^--/, '').replace(/-/g, '_')}`;
    
    if (options.minify) {
      output += `${sassVarName}:${value};`;
    } else {
      output += `${sassVarName}: ${value};`;
      if (i < entries.length - 1) output += '\n';
    }
  }
  
  return output;
}

/**
 * Generates LESS output
 * 
 * @param cssVars - The CSS variables to output
 * @param options - Generation options
 * @returns LESS output string
 */
function generateLessOutput(cssVars: Record<string, string>, options: Required<CSSVariableOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '// Design Tokens - Generated LESS Variables\n';
  }
  
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Convert CSS variable name to LESS variable name
    const lessVarName = `@${key.replace(/^--/, '').replace(/-/g, '_')}`;
    
    if (options.minify) {
      output += `${lessVarName}:${value};`;
    } else {
      output += `${lessVarName}: ${value};`;
      if (i < entries.length - 1) output += '\n';
    }
  }
  
  return output;
}

/**
 * Generates Stylus output
 * 
 * @param cssVars - The CSS variables to output
 * @param options - Generation options
 * @returns Stylus output string
 */
function generateStylusOutput(cssVars: Record<string, string>, options: Required<CSSVariableOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '// Design Tokens - Generated Stylus Variables\n';
  }
  
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Convert CSS variable name to Stylus variable name
    const stylusVarName = `${key.replace(/^--/, '').replace(/-/g, '_')}`;
    
    if (options.minify) {
      output += `${stylusVarName} = ${value};`;
    } else {
      output += `${stylusVarName} = ${value};`;
      if (i < entries.length - 1) output += '\n';
    }
  }
  
  return output;
}

/**
 * Generates CSS variables grouped by category
 * 
 * @param tokens - The token set to convert
 * @param options - Generation options
 * @returns CSS custom properties grouped by category
 */
export function generateCategorizedCSSVariables(tokens: TokenSet | EnhancedTokenSet, options?: CSSVariableOptions): string {
  const opts: Required<CSSVariableOptions> = {
    prefix: options?.prefix || 'ff',
    includeComments: options?.includeComments !== false,
    format: options?.format || 'css',
    minify: !!options?.minify,
    includeSemanticComments: options?.includeSemanticComments !== false,
  };
  
  let output = '';
  
  if (opts.includeComments && !opts.minify) {
    output += '/* Design Tokens - Categorized CSS Variables */\n\n';
  }
  
  // Determine if this is an enhanced token set
  const isEnhanced = 'colors' in tokens && typeof (tokens as EnhancedTokenSet).colors === 'object' && 
                     'primary' in (tokens as EnhancedTokenSet).colors;
  
  if (isEnhanced) {
    const enhancedTokens = tokens as EnhancedTokenSet;
    
    // Generate colors section
    if (enhancedTokens.colors && opts.includeSemanticComments && !opts.minify) {
      output += '/* Colors */\n';
    }
    output += generateCategoryCSSVariables('colors', enhancedTokens.colors || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate spacing section
    if (enhancedTokens.spacing && opts.includeSemanticComments && !opts.minify) {
      output += '/* Spacing */\n';
    }
    output += generateCategoryCSSVariables('spacing', enhancedTokens.spacing || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate typography section
    if (enhancedTokens.typography && opts.includeSemanticComments && !opts.minify) {
      output += '/* Typography */\n';
    }
    output += generateCategoryCSSVariables('typography', enhancedTokens.typography || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate radius section
    if (enhancedTokens.radius && opts.includeSemanticComments && !opts.minify) {
      output += '/* Radius */\n';
    }
    output += generateCategoryCSSVariables('radius', enhancedTokens.radius || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate shadows section
    if (enhancedTokens.shadows && opts.includeSemanticComments && !opts.minify) {
      output += '/* Shadows */\n';
    }
    output += generateCategoryCSSVariables('shadows', enhancedTokens.shadows || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate transitions section
    if (enhancedTokens.transitions && opts.includeSemanticComments && !opts.minify) {
      output += '/* Transitions */\n';
    }
    output += generateCategoryCSSVariables('transitions', enhancedTokens.transitions || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate additional sections
    if (enhancedTokens.sizes && opts.includeSemanticComments && !opts.minify) {
      output += '/* Sizes */\n';
    }
    output += generateCategoryCSSVariables('sizes', enhancedTokens.sizes || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    if (enhancedTokens.zIndices && opts.includeSemanticComments && !opts.minify) {
      output += '/* Z-Indices */\n';
    }
    output += generateCategoryCSSVariables('zIndices', enhancedTokens.zIndices || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    if (enhancedTokens.breakpoints && opts.includeSemanticComments && !opts.minify) {
      output += '/* Breakpoints */\n';
    }
    output += generateCategoryCSSVariables('breakpoints', enhancedTokens.breakpoints || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    if (enhancedTokens.opacities && opts.includeSemanticComments && !opts.minify) {
      output += '/* Opacities */\n';
    }
    output += generateCategoryCSSVariables('opacities', enhancedTokens.opacities || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    if (enhancedTokens.motion && opts.includeSemanticComments && !opts.minify) {
      output += '/* Motion */\n';
    }
    output += generateCategoryCSSVariables('motion', enhancedTokens.motion || {}, opts.prefix, opts);
  } else {
    // For basic tokens, group by available categories
    const basicTokens = tokens as TokenSet;
    
    // Generate colors section
    if (basicTokens.colors && opts.includeSemanticComments && !opts.minify) {
      output += '/* Colors */\n';
    }
    output += generateCategoryCSSVariables('colors', basicTokens.colors || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate spacing section
    if (basicTokens.spacing && opts.includeSemanticComments && !opts.minify) {
      output += '/* Spacing */\n';
    }
    output += generateCategoryCSSVariables('spacing', basicTokens.spacing || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate typography section
    if (basicTokens.typography && opts.includeSemanticComments && !opts.minify) {
      output += '/* Typography */\n';
    }
    output += generateCategoryCSSVariables('typography', basicTokens.typography || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate radius section
    if (basicTokens.radius && opts.includeSemanticComments && !opts.minify) {
      output += '/* Radius */\n';
    }
    output += generateCategoryCSSVariables('radius', basicTokens.radius || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate shadows section
    if (basicTokens.shadows && opts.includeSemanticComments && !opts.minify) {
      output += '/* Shadows */\n';
    }
    output += generateCategoryCSSVariables('shadows', basicTokens.shadows || {}, opts.prefix, opts);
    output += opts.minify ? '' : '\n\n';
    
    // Generate transitions section
    if (basicTokens.transitions && opts.includeSemanticComments && !opts.minify) {
      output += '/* Transitions */\n';
    }
    output += generateCategoryCSSVariables('transitions', basicTokens.transitions || {}, opts.prefix, opts);
  }
  
  return output.trim();
}

/**
 * Generates CSS variables for a specific category
 * 
 * @param category - The token category name
 * @param tokens - The tokens in the category
 * @param prefix - The CSS variable prefix
 * @param options - Generation options
 * @returns CSS variables for the category
 */
function generateCategoryCSSVariables(
  category: string,
  tokens: Record<string, any>,
  prefix: string,
  options: Required<CSSVariableOptions>
): string {
 let output = '';
  
  if (!options.minify) {
    output += ':root {\n';
  } else {
    output += ':root{';
  }
  
  const entries = Object.entries(tokens);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const cssVarName = `--${prefix}-${category}-${key}`;
    
    if (options.minify) {
      output += `${cssVarName}:${value};`;
    } else {
      output += ` ${cssVarName}: ${value};`;
      if (i < entries.length - 1) output += '\n';
    }
  }
  
  if (options.minify) {
    output += '}';
  } else {
    output += '\n}';
  }
  
  return output;
}

/**
 * Validates CSS variable names for a token set
 * 
 * @param tokens - The token set to validate
 * @param prefix - The CSS variable prefix
 * @returns Validation result with success status and errors
 */
export function validateCSSVariableNames(tokens: TokenSet | EnhancedTokenSet, prefix: string = 'ff'): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Determine if this is an enhanced token set
 const isEnhanced = 'colors' in tokens && typeof (tokens as EnhancedTokenSet).colors === 'object' && 
                     'primary' in (tokens as EnhancedTokenSet).colors;
  
  // Validate all token keys for valid CSS variable naming
  if (isEnhanced) {
    const enhancedTokens = tokens as EnhancedTokenSet;
    
    validateCategoryNames('colors', enhancedTokens.colors || {}, prefix, errors);
    validateCategoryNames('spacing', enhancedTokens.spacing || {}, prefix, errors);
    validateCategoryNames('typography', enhancedTokens.typography || {}, prefix, errors);
    validateCategoryNames('radius', enhancedTokens.radius || {}, prefix, errors);
    validateCategoryNames('shadows', enhancedTokens.shadows || {}, prefix, errors);
    validateCategoryNames('transitions', enhancedTokens.transitions || {}, prefix, errors);
    validateCategoryNames('sizes', enhancedTokens.sizes || {}, prefix, errors);
    validateCategoryNames('zIndices', enhancedTokens.zIndices || {}, prefix, errors);
    validateCategoryNames('breakpoints', enhancedTokens.breakpoints || {}, prefix, errors);
    validateCategoryNames('opacities', enhancedTokens.opacities || {}, prefix, errors);
    validateCategoryNames('motion', enhancedTokens.motion || {}, prefix, errors);
  } else {
    const basicTokens = tokens as TokenSet;
    
    validateCategoryNames('colors', basicTokens.colors || {}, prefix, errors);
    validateCategoryNames('spacing', basicTokens.spacing || {}, prefix, errors);
    validateCategoryNames('typography', basicTokens.typography || {}, prefix, errors);
    validateCategoryNames('radius', basicTokens.radius || {}, prefix, errors);
    validateCategoryNames('shadows', basicTokens.shadows || {}, prefix, errors);
    validateCategoryNames('transitions', basicTokens.transitions || {}, prefix, errors);
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates names for a specific category
 * 
 * @param category - The token category name
 * @param tokens - The tokens in the category
 * @param prefix - The CSS variable prefix
 * @param errors - Array to collect errors
 */
function validateCategoryNames(
  category: string,
  tokens: Record<string, any>,
  prefix: string,
  errors: string[]
): void {
  for (const [key] of Object.entries(tokens)) {
    // Check if the key is a valid CSS identifier
    if (!isValidCSSIdentifier(key)) {
      errors.push(`Invalid token key "${key}" in category "${category}" - must be a valid CSS identifier`);
    }
    
    // Check if the full CSS variable name would be valid
    const fullVarName = `--${prefix}-${category}-${key}`;
    if (!isValidCSSVariableName(fullVarName)) {
      errors.push(`Invalid CSS variable name "${fullVarName}" - may contain invalid characters`);
    }
 }
}

/**
 * Checks if a string is a valid CSS identifier
 * 
 * @param identifier - The identifier to check
 * @returns True if valid, false otherwise
 */
function isValidCSSIdentifier(identifier: string): boolean {
  // CSS identifiers must start with a letter, underscore, or hyphen
  // and can contain letters, digits, hyphens, and underscores
  const cssIdentifierRegex = /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/;
  return cssIdentifierRegex.test(identifier);
}

/**
 * Checks if a string is a valid CSS variable name
 * 
 * @param variableName - The variable name to check
 * @returns True if valid, false otherwise
 */
function isValidCSSVariableName(variableName: string): boolean {
  // CSS variables start with '--' followed by a valid identifier
  const cssVariableRegex = /^--[a-zA-Z_][a-zA-Z0-9_-]*$/;
  return cssVariableRegex.test(variableName);
}

/**
 * Generates CSS variables with custom formatter
 * 
 * @param tokens - The token set to convert
 * @param formatter - Custom formatter function
 * @returns Formatted CSS variables
 */
export function generateCSSVariablesWithFormatter(
  tokens: TokenSet | EnhancedTokenSet,
  formatter: (cssVars: Record<string, string>) => string
): string {
  // Determine if this is an enhanced token set
 const isEnhanced = 'colors' in tokens && typeof (tokens as EnhancedTokenSet).colors === 'object' && 
                     'primary' in (tokens as EnhancedTokenSet).colors;
  
  // Convert tokens to CSS variables
  const cssVars = isEnhanced 
    ? enhancedTokensToCSSVariables(tokens as EnhancedTokenSet, 'ff')
    : tokensToCSSVariables(tokens as TokenSet, 'ff');
  
  // Apply custom formatter
  return formatter(cssVars);
}