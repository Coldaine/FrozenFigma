/**
 * Theme Switcher Component
 * 
 * This component provides a UI for switching between different themes,
 * with support for system theme detection and smooth transitions.
 */

import React, { useState, useEffect } from 'react';
import { ThemePreset, THEME_PRESETS } from '../../theme/themePresets';
import { getThemeManager, getCurrentTheme, isDarkTheme, toggleTheme } from '../../theme/themeManager';

// ============================================================================
// THEME SWITCHER COMPONENT
// ============================================================================

/**
 * Props for the ThemeSwitcher component
 */
interface ThemeSwitcherProps {
  /** Whether to show the theme name (default: true) */
  showThemeName?: boolean;
  /** Whether to include system theme option (default: true) */
  includeSystemTheme?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Theme option for the dropdown
 */
interface ThemeOption {
  id: ThemePreset | 'system';
  name: string;
  icon: string;
  description: string;
  isDark?: boolean;
}

/**
 * ThemeSwitcher component
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showThemeName = true,
  includeSystemTheme = true,
 className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset | 'system'>('system');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Initialize theme
  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
    
    // Set up theme change listener if needed
    const interval = setInterval(() => {
      const theme = getCurrentTheme();
      if (theme !== currentTheme) {
        setCurrentTheme(theme);
      }
    }, 500); // Check every 500ms for theme changes
    
    return () => {
      clearInterval(interval);
    };
  }, [currentTheme]);

  /**
   * Get available theme options
   */
  const getThemeOptions = (): ThemeOption[] => {
    let options: ThemeOption[] = [
      {
        id: 'system',
        name: 'System',
        icon: '🖥️',
        description: 'Uses your system preference',
        isDark: isDarkTheme(),
      },
      ...THEME_PRESETS.map(preset => ({
        id: preset.id as ThemePreset,
        name: preset.name,
        icon: getThemeIcon(preset.id),
        description: preset.description,
        isDark: preset.isDark,
      }))
    ];
    
    if (!includeSystemTheme) {
      options = options.filter(opt => opt.id !== 'system');
    }
    
    return options;
  };

  /**
   * Get appropriate icon for a theme
   */
  const getThemeIcon = (themeId: ThemePreset | 'system'): string => {
    switch (themeId) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'high-contrast':
        return '🔍';
      case 'colorful':
        return '🎨';
      case 'minimal':
        return '◽';
      case 'pastel':
        return '🌸';
      case 'system':
        return '🖥️';
      default:
        return '🎨';
    }
  };

  /**
   * Handle theme change
   */
  const handleThemeChange = (themeId: ThemePreset | 'system') => {
    if (themeId === 'system') {
      getThemeManager().switchToSystemTheme();
    } else {
      getThemeManager().applyTheme(themeId);
    }
    setCurrentTheme(themeId);
    setIsDropdownOpen(false);
  };

  /**
   * Toggle between light and dark themes
   */
 const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

 const themeOptions = getThemeOptions();
  const currentOption = themeOptions.find(opt => opt.id === currentTheme) || themeOptions[0];
  
  return (
    <div className={`theme-switcher ${className}`}>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-md bg-surface hover:bg-background border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Change theme"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span className="text-lg">{currentOption.icon}</span>
          {showThemeName && (
            <span className="text-sm font-medium hidden sm:inline-block">
              {currentOption.name}
            </span>
          )}
          <svg 
            className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-surface ring-1 ring-border ring-opacity-5 z-50"
            role="listbox"
          >
            <div className="py-1">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id)}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-background ${
                    currentTheme === option.id ? 'bg-background font-medium' : ''
                  }`}
                  role="option"
                  aria-selected={currentTheme === option.id}
                >
                  <span className="text-lg mr-3">{option.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-secondary">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="border-t border-border py-1">
              <button
                onClick={handleToggleTheme}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-background"
              >
                <span className="text-lg mr-3">{isDarkTheme() ? '☀️' : '🌙'}</span>
                <span>Toggle to {isDarkTheme() ? 'light' : 'dark'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSwitcher;