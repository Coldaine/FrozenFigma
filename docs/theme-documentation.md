# FrozenFigma Theme System Documentation

This document provides comprehensive documentation for the FrozenFigma theme system, including design tokens, theme presets, customization options, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
   - [Token Categories](#token-categories)
   - [Token Structure](#token-structure)
   - [Token Naming Conventions](#token-naming-conventions)
3. [Theme Presets](#theme-presets)
   - [Light Theme](#light-theme)
   - [Dark Theme](#dark-theme)
   - [High Contrast Theme](#high-contrast-theme)
   - [Additional Themes](#additional-themes)
4. [Theme Customization](#theme-customization)
   - [Creating Custom Themes](#creating-custom-themes)
   - [Modifying Existing Themes](#modifying-existing-themes)
   - [Theme Inheritance](#theme-inheritance)
5. [Theme Switching](#theme-switching)
   - [Programmatic Theme Switching](#programmatic-theme-switching)
   - [System Theme Detection](#system-theme-detection)
   - [Theme Persistence](#theme-persistence)
6. [Token Validation](#token-validation)
   - [Validation Rules](#validation-rules)
   - [Accessibility Validation](#accessibility-validation)
   - [Responsive Validation](#responsive-validation)
7. [Token History and Tracking](#token-history-and-tracking)
   - [History Management](#history-management)
   - [Undo/Redo Functionality](#undoredo-functionality)
8. [Implementation Guide](#implementation-guide)
   - [Using Tokens in Components](#using-tokens-in-components)
   - [CSS Variable Generation](#css-variable-generation)
   - [Token-to-Style Conversion](#token-to-style-conversion)
9. [Best Practices](#best-practices)
   - [Token Organization](#token-organization)
   - [Theme Consistency](#theme-consistency)
   - [Performance Considerations](#performance-considerations)
10. [API Reference](#api-reference)
    - [Theme Manager](#theme-manager)
    - [Token Utilities](#token-utilities)
    - [Validation Utilities](#validation-utilities)
11. [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Debugging Tips](#debugging-tips)

## Overview

The FrozenFigma theme system is built around design tokens that provide a scalable and maintainable approach to theming. The system supports multiple theme presets, custom theme creation, and comprehensive validation to ensure consistency and accessibility.

Key features of the theme system include:

- **Design Tokens**: Semantic, categorized tokens for all design properties
- **Theme Presets**: Predefined themes including light, dark, and high contrast
- **Customization**: Flexible system for creating and modifying themes
- **Validation**: Comprehensive validation for tokens and themes
- **History Tracking**: Full history and undo/redo functionality
- **Accessibility**: Built-in accessibility validation and compliance
- **Responsive Design**: Support for responsive token variations

## Design Tokens

Design tokens are the foundation of the FrozenFigma theme system. They provide a scalable way to manage design decisions and ensure consistency across the application.

### Token Categories

The theme system organizes tokens into the following categories:

1. **Colors**: All color values used in the theme
2. **Spacing**: Values for margins, padding, and layout
3. **Typography**: Font families, sizes, weights, and line heights
4. **Radius**: Border radius values for rounded corners
5. **Shadows**: Box shadow definitions for depth and elevation
6. **Transitions**: Animation timing and easing functions

### Token Structure

Each token category has a specific structure:

#### Colors

```typescript
interface ColorTokens {
  // Primary color palette
  primary: string;
  'primary-50': string;
  'primary-100': string;
  'primary-200': string;
  'primary-300': string;
  'primary-400': string;
  'primary-500': string;
  'primary-600': string;
  'primary-700': string;
  'primary-800': string;
  'primary-900': string;
  
  // Secondary color palette
  secondary: string;
  
  // Background colors
  'bg-base': string;
  'bg-surface': string;
  'bg-elevated': string;
  
  // Text colors
  'text-primary': string;
  'text-secondary': string;
  'text-muted': string;
  
  // Border colors
  'border-base': string;
  'border-muted': string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}
```

#### Spacing

```typescript
interface SpacingTokens {
  // Numeric spacing values
  '0': number;
  '1': number;
  '2': number;
  '4': number;
  '8': number;
  '12': number;
  '16': number;
  '20': number;
  '24': number;
  '32': number;
  
  // Semantic spacing tokens
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
}
```

#### Typography

```typescript
interface TypographyTokens {
  fontFamily: string;
  sizes: Record<string, number>;
  weights: Record<string, number>;
  lineHeights: Record<string, number>;
}
```

#### Radius

```typescript
interface RadiusTokens {
  '0': number;
  '1': number;
  '2': number;
  '4': number;
  '8': number;
  '12': number;
  '16': number;
  
  // Semantic radius tokens
  'sm': number;
  'md': number;
  'lg': number;
}
```

#### Shadows

```typescript
interface ShadowTokens {
  'none': string;
  'sm': string;
  'base': string;
  'md': string;
  'lg': string;
  'xl': string;
  '2xl': string;
}
```

#### Transitions

```typescript
interface TransitionTokens {
  // Duration tokens
  'duration-instant': number;
  'duration-fastest': number;
  'duration-faster': number;
  'duration-fast': number;
  'duration-normal': number;
  'duration-slow': number;
  
  // Easing tokens
  'easing-linear': string;
  'easing-in': string;
  'easing-out': string;
  'easing-in-out': string;
}
```

### Token Naming Conventions

Tokens follow consistent naming conventions to ensure clarity and maintainability:

1. **Semantic Naming**: Tokens use semantic names that describe their purpose rather than their appearance
2. **Hierarchy**: Related tokens are organized with a clear hierarchy (e.g., `primary`, `primary-50`, `primary-100`)
3. **Consistency**: Similar tokens across categories follow the same naming patterns
4. **Clarity**: Names clearly indicate the token's purpose and usage context

## Theme Presets

FrozenFigma includes several predefined theme presets that provide a consistent starting point for applications.

### Light Theme

The default light theme provides a clean, readable interface with high contrast between text and background.

Key characteristics:
- White background with dark text
- Subtle shadows for depth
- Soft color palette with blue primary color
- Optimized for daytime use

### Dark Theme

The dark theme reduces eye strain in low-light environments while maintaining readability.

Key characteristics:
- Dark background with light text
- Reduced blue light emission
- Carefully balanced contrast ratios
- Optimized for nighttime use

### High Contrast Theme

The high contrast theme enhances accessibility for users with visual impairments.

Key characteristics:
- Maximum contrast between text and background
- Bold, distinct color boundaries
- Enlarged text and UI elements
- Compliant with WCAG AA standards

### Additional Themes

FrozenFigma also includes several additional theme presets:

1. **Colorful Theme**: Vibrant color palette for engaging interfaces
2. **Minimal Theme**: Subdued colors and minimalist design
3. **Pastel Theme**: Soft, calming pastel color scheme

## Theme Customization

The theme system provides extensive customization options for creating unique themes.

### Creating Custom Themes

Custom themes can be created by defining a complete token set or by extending an existing theme.

Example of creating a custom theme:

```typescript
import { createDefaultTokens } from './themeUtils';

const customTokens = {
  ...createDefaultTokens(),
  colors: {
    ...createDefaultTokens().colors,
    primary: '#ff6b6b', // Custom primary color
    secondary: '#4ecdc4', // Custom secondary color
  },
  typography: {
    ...createDefaultTokens().typography,
    fontFamily: '"Comic Sans MS", cursive, sans-serif', // Custom font
  },
};

// Apply the custom theme
getThemeManager().applyCustomTheme(customTokens, 'my-custom-theme');
```

### Modifying Existing Themes

Existing themes can be modified by updating specific tokens:

```typescript
// Update a single token
getThemeManager().updateToken('colors.primary', '#ff6b6b');

// Update multiple tokens
const themeManager = getThemeManager();
const currentTokens = themeManager.getCurrentTokens();

if (currentTokens) {
  const updatedTokens = {
    ...currentTokens,
    colors: {
      ...currentTokens.colors,
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
    },
  };
  
  themeManager.applyCustomTheme(updatedTokens);
}
```

### Theme Inheritance

Themes can inherit from other themes, allowing for modular theme creation:

```typescript
import { createInheritedTokenSet } from './tokenInheritance';

// Create a theme that inherits from the dark theme
const inheritedTokens = createInheritedTokenSet(
  createDarkThemeTokens(), // Parent theme
  {
    colors: {
      primary: '#ff6b6b', // Override primary color
    },
    typography: {
      fontFamily: '"Comic Sans MS", cursive, sans-serif', // Override font
    },
  } // Overrides
);

getThemeManager().applyCustomTheme(inheritedTokens, 'inherited-dark');
```

## Theme Switching

The theme system provides seamless theme switching with smooth transitions.

### Programmatic Theme Switching

Themes can be switched programmatically:

```typescript
import { applyTheme, toggleTheme, switchToSystemTheme } from './themeManager';

// Apply a specific theme
applyTheme('dark');

// Toggle between light and dark themes
toggleTheme();

// Switch to system theme preference
switchToSystemTheme();
```

### System Theme Detection

The system automatically detects the user's preferred color scheme:

```typescript
// The theme manager automatically detects system preference
const themeManager = getThemeManager();
themeManager.switchToSystemTheme();

// Check if current theme is dark
if (themeManager.isDarkTheme()) {
  console.log('Current theme is dark');
}
```

### Theme Persistence

Themes are automatically persisted to localStorage:

```typescript
// Theme persistence is enabled by default
const themeManager = getThemeManager({
  persist: true, // Enabled by default
  persistenceKey: 'frozenfigma-theme', // Default key
});

// Manually save theme preference
themeManager.applyTheme('dark');
// Theme is automatically saved to localStorage

// Manually load theme preference
const savedTheme = window.localStorage.getItem('frozenfigma-theme');
if (savedTheme) {
  themeManager.applyTheme(savedTheme as ThemePreset);
}
```

## Token Validation

The theme system includes comprehensive validation to ensure token consistency and accessibility.

### Validation Rules

Tokens are validated against a set of rules:

1. **Type Validation**: Ensures tokens are of the correct type (string, number)
2. **Format Validation**: Ensures color values are valid CSS colors
3. **Range Validation**: Ensures numeric values are within acceptable ranges
4. **Completeness Validation**: Ensures required tokens are present

Example validation:

```typescript
import { validateTokens } from './themeUtils';

const tokens = createDefaultTokens();
const validationResult = validateTokens(tokens);

if (validationResult.success) {
  console.log('Tokens are valid');
} else {
  console.error('Token validation errors:', validationResult.errors);
}
```

### Accessibility Validation

Tokens are validated for accessibility compliance:

```typescript
import { validateAccessibilityTokens } from './tokenValidation';

const tokens = createDefaultTokens();
const accessibilityResult = validateAccessibilityTokens(tokens);

if (!accessibilityResult.success) {
  console.warn('Accessibility issues:', accessibilityResult.warnings);
}
```

### Responsive Validation

Tokens are validated for responsive design compliance:

```typescript
import { validateResponsiveTokens } from './tokenValidation';

const tokens = createDefaultTokens();
const responsiveResult = validateResponsiveTokens(tokens);

if (!responsiveResult.success) {
  console.warn('Responsive design issues:', responsiveResult.warnings);
}
```

## Token History and Tracking

The theme system tracks all token changes for audit trails and undo/redo functionality.

### History Management

All token changes are recorded in a history:

```typescript
import { getTokenHistory, getTokenHistoryManager } from './tokenHistory';

// Record a token change
const historyManager = getTokenHistoryManager();
historyManager.recordSetTokensCommand(
  setTokensCommand,
  previousTokens,
  newTokens
);

// Get token history
const history = getTokenHistory();
console.log('Token history:', history);

// Filter history by tags
const tokenUpdates = getTokenHistoryByTags(['tokens', 'update']);
```

### Undo/Redo Functionality

The system provides built-in undo/redo functionality:

```typescript
import { moveToPreviousTokenHistoryEntry, moveToNextTokenHistoryEntry } from './tokenHistory';

// Undo the last change
const previousEntry = moveToPreviousTokenHistoryEntry();
if (previousEntry && previousEntry.before) {
  getThemeManager().applyCustomTheme(previousEntry.before);
}

// Redo the last undone change
const nextEntry = moveToNextTokenHistoryEntry();
if (nextEntry && nextEntry.after) {
  getThemeManager().applyCustomTheme(nextEntry.after);
}
```

## Implementation Guide

This section provides guidance on implementing the theme system in components.

### Using Tokens in Components

Components can use tokens through the theme system:

```typescript
import { useTokenStyles } from './useTokenStyles';

const MyComponent = () => {
  const styles = useTokenStyles('button');
  
  return (
    <button style={styles}>
      Click me
    </button>
  );
};
```

### CSS Variable Generation

Tokens can be converted to CSS variables:

```typescript
import { tokensToCSSVariables } from './themeUtils';

const tokens = createDefaultTokens();
const cssVariables = tokensToCSSVariables(tokens);

// Apply to document root
Object.entries(cssVariables).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

### Token-to-Style Conversion

Tokens can be converted to style objects for components:

```typescript
import { tokensToStyles } from './tokenToStyleConverter';

const tokens = createDefaultTokens();
const buttonStyles = tokensToStyles(tokens, { componentType: 'button' });

// Use in component
const MyButton = () => (
  <button style={buttonStyles}>
    Styled Button
  </button>
);
```

## Best Practices

Follow these best practices for optimal theme system usage.

### Token Organization

1. **Categorize Tokens**: Group related tokens into logical categories
2. **Use Semantic Names**: Name tokens based on their purpose, not their appearance
3. **Maintain Hierarchy**: Organize tokens with a clear hierarchy
4. **Document Tokens**: Provide clear documentation for each token

### Theme Consistency

1. **Maintain Ratios**: Keep consistent ratios between related tokens
2. **Limit Variations**: Avoid too many variations of similar tokens
3. **Use Systematic Scales**: Use systematic scales for spacing and typography
4. **Test Across Themes**: Ensure consistency across all theme presets

### Performance Considerations

1. **Minimize Token Count**: Keep the number of tokens reasonable for performance
2. **Optimize Updates**: Batch token updates to minimize re-renders
3. **Cache Converted Values**: Cache converted CSS variables and styles
4. **Lazy Load Themes**: Load non-default themes only when needed

## API Reference

### Theme Manager

The ThemeManager class provides core theme functionality:

```typescript
class ThemeManager {
  // Apply a specific theme
  applyTheme(themeId: ThemePreset): void;
  
  // Switch to system theme preference
  switchToSystemTheme(): void;
  
  // Toggle between light and dark themes
  toggleTheme(): ThemePreset;
  
  // Update a specific token
  updateToken(tokenPath: string, value: string | number): void;
  
  // Apply a custom token set
  applyCustomTheme(tokens: TokenSet, themeName?: string): void;
  
  // Get current theme
  getCurrentTheme(): ThemePreset | 'system';
  
  // Get effective theme (resolves 'system' to actual theme)
  getEffectiveTheme(): ThemePreset;
  
  // Check if current theme is dark
  isDarkTheme(): boolean;
}
```

### Token Utilities

Utility functions for working with tokens:

```typescript
// Validate tokens
function validateTokens(tokens: TokenSet): { success: boolean; errors?: string[] };

// Convert tokens to CSS variables
function tokensToCSSVariables(tokens: TokenSet, prefix?: string): Record<string, string>;

// Create default tokens
function createDefaultTokens(): TokenSet;

// Create dark theme tokens
function createDarkThemeTokens(): TokenSet;
```

### Validation Utilities

Utility functions for validating tokens and themes:

```typescript
// Validate token set completeness
function validateTokenSetCompleteness(tokens: TokenSet): TokenValidationResult;

// Validate accessibility compliance
function validateAccessibilityTokens(tokens: TokenSet): TokenValidationResult;

// Validate responsive design compliance
function validateResponsiveTokens(tokens: TokenSet): TokenValidationResult;
```

## Troubleshooting

### Common Issues

1. **Tokens Not Applying**: Ensure tokens are properly validated and applied through the theme manager
2. **Theme Not Persisting**: Check localStorage permissions and persistence settings
3. **Invalid Token Values**: Verify token values conform to expected formats and types
4. **Performance Issues**: Review token count and optimize update frequency

### Debugging Tips

1. **Check Browser Console**: Look for validation errors and warnings
2. **Verify Token Structure**: Ensure tokens match the expected schema
3. **Test Across Themes**: Verify functionality works consistently across all themes
4. **Monitor Performance**: Use browser dev tools to monitor rendering performance

---

This documentation provides a comprehensive overview of the FrozenFigma theme system. For implementation details, refer to the source code and inline documentation in the respective modules.