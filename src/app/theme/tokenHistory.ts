/**
 * Token Change Tracking and History
 * 
 * This module provides functionality for tracking token changes and maintaining
 * a history of token modifications for undo/redo functionality and audit trails.
 */

import { TokenSet, Command, SetTokensCommand } from '../../schema';
import { validateTokens } from './themeUtils';

// ============================================================================
// TOKEN CHANGE TRACKING AND HISTORY
// ============================================================================

/**
 * Token history entry
 */
export interface TokenHistoryEntry {
  /** Unique identifier for the history entry */
  id: string;
  /** Timestamp of the change */
  timestamp: number;
  /** Type of change */
  type: 'set' | 'update' | 'reset' | 'import' | 'custom';
  /** Description of the change */
  description: string;
  /** Token set before the change */
  before: TokenSet | null;
  /** Token set after the change */
  after: TokenSet | null;
  /** Command that caused the change (if applicable) */
  command?: Command;
  /** User who made the change (if available) */
  user?: string;
  /** Tags associated with the change */
  tags?: string[];
}

/**
 * Token history options
 */
export interface TokenHistoryOptions {
  /** Maximum number of history entries to keep */
  maxSize?: number;
  /** Whether to automatically save history entries */
  autoSave?: boolean;
  /** Key for localStorage persistence */
  persistenceKey?: string;
  /** Whether to track user information */
  trackUser?: boolean;
  /** Whether to validate tokens before saving to history */
  validateTokens?: boolean;
}

/**
 * Token history manager
 */
export class TokenHistoryManager {
  private history: TokenHistoryEntry[] = [];
  private currentIndex: number = -1;
  private options: Required<TokenHistoryOptions>;
  private currentUser: string | null = null;
  
  constructor(options?: TokenHistoryOptions) {
    this.options = {
      maxSize: options?.maxSize || 50,
      autoSave: options?.autoSave !== false,
      persistenceKey: options?.persistenceKey || 'frozenfigma-token-history',
      trackUser: !!options?.trackUser,
      validateTokens: options?.validateTokens !== false,
    };
    
    // Load history from persistence if enabled
    this.loadFromPersistence();
  }
  
  /**
   * Records a token change in history
   * 
   * @param type - Type of change
   * @param description - Description of the change
   * @param before - Token set before the change
   * @param after - Token set after the change
   * @param command - Command that caused the change (optional)
   * @param tags - Tags associated with the change (optional)
   */
  public recordChange(
    type: TokenHistoryEntry['type'],
    description: string,
    before: TokenSet | null,
    after: TokenSet | null,
    command?: Command,
    tags?: string[]
  ): void {
    // Validate tokens if requested
    if (this.options.validateTokens) {
      if (before) {
        const beforeValidation = validateTokens(before);
        if (!beforeValidation.success) {
          console.warn('Invalid before tokens in history entry:', beforeValidation.errors);
        }
      }
      
      if (after) {
        const afterValidation = validateTokens(after);
        if (!afterValidation.success) {
          console.warn('Invalid after tokens in history entry:', afterValidation.errors);
        }
      }
    }
    
    // Create history entry
    const entry: TokenHistoryEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      description,
      before,
      after,
      command,
      tags,
    };
    
    // Add user information if tracking is enabled
    if (this.options.trackUser && this.currentUser) {
      entry.user = this.currentUser;
    }
    
    // If we're not at the end of history, truncate everything after current index
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add the new entry
    this.history.push(entry);
    this.currentIndex = this.history.length - 1;
    
    // Trim history if it exceeds max size
    if (this.history.length > this.options.maxSize) {
      const excess = this.history.length - this.options.maxSize;
      this.history = this.history.slice(excess);
      this.currentIndex = this.history.length - 1;
    }
    
    // Save to persistence if enabled
    if (this.options.autoSave) {
      this.saveToPersistence();
    }
  }
  
  /**
   * Records a SET_TOKENS command in history
   * 
   * @param command - SET_TOKENS command
   * @param before - Token set before the change
   * @param after - Token set after the change
   */
  public recordSetTokensCommand(
    command: SetTokensCommand,
    before: TokenSet | null,
    after: TokenSet | null
  ): void {
    // Extract theme name from command if available
    let themeName = 'custom theme';
    if (command.tokens && command.tokens.colors && command.tokens.colors.primary) {
      themeName = 'custom theme';
    }
    
    this.recordChange(
      'set',
      `Set tokens to ${themeName}`,
      before,
      after,
      command,
      ['tokens', 'set']
    );
  }
  
  /**
   * Records a token update in history
   * 
   * @param tokenPath - Path to the updated token
   * @param oldValue - Old value of the token
   * @param newValue - New value of the token
   * @param before - Token set before the change
   * @param after - Token set after the change
   */
  public recordTokenUpdate(
    tokenPath: string,
    oldValue: string | number,
    newValue: string | number,
    before: TokenSet | null,
    after: TokenSet | null
  ): void {
    this.recordChange(
      'update',
      `Updated token ${tokenPath} from ${oldValue} to ${newValue}`,
      before,
      after,
      undefined,
      ['tokens', 'update', tokenPath]
    );
  }
  
  /**
   * Records a theme reset in history
   * 
   * @param themeName - Name of the theme that was reset to
   * @param before - Token set before the change
   * @param after - Token set after the change
   */
  public recordThemeReset(
    themeName: string,
    before: TokenSet | null,
    after: TokenSet | null
  ): void {
    this.recordChange(
      'reset',
      `Reset to ${themeName} theme`,
      before,
      after,
      undefined,
      ['theme', 'reset', themeName]
    );
  }
  
  /**
   * Records a token import in history
   * 
   * @param source - Source of the import (file name, URL, etc.)
   * @param before - Token set before the change
   * @param after - Token set after the change
   */
  public recordTokenImport(
    source: string,
    before: TokenSet | null,
    after: TokenSet | null
  ): void {
    this.recordChange(
      'import',
      `Imported tokens from ${source}`,
      before,
      after,
      undefined,
      ['tokens', 'import', source]
    );
  }
  
  /**
   * Records a custom change in history
   * 
   * @param description - Description of the change
   * @param before - Token set before the change
   * @param after - Token set after the change
   * @param tags - Tags associated with the change
   */
  public recordCustomChange(
    description: string,
    before: TokenSet | null,
    after: TokenSet | null,
    tags?: string[]
  ): void {
    this.recordChange(
      'custom',
      description,
      before,
      after,
      undefined,
      ['custom', ...(tags || [])]
    );
  }
  
  /**
   * Gets the current history
   * 
   * @returns Copy of the current history
   */
  public getHistory(): TokenHistoryEntry[] {
    return [...this.history];
  }
  
  /**
   * Gets a specific history entry by ID
   * 
   * @param id - ID of the history entry to get
   * @returns History entry or undefined if not found
   */
  public getHistoryEntry(id: string): TokenHistoryEntry | undefined {
    return this.history.find(entry => entry.id === id);
  }
  
  /**
   * Gets history entries filtered by tags
   * 
   * @param tags - Tags to filter by
   * @returns Filtered history entries
   */
  public getHistoryByTags(tags: string[]): TokenHistoryEntry[] {
    return this.history.filter(entry => 
      entry.tags && tags.some(tag => entry.tags!.includes(tag))
    );
  }
  
  /**
   * Gets history entries within a time range
   * 
   * @param startTime - Start time (inclusive)
   * @param endTime - End time (inclusive)
   * @returns History entries within the time range
   */
  public getHistoryByTimeRange(startTime: number, endTime: number): TokenHistoryEntry[] {
    return this.history.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }
  
  /**
   * Gets the previous history entry (for undo)
   * 
   * @returns Previous history entry or null if at beginning
   */
  public getPreviousEntry(): TokenHistoryEntry | null {
    if (this.currentIndex <= 0) {
      return null;
    }
    
    return this.history[this.currentIndex - 1] || null;
  }
  
  /**
   * Gets the next history entry (for redo)
   * 
   * @returns Next history entry or null if at end
   */
  public getNextEntry(): TokenHistoryEntry | null {
    if (this.currentIndex >= this.history.length - 1) {
      return null;
    }
    
    return this.history[this.currentIndex + 1] || null;
  }
  
  /**
   * Moves to the previous history entry (for undo)
   * 
   * @returns Previous history entry or null if at beginning
   */
  public moveToPreviousEntry(): TokenHistoryEntry | null {
    if (this.currentIndex <= 0) {
      return null;
    }
    
    this.currentIndex--;
    return this.history[this.currentIndex] || null;
  }
  
  /**
   * Moves to the next history entry (for redo)
   * 
   * @returns Next history entry or null if at end
   */
  public moveToNextEntry(): TokenHistoryEntry | null {
    if (this.currentIndex >= this.history.length - 1) {
      return null;
    }
    
    this.currentIndex++;
    return this.history[this.currentIndex] || null;
  }
  
  /**
   * Clears the history
   */
  public clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    
    // Clear persistence if enabled
    if (this.options.autoSave) {
      this.clearPersistence();
    }
  }
  
  /**
   * Sets the current user for tracking
   * 
   * @param user - User identifier
   */
  public setCurrentUser(user: string): void {
    this.currentUser = user;
  }
  
  /**
   * Gets the current user
   * 
   * @returns Current user or null if not set
   */
  public getCurrentUser(): string | null {
    return this.currentUser;
  }
  
  /**
   * Generates a unique ID for history entries
   * 
   * @returns Unique ID
   */
  private generateId(): string {
    return `th-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Saves history to persistence
   */
  private saveToPersistence(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Only save a limited amount of history to avoid storage issues
        const historyToSave = this.history.slice(-20); // Save only last 20 entries
        const serialized = JSON.stringify(historyToSave);
        window.localStorage.setItem(this.options.persistenceKey, serialized);
      } catch (error) {
        console.warn('Failed to save token history to localStorage:', error);
      }
    }
  }
  
  /**
   * Loads history from persistence
   */
  private loadFromPersistence(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const serialized = window.localStorage.getItem(this.options.persistenceKey);
        if (serialized) {
          const parsed = JSON.parse(serialized);
          if (Array.isArray(parsed)) {
            this.history = parsed;
            this.currentIndex = this.history.length - 1;
          }
        }
      } catch (error) {
        console.warn('Failed to load token history from localStorage:', error);
      }
    }
  }
  
  /**
   * Clears persistence
   */
  private clearPersistence(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(this.options.persistenceKey);
      } catch (error) {
        console.warn('Failed to clear token history from localStorage:', error);
      }
    }
  }
}

/**
 * Global token history manager instance
 */
let tokenHistoryManager: TokenHistoryManager | null = null;

/**
 * Gets the global token history manager instance
 * 
 * @param options - Options for the token history manager
 * @returns Token history manager instance
 */
export function getTokenHistoryManager(options?: TokenHistoryOptions): TokenHistoryManager {
  if (!tokenHistoryManager) {
    tokenHistoryManager = new TokenHistoryManager(options);
  }
  return tokenHistoryManager;
}

/**
 * Initializes the token history manager with options
 * 
 * @param options - Options for the token history manager
 */
export function initTokenHistoryManager(options?: TokenHistoryOptions): void {
  if (tokenHistoryManager) {
    // Clear history when reinitializing
    tokenHistoryManager.clearHistory();
  }
  tokenHistoryManager = new TokenHistoryManager(options);
}

/**
 * Records a SET_TOKENS command in the global history
 * 
 * @param command - SET_TOKENS command
 * @param before - Token set before the change
 * @param after - Token set after the change
 */
export function recordSetTokensCommand(
  command: SetTokensCommand,
  before: TokenSet | null,
  after: TokenSet | null
): void {
  getTokenHistoryManager().recordSetTokensCommand(command, before, after);
}

/**
 * Records a token update in the global history
 * 
 * @param tokenPath - Path to the updated token
 * @param oldValue - Old value of the token
 * @param newValue - New value of the token
 * @param before - Token set before the change
 * @param after - Token set after the change
 */
export function recordTokenUpdate(
  tokenPath: string,
  oldValue: string | number,
  newValue: string | number,
  before: TokenSet | null,
  after: TokenSet | null
): void {
  getTokenHistoryManager().recordTokenUpdate(tokenPath, oldValue, newValue, before, after);
}

/**
 * Records a theme reset in the global history
 * 
 * @param themeName - Name of the theme that was reset to
 * @param before - Token set before the change
 * @param after - Token set after the change
 */
export function recordThemeReset(
  themeName: string,
  before: TokenSet | null,
  after: TokenSet | null
): void {
  getTokenHistoryManager().recordThemeReset(themeName, before, after);
}

/**
 * Records a token import in the global history
 * 
 * @param source - Source of the import (file name, URL, etc.)
 * @param before - Token set before the change
 * @param after - Token set after the change
 */
export function recordTokenImport(
  source: string,
  before: TokenSet | null,
  after: TokenSet | null
): void {
  getTokenHistoryManager().recordTokenImport(source, before, after);
}

/**
 * Records a custom change in the global history
 * 
 * @param description - Description of the change
 * @param before - Token set before the change
 * @param after - Token set after the change
 * @param tags - Tags associated with the change
 */
export function recordCustomChange(
  description: string,
  before: TokenSet | null,
  after: TokenSet | null,
  tags?: string[]
): void {
  getTokenHistoryManager().recordCustomChange(description, before, after, tags);
}

/**
 * Gets the current history from the global manager
 * 
 * @returns Copy of the current history
 */
export function getTokenHistory(): TokenHistoryEntry[] {
  return getTokenHistoryManager().getHistory();
}

/**
 * Gets a specific history entry by ID from the global manager
 * 
 * @param id - ID of the history entry to get
 * @returns History entry or undefined if not found
 */
export function getTokenHistoryEntry(id: string): TokenHistoryEntry | undefined {
  return getTokenHistoryManager().getHistoryEntry(id);
}

/**
 * Gets history entries filtered by tags from the global manager
 * 
 * @param tags - Tags to filter by
 * @returns Filtered history entries
 */
export function getTokenHistoryByTags(tags: string[]): TokenHistoryEntry[] {
  return getTokenHistoryManager().getHistoryByTags(tags);
}

/**
 * Gets history entries within a time range from the global manager
 * 
 * @param startTime - Start time (inclusive)
 * @param endTime - End time (inclusive)
 * @returns History entries within the time range
 */
export function getTokenHistoryByTimeRange(startTime: number, endTime: number): TokenHistoryEntry[] {
  return getTokenHistoryManager().getHistoryByTimeRange(startTime, endTime);
}

/**
 * Clears the history in the global manager
 */
export function clearTokenHistory(): void {
  getTokenHistoryManager().clearHistory();
}

/**
 * Sets the current user for tracking in the global manager
 * 
 * @param user - User identifier
 */
export function setTokenHistoryUser(user: string): void {
  getTokenHistoryManager().setCurrentUser(user);
}

/**
 * Gets the current user from the global manager
 * 
 * @returns Current user or null if not set
 */
export function getTokenHistoryUser(): string | null {
  return getTokenHistoryManager().getCurrentUser();
}

/**
 * Gets the previous history entry (for undo) from the global manager
 * 
 * @returns Previous history entry or null if at beginning
 */
export function getPreviousTokenHistoryEntry(): TokenHistoryEntry | null {
  return getTokenHistoryManager().getPreviousEntry();
}

/**
 * Gets the next history entry (for redo) from the global manager
 * 
 * @returns Next history entry or null if at end
 */
export function getNextTokenHistoryEntry(): TokenHistoryEntry | null {
  return getTokenHistoryManager().getNextEntry();
}

/**
 * Moves to the previous history entry (for undo) in the global manager
 * 
 * @returns Previous history entry or null if at beginning
 */
export function moveToPreviousTokenHistoryEntry(): TokenHistoryEntry | null {
  return getTokenHistoryManager().moveToPreviousEntry();
}

/**
 * Moves to the next history entry (for redo) in the global manager
 * 
 * @returns Next history entry or null if at end
 */
export function moveToNextTokenHistoryEntry(): TokenHistoryEntry | null {
  return getTokenHistoryManager().moveToNextEntry();
}

/**
 * Exports token history to JSON
 * 
 * @param history - History to export (defaults to current history)
 * @returns JSON string representation of the history
 */
export function exportTokenHistory(history?: TokenHistoryEntry[]): string {
  const historyToExport = history || getTokenHistory();
  return JSON.stringify(historyToExport, null, 2);
}

/**
 * Imports token history from JSON
 * 
 * @param json - JSON string representation of the history
 * @returns Parsed history entries
 */
export function importTokenHistory(json: string): TokenHistoryEntry[] {
  return JSON.parse(json);
}

/**
 * Filters token history by date range
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Filtered history entries
 */
export function filterTokenHistoryByDate(startDate: Date, endDate: Date): TokenHistoryEntry[] {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  
  return getTokenHistory().filter(entry => 
    entry.timestamp >= startTime && entry.timestamp <= endTime
  );
}

/**
 * Filters token history by user
 * 
 * @param user - User to filter by
 * @returns Filtered history entries
 */
export function filterTokenHistoryByUser(user: string): TokenHistoryEntry[] {
  return getTokenHistory().filter(entry => entry.user === user);
}

/**
 * Filters token history by change type
 * 
 * @param type - Change type to filter by
 * @returns Filtered history entries
 */
export function filterTokenHistoryByType(type: TokenHistoryEntry['type']): TokenHistoryEntry[] {
  return getTokenHistory().filter(entry => entry.type === type);
}

/**
 * Gets statistics about token history
 * 
 * @returns History statistics
 */
export function getTokenHistoryStatistics(): {
  totalEntries: number;
  entriesByType: Record<TokenHistoryEntry['type'], number>;
  entriesByUser: Record<string, number>;
  firstEntryTimestamp: number | null;
  lastEntryTimestamp: number | null;
} {
  const history = getTokenHistory();
  
  const stats = {
    totalEntries: history.length,
    entriesByType: {} as Record<TokenHistoryEntry['type'], number>,
    entriesByUser: {} as Record<string, number>,
    firstEntryTimestamp: history.length > 0 ? history[0].timestamp : null,
    lastEntryTimestamp: history.length > 0 ? history[history.length - 1].timestamp : null,
  };
  
  // Count entries by type
  for (const entry of history) {
    stats.entriesByType[entry.type] = (stats.entriesByType[entry.type] || 0) + 1;
    
    if (entry.user) {
      stats.entriesByUser[entry.user] = (stats.entriesByUser[entry.user] || 0) + 1;
    }
  }
  
  return stats;
}