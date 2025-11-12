/**
 * Theme and Token System Tests
 * 
 * This file contains comprehensive tests for the FrozenFigma theme and token system,
 * including token validation, theme switching, and utility functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createDefaultTokens, 
  createDarkThemeTokens, 
  validateTokens, 
  tokensToCSSVariables 
} from '../app/theme/themeUtils';
import { 
  getThemeManager, 
  initThemeManager,
  applyTheme,
  toggleTheme,
  isDarkTheme
} from '../app/theme/themeManager';
import {
  initTokenHistoryManager,
  getTokenHistoryManager,
  recordSetTokensCommand,
  getTokenHistory
} from '../app/theme/tokenHistory';
import { validateTokenSetCompleteness } from '../app/theme/tokenValidation';
import { TokenSet, SetTokensCommand } from '../schema';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Test token set with valid values
 */
const validTestTokens: TokenSet = {
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

/**
 * Test token set with invalid values
 */
const invalidTestTokens: Record<string, unknown> = {
  colors: {
    primary: 'invalid-color', // Invalid color format
    secondary: 123, // Invalid type
  },
  spacing: {
    '0': -5, // Negative value
    '1': 'invalid', // Invalid type
  },
  typography: {
    fontFamily: 123, // Invalid type
    sizes: {
      'sm': 'invalid', // Invalid type
    },
    weights: {
      'normal': 350, // Invalid font weight
    },
  },
  radius: {
    '0': -2, // Negative value
  },
  shadows: {
    'sm': 123, // Invalid type
  },
  transitions: {
    'duration-normal': 'invalid', // Invalid type
  },
};

// ============================================================================
// TOKEN VALIDATION TESTS
// ============================================================================

describe('Token Validation', () => {
  it('should validate valid tokens successfully', () => {
    const result = validateTokens(validTestTokens);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should detect invalid tokens', () => {
    const result = validateTokens(invalidTestTokens);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should validate token set completeness', () => {
    const result = validateTokenSetCompleteness(validTestTokens);
    expect(result.success).toBe(true);
  });

  it('should create default tokens', () => {
    const tokens = createDefaultTokens();
    expect(tokens).toBeDefined();
    expect(tokens.colors).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.radius).toBeDefined();
    expect(tokens.shadows).toBeDefined();
    expect(tokens.transitions).toBeDefined();
  });

  it('should create dark theme tokens', () => {
    const tokens = createDarkThemeTokens();
    expect(tokens).toBeDefined();
    expect(tokens.colors).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.radius).toBeDefined();
    expect(tokens.shadows).toBeDefined();
    expect(tokens.transitions).toBeDefined();
  });
});

// ============================================================================
// TOKEN TRANSFORMATION TESTS
// ============================================================================

describe('Token Transformation', () => {
  it('should convert tokens to CSS variables', () => {
    const cssVars = tokensToCSSVariables(validTestTokens);
    expect(cssVars).toBeDefined();
    expect(Object.keys(cssVars).length).toBeGreaterThan(0);
    
    // Check that some expected variables are present
    expect(cssVars['--ff-color-primary']).toBe('#3b82f6');
    expect(cssVars['--ff-spacing-md']).toBe('16px');
    expect(cssVars['--ff-radius-md']).toBe('6px');
  });

  it('should handle empty token sets in CSS variable conversion', () => {
    const cssVars = tokensToCSSVariables(createDefaultTokens());
    expect(cssVars).toBeDefined();
  });
});

// ============================================================================
// THEME MANAGER TESTS
// ============================================================================

describe('Theme Manager', () => {
  beforeEach(() => {
    // Initialize a fresh theme manager for each test
    initThemeManager({ persist: false });
  });

  afterEach(() => {
    // Clean up after each test
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should initialize with system theme', () => {
    const themeManager = getThemeManager();
    expect(themeManager.getCurrentTheme()).toBe('system');
  });

  it('should apply light theme', () => {
    const themeManager = getThemeManager();
    themeManager.applyTheme('light');
    expect(themeManager.getCurrentTheme()).toBe('light');
  });

  it('should apply dark theme', () => {
    const themeManager = getThemeManager();
    themeManager.applyTheme('dark');
    expect(themeManager.getCurrentTheme()).toBe('dark');
  });

  it('should toggle between themes', () => {
    const themeManager = getThemeManager();
    // Assuming system theme defaults to light
    const newTheme = themeManager.toggleTheme();
    expect(['light', 'dark']).toContain(newTheme);
  });

  it('should detect dark theme', () => {
    const themeManager = getThemeManager();
    themeManager.applyTheme('dark');
    expect(themeManager.isDarkTheme()).toBe(true);
    
    themeManager.applyTheme('light');
    expect(themeManager.isDarkTheme()).toBe(false);
  });

  it('should get current tokens', () => {
    const themeManager = getThemeManager();
    themeManager.applyTheme('light');
    const tokens = themeManager.getCurrentTokens();
    expect(tokens).toBeDefined();
    expect(tokens?.colors).toBeDefined();
  });

  it('should update individual tokens', () => {
    const themeManager = getThemeManager();
    themeManager.applyTheme('light');
    
    // Store initial tokens
    const initialTokens = themeManager.getCurrentTokens();
    
    // Update a token
    themeManager.updateToken('colors.primary', '#ff0000');
    
    // Get updated tokens
    const updatedTokens = themeManager.getCurrentTokens();
    
    // Verify the token was updated
    expect(updatedTokens?.colors?.primary).toBe('#ff0000');
    
    // Verify other tokens remain unchanged
    expect(updatedTokens?.colors?.secondary).toBe(initialTokens?.colors?.secondary);
  });

  it('should apply custom theme', () => {
    const themeManager = getThemeManager();
    themeManager.applyCustomTheme(validTestTokens, 'test-theme');
    const tokens = themeManager.getCurrentTokens();
    expect(tokens).toEqual(validTestTokens);
  });
});

// ============================================================================
// THEME SWITCHING TESTS
// ============================================================================

describe('Theme Switching', () => {
  beforeEach(() => {
    initThemeManager({ persist: false });
  });

  afterEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should apply theme using global function', () => {
    applyTheme('dark');
    expect(isDarkTheme()).toBe(true);
  });

  it('should toggle theme using global function', () => {
    const initialIsDark = isDarkTheme();
    toggleTheme();
    expect(isDarkTheme()).toBe(!initialIsDark);
  });
});

// ============================================================================
// TOKEN HISTORY TESTS
// ============================================================================

describe('Token History', () => {
  beforeEach(() => {
    // Initialize a fresh history manager for each test
    initTokenHistoryManager({ autoSave: false });
  });

  it('should initialize with empty history', () => {
    const historyManager = getTokenHistoryManager();
    const history = historyManager.getHistory();
    expect(history).toBeDefined();
    expect(history.length).toBe(0);
  });

  it('should record set tokens command', () => {
    const historyManager = getTokenHistoryManager();
    
    const command: SetTokensCommand = {
      type: 'SET_TOKENS',
      id: 'test-command',
      tokens: validTestTokens,
    };
    
    historyManager.recordSetTokensCommand(command, null, validTestTokens);
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('set');
    expect(history[0].description).toContain('Set tokens to');
  });

  it('should record token update', () => {
    const historyManager = getTokenHistoryManager();
    
    historyManager.recordTokenUpdate(
      'colors.primary',
      '#3b82f6',
      '#ff0000',
      validTestTokens,
      { ...validTestTokens, colors: { ...validTestTokens.colors, primary: '#ff0000' } }
    );
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('update');
    expect(history[0].description).toContain('Updated token colors.primary');
  });

  it('should record theme reset', () => {
    const historyManager = getTokenHistoryManager();
    
    historyManager.recordThemeReset('light', null, validTestTokens);
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('reset');
    expect(history[0].description).toContain('Reset to light theme');
  });

  it('should record token import', () => {
    const historyManager = getTokenHistoryManager();
    
    historyManager.recordTokenImport('test-file.json', null, validTestTokens);
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('import');
    expect(history[0].description).toContain('Imported tokens from test-file.json');
  });

  it('should record custom change', () => {
    const historyManager = getTokenHistoryManager();
    
    historyManager.recordCustomChange('Test custom change', null, validTestTokens, ['test', 'custom']);
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('custom');
    expect(history[0].description).toBe('Test custom change');
    expect(history[0].tags).toContain('test');
    expect(history[0].tags).toContain('custom');
  });

  it('should filter history by tags', () => {
    const historyManager = getTokenHistoryManager();
    
    // Record multiple entries with different tags
    historyManager.recordCustomChange('Test change 1', null, validTestTokens, ['tag1']);
    historyManager.recordCustomChange('Test change 2', null, validTestTokens, ['tag2']);
    historyManager.recordCustomChange('Test change 3', null, validTestTokens, ['tag1', 'tag3']);
    
    const filtered = historyManager.getHistoryByTags(['tag1']);
    expect(filtered.length).toBe(2);
    
    const filtered2 = historyManager.getHistoryByTags(['tag2']);
    expect(filtered2.length).toBe(1);
  });

  it('should filter history by time range', () => {
    const historyManager = getTokenHistoryManager();
    
    // Record entries with different timestamps
    const now = Date.now();
    const past = now - 1000; // 1 second ago
    const future = now + 1000; // 1 second in the future
    
    // Mock timestamps for testing
    const realNow = Date.now;
    Date.now = () => past;
    historyManager.recordCustomChange('Past change', null, validTestTokens);
    
    Date.now = () => now;
    historyManager.recordCustomChange('Current change', null, validTestTokens);
    
    Date.now = () => future;
    historyManager.recordCustomChange('Future change', null, validTestTokens);
    
    // Restore real Date.now
    Date.now = realNow;
    
    // Filter by time range
    const filtered = historyManager.getHistoryByTimeRange(now - 500, now + 500);
    expect(filtered.length).toBe(1);
    expect(filtered[0].description).toBe('Current change');
  });

  it('should support undo/redo functionality', () => {
    const historyManager = getTokenHistoryManager();
    
    // Record multiple entries
    historyManager.recordCustomChange('Change 1', null, validTestTokens);
    historyManager.recordCustomChange('Change 2', null, validTestTokens);
    historyManager.recordCustomChange('Change 3', null, validTestTokens);
    
    // Test navigation
    expect(historyManager.getNextEntry()).toBeNull(); // Already at end
    
    const prev = historyManager.moveToPreviousEntry();
    expect(prev).toBeDefined();
    expect(prev?.description).toBe('Change 2');
    
    const next = historyManager.moveToNextEntry();
    expect(next).toBeDefined();
    expect(next?.description).toBe('Change 3');
  });

  it('should clear history', () => {
    const historyManager = getTokenHistoryManager();
    
    historyManager.recordCustomChange('Test change', null, validTestTokens);
    expect(historyManager.getHistory().length).toBe(1);
    
    historyManager.clearHistory();
    expect(historyManager.getHistory().length).toBe(0);
  });
});

// ============================================================================
// GLOBAL TOKEN HISTORY FUNCTION TESTS
// ============================================================================

describe('Global Token History Functions', () => {
  beforeEach(() => {
    initTokenHistoryManager({ autoSave: false });
  });

  it('should record set tokens command globally', () => {
    const command: SetTokensCommand = {
      type: 'SET_TOKENS',
      id: 'test-command',
      tokens: validTestTokens,
    };
    
    recordSetTokensCommand(command, null, validTestTokens);
    
    const history = getTokenHistory();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('set');
  });

  it('should get token history globally', () => {
    const history = getTokenHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  beforeEach(() => {
    initThemeManager({ persist: false });
    initTokenHistoryManager({ autoSave: false });
  });

  afterEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should handle undefined tokens gracefully', () => {
    const result = validateTokens(undefined);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should handle null tokens gracefully', () => {
    const result = validateTokens(null);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should handle empty token sets', () => {
    const result = validateTokens({});
    expect(result.success).toBe(true);
  });

  it('should handle theme switching with persistence disabled', () => {
    const themeManager = getThemeManager({ persist: false });
    themeManager.applyTheme('dark');
    expect(themeManager.getCurrentTheme()).toBe('dark');
  });

  it('should handle history with max size limit', () => {
    const historyManager = getTokenHistoryManager({ maxSize: 3 });
    
    // Add more entries than max size
    for (let i = 0; i < 5; i++) {
      historyManager.recordCustomChange(`Change ${i}`, null, validTestTokens);
    }
    
    const history = historyManager.getHistory();
    expect(history.length).toBe(3); // Should be trimmed to max size
  });
});