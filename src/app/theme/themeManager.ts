/**
 * Theme Manager
 * 
 * This module provides functionality for theme switching with smooth transitions
 * and system theme detection capabilities.
 */

import { TokenSet } from '../../schema';
import { applyTokensToDOM, tokensToCSSVariables } from './themeUtils';
import { ThemePreset, getThemePreset } from './themePresets';

// ============================================================================
// THEME MANAGER
// ============================================================================

/**
 * Theme manager configuration options
 */
export interface ThemeManagerConfig {
  /** CSS variable prefix (default: 'ff') */
  prefix?: string;
  /** Transition duration in milliseconds (default: 300) */
  transitionDuration?: number;
  /** Whether to persist theme preference to localStorage */
  persist?: boolean;
  /** Key for localStorage persistence (default: 'frozenfigma-theme') */
  persistenceKey?: string;
}

/**
 * Theme manager class for handling theme switching
 */
export class ThemeManager {
  private currentTheme: ThemePreset | 'system' = 'system';
  private prefix: string;
  private transitionDuration: number;
  private persist: boolean;
  private persistenceKey: string;
 private systemTheme: 'light' | 'dark' = 'light';
  private observer: MediaQueryList | null = null;

  constructor(config?: ThemeManagerConfig) {
    this.prefix = config?.prefix || 'ff';
    this.transitionDuration = config?.transitionDuration || 300;
    this.persist = config?.persist !== false; // Default to true
    this.persistenceKey = config?.persistenceKey || 'frozenfigma-theme';
    
    // Set up system theme detection
    this.setupSystemThemeDetection();
    
    // Initialize from persistence if available
    this.initializeFromPersistence();
  }

  /**
   * Sets up system theme detection using matchMedia
   */
  private setupSystemThemeDetection(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      // Check initial system preference
      this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      // Listen for changes to system theme preference
      this.observer = window.matchMedia('(prefers-color-scheme: dark)');
      this.observer.addEventListener('change', (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light';
        
        // If current theme is 'system', apply the new system theme
        if (this.currentTheme === 'system') {
          this.applyTheme(this.systemTheme as ThemePreset);
        }
      });
    }
  }

  /**
   * Initializes theme from localStorage if persistence is enabled
   */
  private initializeFromPersistence(): void {
    if (this.persist && typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = window.localStorage.getItem(this.persistenceKey) as ThemePreset | 'system' | null;
      if (savedTheme) {
        this.currentTheme = savedTheme;
      }
    }
    
    // Apply the initial theme
    this.applyCurrentTheme();
  }

  /**
   * Applies the current theme based on the theme setting
   */
  private applyCurrentTheme(): void {
    if (this.currentTheme === 'system') {
      this.applyTheme(this.systemTheme as ThemePreset);
    } else {
      this.applyTheme(this.currentTheme);
    }
  }

  /**
   * Applies a specific theme
   * 
   * @param themeId - The theme preset ID to apply
   */
  public applyTheme(themeId: ThemePreset): void {
    const themePreset = getThemePreset(themeId);
    if (!themePreset) {
      console.warn(`Theme preset "${themeId}" not found`);
      return;
    }
    
    // Apply smooth transition
    this.setTransition();
    
    // Apply tokens to DOM
    applyTokensToDOM(themePreset.tokens, this.prefix);
    
    // Update document data-theme attribute
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
    }
    
    // Persist the theme if enabled
    if (this.persist && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.persistenceKey, themeId);
    }
    
    // Update current theme
    this.currentTheme = themeId;
  }

  /**
   * Switches to system theme preference
   */
  public switchToSystemTheme(): void {
    this.currentTheme = 'system';
    
    // Apply the current system theme
    this.applyCurrentTheme();
    
    // Persist the theme if enabled
    if (this.persist && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.persistenceKey, 'system');
    }
 }

  /**
   * Sets up CSS transitions for smooth theme switching
   */
  private setTransition(): void {
    if (typeof document !== 'undefined') {
      // Apply transition to all elements that might change color
      document.documentElement.style.setProperty(
        'transition',
        `background-color ${this.transitionDuration}ms ease, color ${this.transitionDuration}ms ease, border-color ${this.transitionDuration}ms ease`
      );
      
      // Clear transition after it completes to avoid unwanted transitions on other changes
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.style.removeProperty('transition');
        }
      }, this.transitionDuration);
    }
  }

  /**
   * Gets the currently active theme
   * 
   * @returns The current theme preset or 'system'
   */
  public getCurrentTheme(): ThemePreset | 'system' {
    return this.currentTheme;
  }

  /**
   * Gets the effective theme (resolves 'system' to actual theme)
   * 
   * @returns The effective theme preset
   */
  public getEffectiveTheme(): ThemePreset {
    return this.currentTheme === 'system' ? this.systemTheme as ThemePreset : this.currentTheme;
  }

  /**
   * Gets the current theme's tokens
   * 
   * @returns The current theme's token set
   */
  public getCurrentTokens(): TokenSet | null {
    if (this.currentTheme === 'system') {
      const themePreset = getThemePreset(this.systemTheme as ThemePreset);
      return themePreset ? themePreset.tokens : null;
    } else {
      const themePreset = getThemePreset(this.currentTheme);
      return themePreset ? themePreset.tokens : null;
    }
  }

  /**
   * Gets the current theme's CSS variables
   * 
   * @returns The current theme's CSS variables
   */
  public getCurrentCSSVariables(): Record<string, string> {
    const tokens = this.getCurrentTokens();
    if (!tokens) {
      return {};
    }
    
    return tokensToCSSVariables(tokens, this.prefix);
  }

  /**
   * Checks if the current theme is dark
   * 
   * @returns True if the current theme is dark, false otherwise
   */
  public isDarkTheme(): boolean {
    if (this.currentTheme === 'system') {
      return this.systemTheme === 'dark';
    }
    
    const themePreset = getThemePreset(this.currentTheme);
    return themePreset?.isDark || false;
  }

  /**
   * Toggles between light and dark themes
   * 
   * @returns The new theme after toggling
   */
  public toggleTheme(): ThemePreset {
    const currentIsDark = this.isDarkTheme();
    const newTheme = currentIsDark ? 'light' : 'dark';
    
    this.applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Updates a specific token value and re-applies theme
   * 
   * @param tokenPath - Path to the token (e.g. 'colors.primary')
   * @param value - New value for the token
   */
  public updateToken(tokenPath: string, value: string | number): void {
    // Get current tokens
    const currentTokens = this.getCurrentTokens();
    if (!currentTokens) {
      console.warn('Could not get current tokens to update');
      return;
    }
    
    // Create a copy of current tokens
    const updatedTokens = JSON.parse(JSON.stringify(currentTokens)) as TokenSet;
    
    // Navigate to the token and update its value
    const pathParts = tokenPath.split('.');
    let current: any = updatedTokens;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Update the final value
    const finalPart = pathParts[pathParts.length - 1];
    current[finalPart] = value;
    
    // Apply the updated tokens
    this.setTransition();
    applyTokensToDOM(updatedTokens, this.prefix);
  }

  /**
   * Applies a custom token set as a theme
   * 
   * @param tokens - The custom token set to apply
   * @param themeName - Optional name for the custom theme
   */
  public applyCustomTheme(tokens: TokenSet, themeName: string = 'custom'): void {
    // Apply smooth transition
    this.setTransition();
    
    // Apply tokens to DOM
    applyTokensToDOM(tokens, this.prefix);
    
    // Update document data-theme attribute
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    
    // For custom themes, we don't persist the tokens themselves,
    // just the fact that we're using a custom theme
    if (this.persist && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.persistenceKey, themeName as ThemePreset);
    }
    
    // Update current theme to a custom identifier
    this.currentTheme = themeName as ThemePreset;
  }

  /**
   * Destroys the theme manager and cleans up resources
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.removeEventListener('change', () => {});
      this.observer = null;
    }
  }
}

/**
 * Global theme manager instance
 */
let themeManager: ThemeManager | null = null;

/**
 * Gets the global theme manager instance
 * 
 * @param config - Optional configuration for the theme manager
 * @returns The theme manager instance
 */
export function getThemeManager(config?: ThemeManagerConfig): ThemeManager {
  if (!themeManager) {
    themeManager = new ThemeManager(config);
  }
  return themeManager;
}

/**
 * Initializes the theme manager with configuration
 * 
 * @param config - Configuration for the theme manager
 */
export function initThemeManager(config?: ThemeManagerConfig): void {
  if (themeManager) {
    themeManager.destroy();
 }
  themeManager = new ThemeManager(config);
}

/**
 * Gets the current theme from the global theme manager
 * 
 * @returns The current theme preset or 'system'
 */
export function getCurrentTheme(): ThemePreset | 'system' {
  return getThemeManager().getCurrentTheme();
}

/**
 * Gets the effective theme from the global theme manager
 * 
 * @returns The effective theme preset
 */
export function getEffectiveTheme(): ThemePreset {
  return getThemeManager().getEffectiveTheme();
}

/**
 * Applies a theme using the global theme manager
 * 
 * @param themeId - The theme preset ID to apply
 */
export function applyTheme(themeId: ThemePreset): void {
  getThemeManager().applyTheme(themeId);
}

/**
 * Switches to system theme preference using the global theme manager
 */
export function switchToSystemTheme(): void {
  getThemeManager().switchToSystemTheme();
}

/**
 * Toggles between light and dark themes using the global theme manager
 * 
 * @returns The new theme after toggling
 */
export function toggleTheme(): ThemePreset {
  return getThemeManager().toggleTheme();
}

/**
 * Checks if the current theme is dark using the global theme manager
 * 
 * @returns True if the current theme is dark, false otherwise
 */
export function isDarkTheme(): boolean {
  return getThemeManager().isDarkTheme();
}

/**
 * Gets the current tokens from the global theme manager
 * 
 * @returns The current theme's token set
 */
export function getCurrentTokens(): TokenSet | null {
  return getThemeManager().getCurrentTokens();
}