import { useState } from 'react';
import Canvas from './Canvas';
import Inspector from './Inspector';
import Library from './Library';
import Console from './Console';
import CommandBar from './CommandBar';
import './App.css';

/**
 * Main App component - Orchestrates the entire FrozenFigma UI.
 * 
 * Layout structure:
 * ┌─────────────────────────────────────────────┐
 * │ Header (Title + Theme Toggle)               │
 * ├──────────────┬──────────────┬───────────────┤
 * │ Library      │   Canvas     │   Inspector   │
 * │ (component   │ (renders     │ (selected     │
 * │ templates)   │ graph)       │ node props)   │
 * ├──────────────┴──────────────┴───────────────┤
 * │ Console (command input + logs)              │
 * └─────────────────────────────────────────────┘
 * 
 * + CommandBar (Cmd/Ctrl+K overlay)
 */
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="app-container h-screen flex flex-col bg-background text-text">
      {/* Header */}
      <header className="app-header px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">FrozenFigma</h1>
          <p className="text-sm text-secondary">Local Functional Mock-Up Builder</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-background hover:bg-border border border-border rounded-md transition-colors flex items-center space-x-2"
            title="Toggle theme"
          >
            <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="text-sm font-medium">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          
          {/* Keyboard shortcut hint */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-secondary">
            <kbd className="px-2 py-1 bg-background border border-border rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
            </kbd>
            <span>Commands</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="app-main flex-1 flex overflow-hidden">
        {/* Library panel (left) */}
        <div className="w-80 flex-shrink-0">
          <Library />
        </div>

        {/* Canvas area (center) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>

          {/* Console (bottom) */}
          <div className="h-64 flex-shrink-0 border-t border-border">
            <Console />
          </div>
        </div>

        {/* Inspector panel (right) */}
        <div className="w-96 flex-shrink-0">
          <Inspector />
        </div>
      </div>

      {/* Command Palette (overlay) */}
      <CommandBar />

      {/* Version info (fixed bottom-left) */}
      <div className="fixed bottom-2 left-2 px-2 py-1 bg-surface/80 backdrop-blur-sm border border-border rounded text-xs text-secondary">
        v0.0.0
      </div>
    </div>
  );
}

export default App;