/**
 * Agent Token Modifier
 * 
 * This module provides functionality for agents to modify design tokens
 * through commands, with validation and history tracking.
 */

import { TokenSet, Command, SetTokensCommand } from '../schema';
import { validateTokens, tokensToCSSVariables } from '../app/theme/themeUtils';
import { getThemeManager, getCurrentTheme, getEffectiveTheme, applyTheme, switchToSystemTheme, toggleTheme, isDarkTheme } from '../app/theme/themeManager';
import { createSetTokensCommand } from '../schema';

// ============================================================================
// AGENT TOKEN MODIFIER
// ============================================================================

/**
 * Agent token modification options
 */
export interface TokenModificationOptions {
  /** Whether to validate tokens after modification */
  validate?: boolean;
  /** Whether to apply changes immediately */
  applyImmediately?: boolean;
  /** Whether to track history of changes */
  trackHistory?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
}

/**
 * Token modification result
 */
export interface TokenModificationResult {
  /** Success status */
  success: boolean;
  /** Modified token set */
  tokens?: TokenSet;
  /** Errors if any */
  errors?: string[];
  /** Generated command if applicable */
  command?: SetTokensCommand;
}

/**
 * Token modification history entry
 */
interface TokenHistoryEntry {
  /** Timestamp of the modification */
  timestamp: number;
  /** Modified token set */
  tokens: TokenSet;
  /** Command that caused the modification */
  command?: SetTokensCommand;
  /** Description of the change */
  description: string;
}

/**
 * Agent token modifier class
 */
export class AgentTokenModifier {
  private options: Required<TokenModificationOptions>;
  private history: TokenHistoryEntry[] = [];
  private currentIndex: number = -1;

  constructor(options?: TokenModificationOptions) {
    this.options = {
      validate: options?.validate !== false,
      applyImmediately: options?.applyImmediately !== false,
      trackHistory: options?.trackHistory !== false,
      maxHistorySize: options?.maxHistorySize || 50,
    };
  }

  /**
   * Modify a color token
   * 
   * @param tokenName - Name of the color token to modify
   * @param value - New color value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifyColor(tokenName: string, value: string, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure colors category exists
      if (!modifiedTokens.colors) {
        modifiedTokens.colors = {};
      }
      
      // Modify the color token
      modifiedTokens.colors[tokenName] = value;
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified color token '${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Modify a spacing token
   * 
   * @param tokenName - Name of the spacing token to modify
   * @param value - New spacing value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifySpacing(tokenName: string, value: number, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure spacing category exists
      if (!modifiedTokens.spacing) {
        modifiedTokens.spacing = {};
      }
      
      // Modify the spacing token
      modifiedTokens.spacing[tokenName] = value;
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified spacing token '${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Modify a typography token
   * 
   * @param tokenType - Type of typography token to modify (fontFamily, fontSize, fontWeight)
   * @param tokenName - Name of the typography token to modify
   * @param value - New typography value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifyTypography(tokenType: 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight', tokenName: string, value: string | number, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure typography category exists
      if (!modifiedTokens.typography) {
        modifiedTokens.typography = { fontFamily: 'system-ui', sizes: {}, weights: {}, lineHeights: {} };
      }
      
      // Modify the typography token
      switch (tokenType) {
        case 'fontFamily':
          modifiedTokens.typography.fontFamily = value as string;
          break;
        case 'fontSize':
          if (!modifiedTokens.typography.sizes) modifiedTokens.typography.sizes = {};
          modifiedTokens.typography.sizes[tokenName] = value as number;
          break;
        case 'fontWeight':
          if (!modifiedTokens.typography.weights) modifiedTokens.typography.weights = {};
          modifiedTokens.typography.weights[tokenName] = value as number;
          break;
        case 'lineHeight':
          if (!modifiedTokens.typography.lineHeights) modifiedTokens.typography.lineHeights = {};
          modifiedTokens.typography.lineHeights[tokenName] = value as number;
          break;
      }
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified typography token '${tokenType}.${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Modify a radius token
   * 
   * @param tokenName - Name of the radius token to modify
   * @param value - New radius value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifyRadius(tokenName: string, value: number, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure radius category exists
      if (!modifiedTokens.radius) {
        modifiedTokens.radius = {};
      }
      
      // Modify the radius token
      modifiedTokens.radius[tokenName] = value;
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified radius token '${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Modify a shadow token
   * 
   * @param tokenName - Name of the shadow token to modify
   * @param value - New shadow value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifyShadow(tokenName: string, value: string, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure shadows category exists
      if (!modifiedTokens.shadows) {
        modifiedTokens.shadows = {};
      }
      
      // Modify the shadow token
      modifiedTokens.shadows[tokenName] = value;
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified shadow token '${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Modify a transition token
   * 
   * @param tokenName - Name of the transition token to modify
   * @param value - New transition value
   * @param description - Description of the change
   * @returns Modification result
   */
  public modifyTransition(tokenName: string, value: number | string, description?: string): TokenModificationResult {
    try {
      // Get current tokens
      const themeManager = getThemeManager();
      const currentTokens = themeManager.getCurrentTokens() || this.createDefaultTokens();
      
      // Create a copy of current tokens
      const modifiedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
      
      // Ensure transitions category exists
      if (!modifiedTokens.transitions) {
        modifiedTokens.transitions = {};
      }
      
      // Modify the transition token
      modifiedTokens.transitions[tokenName] = value;
      
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(modifiedTokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        themeManager.applyCustomTheme(modifiedTokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(modifiedTokens, description || `Modified transition token '${tokenName}'`);
      }
      
      // Create command
      const command = createSetTokensCommand(modifiedTokens);
      
      return {
        success: true,
        tokens: modifiedTokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Apply a complete token set
   * 
   * @param tokens - Token set to apply
   * @param description - Description of the change
   * @returns Modification result
   */
  public applyTokenSet(tokens: TokenSet, description?: string): TokenModificationResult {
    try {
      // Validate if requested
      if (this.options.validate) {
        const validationResult = validateTokens(tokens);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }
      
      // Apply changes if requested
      if (this.options.applyImmediately) {
        getThemeManager().applyCustomTheme(tokens);
      }
      
      // Track history if requested
      if (this.options.trackHistory) {
        this.addToHistory(tokens, description || 'Applied complete token set');
      }
      
      // Create command
      const command = createSetTokensCommand(tokens);
      
      return {
        success: true,
        tokens,
        command,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Undo the last modification
   * 
   * @returns Undo result
   */
  public undo(): TokenModificationResult {
    try {
      if (this.currentIndex <= 0 || this.history.length === 0) {
        return {
          success: false,
          errors: ['No modifications to undo'],
        };
      }
      
      this.currentIndex--;
      const previousEntry = this.history[this.currentIndex];
      
      // Apply the previous tokens
      if (this.options.applyImmediately) {
        getThemeManager().applyCustomTheme(previousEntry.tokens);
      }
      
      return {
        success: true,
        tokens: previousEntry.tokens,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Redo the last undone modification
   * 
   * @returns Redo result
   */
  public redo(): TokenModificationResult {
    try {
      if (this.currentIndex >= this.history.length - 1 || this.history.length === 0) {
        return {
          success: false,
          errors: ['No modifications to redo'],
        };
      }
      
      this.currentIndex++;
      const nextEntry = this.history[this.currentIndex];
      
      // Apply the next tokens
      if (this.options.applyImmediately) {
        getThemeManager().applyCustomTheme(nextEntry.tokens);
      }
      
      return {
        success: true,
        tokens: nextEntry.tokens,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get the modification history
   * 
   * @returns History entries
   */
  public getHistory(): TokenHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear the modification history
   */
  public clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Add a modification to history
   * 
   * @param tokens - Modified token set
   * @param description - Description of the change
   */
  private addToHistory(tokens: TokenSet, description: string): void {
    const entry: TokenHistoryEntry = {
      timestamp: Date.now(),
      tokens: JSON.parse(JSON.stringify(tokens)),
      description,
    };
    
    // If we're not at the end of history, truncate everything after current index
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add the new entry
    this.history.push(entry);
    this.currentIndex = this.history.length - 1;
    
    // Trim history if it exceeds max size
    if (this.history.length > this.options.maxHistorySize) {
      const excess = this.history.length - this.options.maxHistorySize;
      this.history = this.history.slice(excess);
      this.currentIndex = this.history.length - 1;
    }
  }

  /**
   * Create default tokens
   * 
   * @returns Default token set
   */
  private createDefaultTokens(): TokenSet {
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
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        sizes: {
          'xs': 12,
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
}

/**
 * Global agent token modifier instance
 */
let agentTokenModifier: AgentTokenModifier | null = null;

/**
 * Gets the global agent token modifier instance
 * 
 * @param options - Options for the token modifier
 * @returns Agent token modifier instance
 */
export function getAgentTokenModifier(options?: TokenModificationOptions): AgentTokenModifier {
  if (!agentTokenModifier) {
    agentTokenModifier = new AgentTokenModifier(options);
  }
  return agentTokenModifier;
}

/**
 * Initializes the agent token modifier with options
 * 
 * @param options - Options for the token modifier
 */
export function initAgentTokenModifier(options?: TokenModificationOptions): void {
  if (agentTokenModifier) {
    // Clear history when reinitializing
    agentTokenModifier.clearHistory();
  }
  agentTokenModifier = new AgentTokenModifier(options);
}

/**
 * Modifies a color token using the global modifier
 * 
 * @param tokenName - Name of the color token to modify
 * @param value - New color value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifyColor(tokenName: string, value: string, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifyColor(tokenName, value, description);
}

/**
 * Modifies a spacing token using the global modifier
 * 
 * @param tokenName - Name of the spacing token to modify
 * @param value - New spacing value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifySpacing(tokenName: string, value: number, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifySpacing(tokenName, value, description);
}

/**
 * Modifies a typography token using the global modifier
 * 
 * @param tokenType - Type of typography token to modify
 * @param tokenName - Name of the typography token to modify
 * @param value - New typography value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifyTypography(tokenType: 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight', tokenName: string, value: string | number, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifyTypography(tokenType, tokenName, value, description);
}

/**
 * Modifies a radius token using the global modifier
 * 
 * @param tokenName - Name of the radius token to modify
 * @param value - New radius value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifyRadius(tokenName: string, value: number, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifyRadius(tokenName, value, description);
}

/**
 * Modifies a shadow token using the global modifier
 * 
 * @param tokenName - Name of the shadow token to modify
 * @param value - New shadow value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifyShadow(tokenName: string, value: string, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifyShadow(tokenName, value, description);
}

/**
 * Modifies a transition token using the global modifier
 * 
 * @param tokenName - Name of the transition token to modify
 * @param value - New transition value
 * @param description - Description of the change
 * @returns Modification result
 */
export function modifyTransition(tokenName: string, value: number | string, description?: string): TokenModificationResult {
  return getAgentTokenModifier().modifyTransition(tokenName, value, description);
}

/**
 * Applies a complete token set using the global modifier
 * 
 * @param tokens - Token set to apply
 * @param description - Description of the change
 * @returns Modification result
 */
export function applyTokenSet(tokens: TokenSet, description?: string): TokenModificationResult {
  return getAgentTokenModifier().applyTokenSet(tokens, description);
}

/**
 * Undoes the last modification using the global modifier
 * 
 * @returns Undo result
 */
export function undo(): TokenModificationResult {
  return getAgentTokenModifier().undo();
}

/**
 * Redoes the last undone modification using the global modifier
 * 
 * @returns Redo result
 */
export function redo(): TokenModificationResult {
  return getAgentTokenModifier().redo();
}

/**
 * Gets the modification history from the global modifier
 * 
 * @returns History entries
 */
export function getTokenModificationHistory(): TokenHistoryEntry[] {
  return getAgentTokenModifier().getHistory();
}

/**
 * Clears the modification history from the global modifier
 */
export function clearTokenModificationHistory(): void {
  getAgentTokenModifier().clearHistory();
}