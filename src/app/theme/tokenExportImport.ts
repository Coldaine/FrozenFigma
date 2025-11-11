/**
 * Token Export/Import Utilities
 * 
 * This module provides utilities for exporting and importing design tokens
 * in various formats, with support for validation and transformation.
 */

import { TokenSet } from '../../schema';
import { validateTokens } from './themeUtils';

// ============================================================================
// TOKEN EXPORT/IMPORT UTILITIES
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'json' | 'css' | 'sass' | 'less' | 'yaml';

/**
 * Export options
 */
export interface ExportOptions {
  /** Format to export tokens in */
  format?: ExportFormat;
  /** Whether to include comments in the export */
  includeComments?: boolean;
  /** Whether to minify the output */
  minify?: boolean;
  /** Prefix for CSS variables (default: 'ff') */
  prefix?: string;
}

/**
 * Import options
 */
export interface ImportOptions {
  /** Format of the imported tokens */
  format?: ExportFormat;
  /** Whether to validate the imported tokens */
  validate?: boolean;
}

/**
 * Exports tokens to a string in the specified format
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Exported tokens as a string
 */
export function exportTokens(tokens: TokenSet, options?: ExportOptions): string {
  const opts: Required<ExportOptions> = {
    format: options?.format || 'json',
    includeComments: options?.includeComments !== false,
    minify: !!options?.minify,
    prefix: options?.prefix || 'ff',
  };
  
  switch (opts.format) {
    case 'json':
      return exportAsJSON(tokens, opts);
    case 'css':
      return exportAsCSS(tokens, opts);
    case 'sass':
      return exportAsSass(tokens, opts);
    case 'less':
      return exportAsLess(tokens, opts);
    case 'yaml':
      return exportAsYAML(tokens, opts);
    default:
      throw new Error(`Unsupported export format: ${opts.format}`);
  }
}

/**
 * Imports tokens from a string in the specified format
 * 
 * @param data - The token data to import
 * @param options - Import options
 * @returns Imported token set
 */
export function importTokens(data: string, options?: ImportOptions): TokenSet {
  const opts: Required<ImportOptions> = {
    format: options?.format || 'json',
    validate: options?.validate !== false,
  };
  
  let tokens: TokenSet;
  
  switch (opts.format) {
    case 'json':
      tokens = importFromJSON(data);
      break;
    case 'css':
      tokens = importFromCSS(data);
      break;
    case 'sass':
      tokens = importFromSass(data);
      break;
    case 'less':
      tokens = importFromLess(data);
      break;
    case 'yaml':
      tokens = importFromYAML(data);
      break;
    default:
      throw new Error(`Unsupported import format: ${opts.format}`);
  }
  
  // Validate tokens if requested
  if (opts.validate) {
    const validationResult = validateTokens(tokens);
    if (!validationResult.success) {
      throw new Error(`Invalid tokens: ${validationResult.errors?.join(', ')}`);
    }
  }
  
  return tokens;
}

/**
 * Exports tokens as JSON
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Tokens as JSON string
 */
function exportAsJSON(tokens: TokenSet, options: Required<ExportOptions>): string {
  if (options.minify) {
    return JSON.stringify(tokens);
  }
  
  return JSON.stringify(tokens, null, 2);
}

/**
 * Exports tokens as CSS custom properties
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Tokens as CSS custom properties string
 */
function exportAsCSS(tokens: TokenSet, options: Required<ExportOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '/* Design Tokens - CSS Custom Properties */\n';
  }
  
  if (!options.minify) {
    output += ':root {\n';
  } else {
    output += ':root{';
  }
  
  // Generate CSS variables from tokens
  const cssVars = tokensToCSSVariables(tokens, options.prefix);
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
    if (options.minify) {
      output += `${key}:${value};`;
    } else {
      output += `  ${key}: ${value};`;
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
 * Exports tokens as Sass variables
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Tokens as Sass variables string
 */
function exportAsSass(tokens: TokenSet, options: Required<ExportOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '// Design Tokens - Sass Variables\n';
  }
  
  // Generate CSS variables from tokens
  const cssVars = tokensToCSSVariables(tokens, options.prefix);
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Convert CSS variable name to Sass variable name
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
 * Exports tokens as Less variables
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Tokens as Less variables string
 */
function exportAsLess(tokens: TokenSet, options: Required<ExportOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '// Design Tokens - Less Variables\n';
  }
  
  // Generate CSS variables from tokens
  const cssVars = tokensToCSSVariables(tokens, options.prefix);
  const entries = Object.entries(cssVars);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Convert CSS variable name to Less variable name
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
 * Exports tokens as YAML
 * 
 * @param tokens - The token set to export
 * @param options - Export options
 * @returns Tokens as YAML string
 */
function exportAsYAML(tokens: TokenSet, options: Required<ExportOptions>): string {
  let output = '';
  
  if (options.includeComments && !options.minify) {
    output += '# Design Tokens - YAML Format\n';
  }
  
  // Convert tokens to YAML manually (since we don't want to add a YAML dependency)
  output += convertToYAML(tokens, 0, options.minify);
  
  return output;
}

/**
 * Converts an object to YAML format
 * 
 * @param obj - Object to convert
 * @param indentLevel - Current indentation level
 * @param minify - Whether to minify the output
 * @returns Object as YAML string
 */
function convertToYAML(obj: unknown, indentLevel: number, minify: boolean): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }
  
  if (typeof obj === 'boolean' || typeof obj === 'number') {
    return obj.toString();
  }
  
  if (typeof obj === 'string') {
    // Quote strings that contain special characters
    if (/[{}[\],&*#?|<>=!%@`]/.test(obj)) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    
    let output = '';
    const nextIndent = minify ? '' : '  '.repeat(indentLevel + 1);
    
    for (let i = 0; i < obj.length; i++) {
      if (!minify) output += '\n' + nextIndent;
      output += '- ' + convertToYAML(obj[i], indentLevel + 1, minify);
    }
    
    return output;
  }
  
  if (typeof obj === 'object') {
    let output = '';
    const nextIndent = minify ? '' : '  '.repeat(indentLevel + 1);
    const keys = Object.keys(obj);
    
    if (keys.length === 0) {
      return '{}';
    }
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = (obj as Record<string, unknown>)[key];
      
      if (!minify) {
        if (i > 0) output += '\n';
        output += nextIndent;
      }
      
      output += `${key}: ${convertToYAML(value, indentLevel + 1, minify)}`;
    }
    
    return output;
  }
  
  return String(obj);
}

/**
 * Imports tokens from JSON
 * 
 * @param data - JSON string to import
 * @returns Token set
 */
function importFromJSON(data: string): TokenSet {
  return JSON.parse(data);
}

/**
 * Imports tokens from CSS custom properties
 * 
 * @param data - CSS string to import
 * @returns Token set
 */
function importFromCSS(data: string): TokenSet {
  const tokens: Partial<TokenSet> = {};
  
  // Parse CSS custom properties
  const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = cssVarRegex.exec(data)) !== null) {
    const [, varName, value] = match;
    parseCSSVariable(varName, value, tokens);
  }
  
  return tokens as TokenSet;
}

/**
 * Parses a CSS variable and adds it to the token set
 * 
 * @param varName - CSS variable name
 * @param value - CSS variable value
 * @param tokens - Token set to add to
 */
function parseCSSVariable(varName: string, value: string, tokens: Partial<TokenSet>): void {
  // Remove prefix if present
  const cleanVarName = varName.replace(/^ff-/, '');
  
  // Split by category
  const parts = cleanVarName.split('-');
  const category = parts[0];
  const tokenName = parts.slice(1).join('-');
  
  switch (category) {
    case 'color':
      if (!tokens.colors) tokens.colors = {};
      tokens.colors[tokenName] = value.trim();
      break;
    case 'spacing':
      if (!tokens.spacing) tokens.spacing = {};
      tokens.spacing[tokenName] = parseFloat(value.trim());
      break;
    case 'font':
      if (!tokens.typography) tokens.typography = { fontFamily: '', sizes: {}, weights: {}, lineHeights: {} };
      if (parts[1] === 'family') {
        tokens.typography.fontFamily = value.trim().replace(/^["']|["']$/g, '');
      } else if (parts[1] === 'size') {
        if (!tokens.typography.sizes) tokens.typography.sizes = {};
        tokens.typography.sizes[tokenName.replace('size-', '')] = parseFloat(value.trim());
      } else if (parts[1] === 'weight') {
        if (!tokens.typography.weights) tokens.typography.weights = {};
        tokens.typography.weights[tokenName.replace('weight-', '')] = parseFloat(value.trim());
      }
      break;
    case 'radius':
      if (!tokens.radius) tokens.radius = {};
      tokens.radius[tokenName] = parseFloat(value.trim());
      break;
    case 'shadow':
      if (!tokens.shadows) tokens.shadows = {};
      tokens.shadows[tokenName] = value.trim();
      break;
    case 'transition': {
      if (!tokens.transitions) tokens.transitions = {};
      const numValue = parseFloat(value.trim());
      tokens.transitions[tokenName] = isNaN(numValue) ? value.trim() : numValue;
      break;
    }
  }
}

/**
 * Imports tokens from Sass variables
 * 
 * @param data - Sass string to import
 * @returns Token set
 */
function importFromSass(data: string): TokenSet {
  const tokens: Partial<TokenSet> = {};
  
  // Parse Sass variables
  const sassVarRegex = /\$([\w_]+):\s*([^;]+);/g;
  let match;
  
  while ((match = sassVarRegex.exec(data)) !== null) {
    const [, varName, value] = match;
    // Convert Sass variable name to CSS variable name format
    const cssVarName = varName.replace(/_/g, '-');
    parseCSSVariable(cssVarName, value, tokens);
  }
  
  return tokens as TokenSet;
}

/**
 * Imports tokens from Less variables
 * 
 * @param data - Less string to import
 * @returns Token set
 */
function importFromLess(data: string): TokenSet {
  const tokens: Partial<TokenSet> = {};
  
  // Parse Less variables
  const lessVarRegex = /@([\w_]+):\s*([^;]+);/g;
  let match;
  
  while ((match = lessVarRegex.exec(data)) !== null) {
    const [, varName, value] = match;
    // Convert Less variable name to CSS variable name format
    const cssVarName = varName.replace(/_/g, '-');
    parseCSSVariable(cssVarName, value, tokens);
  }
  
  return tokens as TokenSet;
}

/**
 * Imports tokens from YAML
 * 
 * @param data - YAML string to import
 * @returns Token set
 */
function importFromYAML(data: string): TokenSet {
  // For simplicity, we'll convert YAML to JSON and then parse it
  // In a real implementation, you would use a proper YAML parser
  
  // This is a very basic YAML parser - in a real implementation, you would use a library
  const json = yamlToJSON(data);
  return JSON.parse(json);
}

/**
 * Converts YAML to JSON (very basic implementation)
 * 
 * @param yaml - YAML string to convert
 * @returns JSON string
 */
function yamlToJSON(yaml: string): string {
  // This is a very basic implementation - in a real implementation, you would use a library
  return JSON.stringify(parseYAML(yaml));
}

/**
 * Parses YAML (very basic implementation)
 * 
 * @param yaml - YAML string to parse
 * @returns Parsed object
 */
function parseYAML(yaml: string): Record<string, unknown> {
  // This is a very basic implementation - in a real implementation, you would use a library
  const lines = yaml.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
  const result: Record<string, unknown> = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes(':')) {
      const [key, value] = trimmedLine.split(':').map(part => part.trim());
      if (value === '{}' || value === '[]') {
        result[key] = value === '{}' ? {} : [];
      } else if (value.startsWith('"') && value.endsWith('"')) {
        result[key] = value.slice(1, -1);
      } else if (!isNaN(parseFloat(value))) {
        result[key] = parseFloat(value);
      } else if (value === 'true' || value === 'false') {
        result[key] = value === 'true';
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Converts a token set to CSS custom properties
 * 
 * @param tokens - Token set to convert
 * @param prefix - CSS variable prefix
 * @returns CSS custom properties
 */
function tokensToCSSVariables(tokens: TokenSet, prefix: string): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Convert colors
  if (tokens.colors) {
    for (const [key, value] of Object.entries(tokens.colors)) {
      cssVars[`--${prefix}-color-${key}`] = value as string;
    }
  }
  
  // Convert spacing
  if (tokens.spacing) {
    for (const [key, value] of Object.entries(tokens.spacing)) {
      cssVars[`--${prefix}-spacing-${key}`] = `${value as number}px`;
    }
  }
  
  // Convert typography
  if (tokens.typography) {
    if (tokens.typography.fontFamily) {
      cssVars[`--${prefix}-font-family`] = tokens.typography.fontFamily;
    }
    
    if (tokens.typography.sizes) {
      for (const [key, value] of Object.entries(tokens.typography.sizes)) {
        cssVars[`--${prefix}-font-size-${key}`] = `${value as number}px`;
      }
    }
    
    if (tokens.typography.weights) {
      for (const [key, value] of Object.entries(tokens.typography.weights)) {
        cssVars[`--${prefix}-font-weight-${key}`] = `${value as number}`;
      }
    }
    
    if (tokens.typography.lineHeights) {
      for (const [key, value] of Object.entries(tokens.typography.lineHeights)) {
        cssVars[`--${prefix}-line-height-${key}`] = `${value as number}`;
      }
    }
  }
  
  // Convert radius
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      cssVars[`--${prefix}-radius-${key}`] = `${value as number}px`;
    }
  }
  
  // Convert shadows
  if (tokens.shadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      cssVars[`--${prefix}-shadow-${key}`] = value as string;
    }
  }
  
  // Convert transitions
  if (tokens.transitions) {
    for (const [key, value] of Object.entries(tokens.transitions)) {
      cssVars[`--${prefix}-transition-${key}`] = typeof value === 'number' ? `${value}ms` : value as string;
    }
  }
  
  return cssVars;
}

/**
 * Saves tokens to a file (browser environment)
 * 
 * @param tokens - Token set to save
 * @param filename - Filename to save as
 * @param format - Format to save in
 */
export function saveTokensToFile(tokens: TokenSet, filename: string, format: ExportFormat = 'json'): void {
  if (typeof window === 'undefined' || !window.Blob || !window.URL) {
    throw new Error('saveTokensToFile can only be used in a browser environment');
  }
  
  const data = exportTokens(tokens, { format });
  const mimeType = getMimeType(format);
  
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  window.URL.revokeObjectURL(url);
}

/**
 * Gets MIME type for a format
 * 
 * @param format - Export format
 * @returns MIME type
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'css':
      return 'text/css';
    case 'sass':
      return 'text/x-sass';
    case 'less':
      return 'text/x-less';
    case 'yaml':
      return 'text/yaml';
    default:
      return 'text/plain';
  }
}

/**
 * Loads tokens from a file (browser environment)
 * 
 * @param file - File to load from
 * @param format - Format of the file
 * @returns Promise that resolves to the loaded token set
 */
export function loadTokensFromFile(file: File, format: ExportFormat = 'json'): Promise<TokenSet> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.FileReader) {
      reject(new Error('loadTokensFromFile can only be used in a browser environment'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const tokens = importTokens(data, { format });
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}