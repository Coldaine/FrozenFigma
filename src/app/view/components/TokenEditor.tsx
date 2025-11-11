/**
 * Token Editor Component
 * 
 * This component provides a UI for editing design tokens and customizing themes,
 * with support for different token categories and real-time preview.
 */

import React, { useState, useEffect } from 'react';
import { TokenSet } from '../../../schema';
import { getThemeManager } from '../../theme/themeManager';

// ============================================================================
// TOKEN EDITOR COMPONENT
// ============================================================================

/**
 * Props for the TokenEditor component
 */
interface TokenEditorProps {
  /** Initial token set to edit */
  initialTokens?: TokenSet;
  /** Callback when tokens are updated */
  onTokensChange?: (tokens: TokenSet) => void;
  /** Whether to apply changes in real-time */
  realTimePreview?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Token category types
 */
type TokenCategory = 'colors' | 'spacing' | 'typography' | 'radius' | 'shadows' | 'transitions';

/**
 * Token editor state
 */
interface TokenEditorState {
  tokens: TokenSet;
  activeCategory: TokenCategory;
  searchQuery: string;
  isPreviewMode: boolean;
}

/**
 * TokenEditor component
 */
const TokenEditor: React.FC<TokenEditorProps> = ({
  initialTokens,
  onTokensChange,
  realTimePreview = true,
  className = ''
}) => {
  // Create default tokens function here
 const createDefaultTokens = (): TokenSet => {
    return {
      colors: {
        primary: '#3b82f6',
        'primary-50': '#eff6ff',
        'primary-10': '#dbeafe',
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
  };

  const [state, setState] = useState<TokenEditorState>({
    tokens: initialTokens || createDefaultTokens(), // Use createDefaultTokens here since it's defined above
    activeCategory: 'colors',
    searchQuery: '',
    isPreviewMode: false
  });
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Update tokens when initialTokens changes
  useEffect(() => {
    if (initialTokens) {
      setState(prev => ({
        ...prev,
        tokens: initialTokens
      }));
    }
  }, [initialTokens]);

  /**
   * Handle token update
   */
 const updateToken = (category: TokenCategory, key: string, value: string | number) => {
    const newTokens = JSON.parse(JSON.stringify(state.tokens)) as TokenSet;
    
    // Handle different token categories properly
    switch (category) {
      case 'colors':
        if (!newTokens.colors) newTokens.colors = {};
        (newTokens.colors as Record<string, string>)[key] = value as string;
        break;
      case 'spacing':
        if (!newTokens.spacing) newTokens.spacing = {};
        (newTokens.spacing as Record<string, number>)[key] = value as number;
        break;
      case 'typography':
        if (!newTokens.typography) newTokens.typography = { fontFamily: 'system-ui', sizes: {}, weights: {}, lineHeights: {} };
        if (key === 'fontFamily') {
          newTokens.typography.fontFamily = value as string;
        } else if (key.startsWith('size-')) {
          if (!newTokens.typography.sizes) newTokens.typography.sizes = {};
          (newTokens.typography.sizes as Record<string, number>)[key] = value as number;
        } else if (key.startsWith('weight-')) {
          if (!newTokens.typography.weights) newTokens.typography.weights = {};
          (newTokens.typography.weights as Record<string, number>)[key] = value as number;
        }
        break;
      case 'radius':
        if (!newTokens.radius) newTokens.radius = {};
        (newTokens.radius as Record<string, number>)[key] = value as number;
        break;
      case 'shadows':
        if (!newTokens.shadows) newTokens.shadows = {};
        (newTokens.shadows as Record<string, string>)[key] = value as string;
        break;
      case 'transitions':
        if (!newTokens.transitions) newTokens.transitions = {};
        if (typeof value === 'number') {
          (newTokens.transitions as Record<string, number | string>)[key] = value;
        } else {
          (newTokens.transitions as Record<string, number | string>)[key] = value;
        }
        break;
    }
    
    setState(prev => ({
      ...prev,
      tokens: newTokens
    }));
    
    if (realTimePreview) {
      getThemeManager().applyCustomTheme(newTokens);
    }
    
    if (onTokensChange) {
      onTokensChange(newTokens);
    }
 };

  /**
   * Start editing a token
   */
  const startEditing = (category: TokenCategory, key: string, value: string | number) => {
    setIsEditing(`${category}.${key}`);
    setEditValue(value.toString());
  };

  /**
   * Save edited token
   */
  const saveEdit = (category: TokenCategory, key: string) => {
    if (isEditing) {
      const parsedValue = isColorValue(editValue) ? editValue : parseFloat(editValue);
      updateToken(category, key, isNaN(parsedValue as number) ? editValue : parsedValue);
      setIsEditing(null);
      setEditValue('');
    }
 };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setIsEditing(null);
    setEditValue('');
  };

 /**
   * Check if a value is a color
   */
  const isColorValue = (value: string): boolean => {
    // Simple check for color values (hex, rgb, hsl)
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ||
           /^rgb\(/.test(value) ||
           /^rgba\(/.test(value) ||
           /^hsl\(/.test(value) ||
           /^hsla\(/.test(value) ||
           /^[a-zA-Z]+$/.test(value); // Named colors like 'red', 'blue', etc.
  };

 /**
   * Filter tokens based on search query
   */
  const filterTokens = (tokens: Record<string, unknown>, query: string): Record<string, unknown> => {
    if (!query) return tokens;
    
  const filtered: Record<string, unknown> = {};
    const lowerQuery = query.toLowerCase();
    
    for (const [key, value] of Object.entries(tokens)) {
      const valStr = String(value).toLowerCase();
      if (key.toLowerCase().includes(lowerQuery) || valStr.includes(lowerQuery)) {
        filtered[key] = value;
      }
    }
    
    return filtered;
 };

  /**
   * Render token inputs for a category
   */
 const renderTokenInputs = (category: TokenCategory) => {
  let tokens: Record<string, unknown> | undefined;
    
    switch (category) {
      case 'colors':
        tokens = state.tokens.colors;
        break;
      case 'spacing':
        tokens = state.tokens.spacing;
        break;
      case 'typography':
        tokens = { 
          ...state.tokens.typography?.sizes, 
          ...state.tokens.typography?.weights, 
          fontFamily: state.tokens.typography?.fontFamily 
        };
        break;
      case 'radius':
        tokens = state.tokens.radius;
        break;
      case 'shadows':
        tokens = state.tokens.shadows;
        break;
      case 'transitions':
        tokens = state.tokens.transitions;
        break;
      default:
        tokens = {};
    }
    
    if (!tokens) return null;
    
  const filteredTokens = filterTokens(tokens, state.searchQuery);
    
    return (
      <div className="space-y-3">
        {Object.entries(filteredTokens).map(([key, value]) => {
          if (value === undefined || value === null) return null;
          return (
            <div key={key} className="flex items-center justify-between p-2 hover:bg-surface rounded">
              <div className="flex items-center space-x-2">
                {isColorValue(String(value)) && (
                  <div 
                    className="w-6 h-6 rounded border border-border" 
                    style={{ backgroundColor: String(value) }}
                    title={String(value)}
                  />
                )}
                <span className="text-sm font-mono">{key}</span>
              </div>
              
              {isEditing === `${category}.${key}` ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="px-2 py-1 text-sm border border-border rounded bg-background"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(category, key);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button 
                    onClick={() => saveEdit(category, key)}
                    className="text-green-600 hover:text-green-800"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="text-red-600 hover:text-red-800"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span 
                    className="px-2 py-1 text-sm bg-background border border-border rounded cursor-pointer max-w-xs truncate"
                    onClick={() => startEditing(category, key, value as string | number)}
                    title={value.toString()}
                  >
                    {String(value)}
                  </span>
                  <button 
                    onClick={() => startEditing(category, key, value as string | number)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Edit"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Apply tokens to the current theme
   */
  const applyTokens = () => {
    getThemeManager().applyCustomTheme(state.tokens);
    if (onTokensChange) {
      onTokensChange(state.tokens);
    }
 };

  /**
   * Reset to default tokens
   */
  const resetToDefault = () => {
    const defaultTokens = createDefaultTokens();
    setState(prev => ({
      ...prev,
      tokens: defaultTokens
    }));
    getThemeManager().applyCustomTheme(defaultTokens);
    if (onTokensChange) {
      onTokensChange(defaultTokens);
    }
 };

  return (
    <div className={`token-editor ${className}`}>
      <div className="bg-surface border border-border rounded-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Theme Editor</h3>
          <div className="flex space-x-2">
            <button
              onClick={applyTokens}
              className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-600"
            >
              Apply
            </button>
            <button
              onClick={resetToDefault}
              className="px-3 py-1 bg-background border border-border rounded text-sm hover:bg-surface"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tokens..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded bg-background"
          />
        </div>
        
        {/* Category tabs */}
        <div className="flex border-b border-border mb-4">
          {(['colors', 'spacing', 'typography', 'radius', 'shadows', 'transitions'] as TokenCategory[]).map((category) => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium ${
                state.activeCategory === category
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-secondary hover:text-text'
              }`}
              onClick={() => setState(prev => ({ ...prev, activeCategory: category }))}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Token editor */}
        <div className="max-h-96 overflow-y-auto pr-2">
          {renderTokenInputs(state.activeCategory)}
        </div>
      </div>
    </div>
  );
};

export default TokenEditor;