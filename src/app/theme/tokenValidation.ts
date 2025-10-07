/**
 * Token Validation for UI Components
 * 
 * This module provides utilities for validating design tokens in the context
 * of UI components, ensuring that tokens are appropriate for their intended use.
 */

import { TokenSet } from '../../schema';
import { validateTokens as generalValidateTokens } from './themeUtils';

// ============================================================================
// TOKEN VALIDATION FOR UI COMPONENTS
// ============================================================================

/**
 * Validation result with detailed information
 */
export interface TokenValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

/**
 * Validates tokens for a specific component type
 * 
 * @param tokens - The token set to validate
 * @param componentType - The component type to validate for
 * @returns Validation result with errors and warnings
 */
export function validateTokensForComponent(
  tokens: TokenSet,
  componentType: string
): TokenValidationResult {
  // First run general token validation
 const generalValidation = convertGeneralValidationResult(generalValidateTokens(tokens));
  
  const result: TokenValidationResult = {
    success: generalValidation.success,
    errors: [...generalValidation.errors],
    warnings: [...generalValidation.warnings],
    suggestions: generalValidation.suggestions ? [...generalValidation.suggestions] : [],
  };
  
  // Run component-specific validation
 switch (componentType) {
    case 'button':
      result.success = result.success && validateButtonTokens(tokens, result);
      break;
    case 'input':
      result.success = result.success && validateInputTokens(tokens, result);
      break;
    case 'card':
      result.success = result.success && validateCardTokens(tokens, result);
      break;
    case 'modal':
      result.success = result.success && validateModalTokens(tokens, result);
      break;
    case 'tooltip':
      result.success = result.success && validateTooltipTokens(tokens, result);
      break;
    default:
      // For other components, run general validation
      result.success = result.success && validateGeneralComponentTokens(tokens, result);
      break;
 }
  
  return result;
}

/**
 * Converts the general validation result to the TokenValidationResult format
 * 
 * @param generalResult - The result from the general validateTokens function
 * @returns TokenValidationResult with warnings and suggestions
 */
function convertGeneralValidationResult(
  generalResult: { success: boolean; errors?: string[] }
): TokenValidationResult {
  return {
    success: generalResult.success,
    errors: generalResult.errors || [],
    warnings: [],
    suggestions: [],
  };
}

/**
 * Validates tokens for button components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateButtonTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for required button tokens
 if (!tokens.colors?.primary) {
    result.errors.push('Button components require a primary color token');
    success = false;
  }
  
  if (!tokens.colors?.['text-inverse']) {
    result.errors.push('Button components require a text-inverse color token for text on primary background');
    success = false;
 }
  
  if (!tokens.spacing?.['button-padding']) {
    result.warnings.push('Button components work best with a button-padding token');
    result.suggestions?.push('Add a button-padding token to the spacing category');
  }
  
  if (!tokens.radius?.['button-radius']) {
    result.warnings.push('Button components work best with a button-radius token');
    result.suggestions?.push('Add a button-radius token to the radius category');
  }
  
  if (!tokens.transitions?.['button-transition']) {
    result.warnings.push('Button components work best with a button-transition token');
    result.suggestions?.push('Add a button-transition token to the transitions category');
  }
  
  // Check for appropriate color contrast
 if (tokens.colors?.primary && tokens.colors?.['text-inverse']) {
    // In a real implementation, we would check the actual contrast ratio
    // For now, we'll just add a note about contrast importance
    result.warnings.push('Ensure primary color and text-inverse have sufficient contrast for accessibility');
  }
  
  return success;
}

/**
 * Validates tokens for input components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateInputTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for required input tokens
  if (!tokens.colors?.['bg-surface']) {
    result.errors.push('Input components require a bg-surface color token');
    success = false;
  }
  
  if (!tokens.colors?.['text-primary']) {
    result.errors.push('Input components require a text-primary color token');
    success = false;
  }
  
  if (!tokens.colors?.['border-base']) {
    result.errors.push('Input components require a border-base color token');
    success = false;
  }
  
  if (!tokens.spacing?.['input-padding']) {
    result.warnings.push('Input components work best with an input-padding token');
    result.suggestions?.push('Add an input-padding token to the spacing category');
  }
  
  if (!tokens.radius?.['input-radius']) {
    result.warnings.push('Input components work best with an input-radius token');
    result.suggestions?.push('Add an input-radius token to the radius category');
  }
  
  if (!tokens.transitions?.['input-transition']) {
    result.warnings.push('Input components work best with an input-transition token');
    result.suggestions?.push('Add an input-transition token to the transitions category');
  }
  
  return success;
}

/**
 * Validates tokens for card components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateCardTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for required card tokens
  if (!tokens.colors?.['bg-surface']) {
    result.errors.push('Card components require a bg-surface color token');
    success = false;
  }
  
 if (!tokens.colors?.['text-primary']) {
    result.errors.push('Card components require a text-primary color token');
    success = false;
  }
  
  if (!tokens.spacing?.['card-padding']) {
    result.warnings.push('Card components work best with a card-padding token');
    result.suggestions?.push('Add a card-padding token to the spacing category');
  }
  
  if (!tokens.radius?.['card-radius']) {
    result.warnings.push('Card components work best with a card-radius token');
    result.suggestions?.push('Add a card-radius token to the radius category');
  }
  
  if (!tokens.shadows?.['card-shadow']) {
    result.warnings.push('Card components work best with a card-shadow token');
    result.suggestions?.push('Add a card-shadow token to the shadows category');
  }
  
  return success;
}

/**
 * Validates tokens for modal components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateModalTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for required modal tokens
  if (!tokens.colors?.['bg-elevated']) {
    result.errors.push('Modal components require a bg-elevated color token');
    success = false;
  }
  
  if (!tokens.colors?.['text-primary']) {
    result.errors.push('Modal components require a text-primary color token');
    success = false;
  }
  
 if (!tokens.colors?.['bg-overlay']) {
    result.errors.push('Modal components require a bg-overlay color token for the backdrop');
    success = false;
  }
  
  if (!tokens.spacing?.['modal-padding']) {
    result.warnings.push('Modal components work best with a modal-padding token');
    result.suggestions?.push('Add a modal-padding token to the spacing category');
  }
  
  if (!tokens.radius?.['modal-radius']) {
    result.warnings.push('Modal components work best with a modal-radius token');
    result.suggestions?.push('Add a modal-radius token to the radius category');
  }
  
  if (!tokens.shadows?.['modal-shadow']) {
    result.warnings.push('Modal components work best with a modal-shadow token');
    result.suggestions?.push('Add a modal-shadow token to the shadows category');
  }
  
  if (!tokens.transitions?.['modal-transition']) {
    result.warnings.push('Modal components work best with a modal-transition token');
    result.suggestions?.push('Add a modal-transition token to the transitions category');
  }
  
  return success;
}

/**
 * Validates tokens for tooltip components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateTooltipTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for required tooltip tokens
  if (!tokens.colors?.['bg-elevated']) {
    result.errors.push('Tooltip components require a bg-elevated color token');
    success = false;
  }
  
  if (!tokens.colors?.['text-inverse']) {
    result.errors.push('Tooltip components require a text-inverse color token');
    success = false;
  }
  
  if (!tokens.radius?.sm) {
    result.warnings.push('Tooltip components work best with a small radius token');
    result.suggestions?.push('Add an sm radius token to the radius category');
  }
  
  if (!tokens.shadows?.['tooltip-shadow']) {
    result.warnings.push('Tooltip components work best with a tooltip-shadow token');
    result.suggestions?.push('Add a tooltip-shadow token to the shadows category');
  }
  
  if (!tokens.transitions?.['tooltip-transition']) {
    result.warnings.push('Tooltip components work best with a tooltip-transition token');
    result.suggestions?.push('Add a tooltip-transition token to the transitions category');
  }
  
  return success;
}

/**
 * Validates tokens for general components
 * 
 * @param tokens - The token set to validate
 * @param result - The validation result to update
 * @returns Whether validation passed
 */
function validateGeneralComponentTokens(tokens: TokenSet, result: TokenValidationResult): boolean {
  let success = true;
  
  // Check for basic required tokens
  if (!tokens.colors?.['bg-base'] && !tokens.colors?.['bg-surface']) {
    result.errors.push('Components require either a bg-base or bg-surface color token');
    success = false;
  }
  
 if (!tokens.colors?.['text-primary']) {
    result.errors.push('Components require a text-primary color token');
    success = false;
  }
  
  if (!tokens.typography?.fontFamily) {
    result.warnings.push('Components work best with a typography fontFamily token');
    result.suggestions?.push('Add a fontFamily token to the typography category');
  }
  
  if (!tokens.spacing?.md) {
    result.warnings.push('Components work best with a medium spacing token');
    result.suggestions?.push('Add an md spacing token to the spacing category');
  }
  
  if (!tokens.radius?.md) {
    result.warnings.push('Components work best with a medium radius token');
    result.suggestions?.push('Add an md radius token to the radius category');
  }
  
  return success;
}

/**
 * Validates tokens for accessibility compliance
 * 
 * @param tokens - The token set to validate
 * @returns Validation result for accessibility
 */
export function validateAccessibilityTokens(tokens: TokenSet): TokenValidationResult {
  const result: TokenValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };
  
  // Check for high contrast tokens
  if (!tokens.colors?.['text-disabled']) {
    result.warnings.push('Consider adding text-disabled color token for accessibility');
    result.suggestions?.push('Add a text-disabled token for disabled state text');
  }
  
  if (!tokens.colors?.['border-focus']) {
    result.warnings.push('Consider adding border-focus color token for accessibility');
    result.suggestions?.push('Add a border-focus token for focus state indicators');
  }
  
  // Check for reduced motion tokens
  if (!tokens.transitions?.['duration-instant'] || !tokens.transitions?.['duration-fastest']) {
    result.warnings.push('Consider adding reduced motion transition tokens for accessibility');
    result.suggestions?.push('Add duration-instant and duration-fastest tokens for reduced motion preferences');
  }
  
  return result;
}

/**
 * Validates tokens for responsive design
 * 
 * @param tokens - The token set to validate
 * @returns Validation result for responsive design
 */
export function validateResponsiveTokens(tokens: TokenSet): TokenValidationResult {
  const result: TokenValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };
  
  // Check for responsive spacing tokens
 const requiredSpacingTokens = ['xs', 'sm', 'md', 'lg', 'xl'];
  const missingSpacingTokens = requiredSpacingTokens.filter(token => !tokens.spacing?.[token]);
  
  if (missingSpacingTokens.length > 0) {
    result.warnings.push(`Consider adding responsive spacing tokens: ${missingSpacingTokens.join(', ')}`);
    result.suggestions?.push('Add responsive spacing tokens for different screen sizes');
  }
  
  // Check for responsive typography tokens
  const requiredTypographyTokens = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'];
  const missingTypographyTokens = requiredTypographyTokens.filter(token => !tokens.typography?.sizes?.[token]);
  
  if (missingTypographyTokens.length > 0) {
    result.warnings.push(`Consider adding responsive typography tokens: ${missingTypographyTokens.join(', ')}`);
    result.suggestions?.push('Add responsive typography size tokens for different screen sizes');
  }
  
  return result;
}

/**
 * Validates the completeness of a token set
 * 
 * @param tokens - The token set to validate
 * @returns Validation result for completeness
 */
export function validateTokenSetCompleteness(tokens: TokenSet): TokenValidationResult {
  const result: TokenValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };
  
  // Check for required categories
 if (!tokens.colors) {
    result.errors.push('Token set must include a colors category');
    result.success = false;
  }
  
  if (!tokens.spacing) {
    result.errors.push('Token set must include a spacing category');
    result.success = false;
  }
  
  if (!tokens.typography) {
    result.errors.push('Token set must include a typography category');
    result.success = false;
  }
  
  if (!tokens.radius) {
    result.errors.push('Token set must include a radius category');
    result.success = false;
  }
  
  // Check for common tokens within each category
  if (tokens.colors) {
    const requiredColorTokens = ['primary', 'bg-surface', 'text-primary', 'border-base'];
    const missingColorTokens = requiredColorTokens.filter(token => !tokens.colors?.[token]);
    
    if (missingColorTokens.length > 0) {
      result.warnings.push(`Consider adding common color tokens: ${missingColorTokens.join(', ')}`);
      result.suggestions?.push('Add common color tokens for better theme consistency');
    }
  }
  
 if (tokens.spacing) {
    const requiredSpacingTokens = ['xs', 'sm', 'md', 'lg', 'xl'];
    const missingSpacingTokens = requiredSpacingTokens.filter(token => !tokens.spacing?.[token]);
    
    if (missingSpacingTokens.length > 0) {
      result.warnings.push(`Consider adding common spacing tokens: ${missingSpacingTokens.join(', ')}`);
      result.suggestions?.push('Add common spacing tokens for consistent layouts');
    }
  }
  
  if (tokens.typography) {
    const requiredTypographyTokens = ['fontFamily', 'sizes', 'weights'];
    const missingTypographyTokens = requiredTypographyTokens.filter(token => 
      token === 'fontFamily' ? !tokens.typography?.fontFamily : 
      token === 'sizes' ? !tokens.typography?.sizes : 
      !tokens.typography?.weights
    );
    
    if (missingTypographyTokens.length > 0) {
      result.warnings.push(`Consider adding common typography tokens: ${missingTypographyTokens.join(', ')}`);
      result.suggestions?.push('Add common typography tokens for consistent text styling');
    }
  }
  
  if (tokens.radius) {
    const requiredRadiusTokens = ['sm', 'md', 'lg'];
    const missingRadiusTokens = requiredRadiusTokens.filter(token => !tokens.radius?.[token]);
    
    if (missingRadiusTokens.length > 0) {
      result.warnings.push(`Consider adding common radius tokens: ${missingRadiusTokens.join(', ')}`);
      result.suggestions?.push('Add common radius tokens for consistent corner styling');
    }
 }
  
  return result;
}

/**
 * Validates all aspects of a token set
 * 
 * @param tokens - The token set to validate
 * @param componentType - Optional component type for specific validation
 * @returns Comprehensive validation result
 */
export function validateTokenSet(
  tokens: TokenSet, 
  componentType?: string
): TokenValidationResult {
  const results: TokenValidationResult[] = [
    convertGeneralValidationResult(generalValidateTokens(tokens)), // General validation
    validateTokenSetCompleteness(tokens), // Completeness validation
    validateAccessibilityTokens(tokens), // Accessibility validation
    validateResponsiveTokens(tokens), // Responsive validation
  ];
  
  // Add component-specific validation if component type is provided
  if (componentType) {
    results.push(validateTokensForComponent(tokens, componentType));
  }
  
  // Combine all results
  const combinedResult: TokenValidationResult = {
    success: results.every(r => r.success),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
    suggestions: results.flatMap(r => r.suggestions || []),
  };
  
  return combinedResult;
}