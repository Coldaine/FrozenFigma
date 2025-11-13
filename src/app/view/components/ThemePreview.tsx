/**
 * Theme Preview Component
 * 
 * This component provides a preview of themes with sample UI elements,
 * allowing users to see how themes will look before applying them.
 */

import React, { useState, useEffect } from 'react';
import { TokenSet } from '../../../schema';
import { tokensToCSSVariables } from '../../theme/themeUtils';
import { getThemeManager } from '../../theme/themeManager';
import './ThemePreview.css';

// ============================================================================
// THEME PREVIEW COMPONENT
// ============================================================================

/**
 * Props for the ThemePreview component
 */
interface ThemePreviewProps {
  /** Token set to preview */
  tokens: TokenSet;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the preview in a modal */
  isModal?: boolean;
  /** Callback when preview is closed */
  onClose?: () => void;
}

/**
 * ThemePreview component
 */
const ThemePreview: React.FC<ThemePreviewProps> = ({
  tokens,
  className = '',
  isModal = false,
  onClose
}) => {
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});
  const [previewTokens, setPreviewTokens] = useState<TokenSet>(tokens);

  // Update CSS variables when tokens change
  useEffect(() => {
    setPreviewTokens(tokens);
    const vars = tokensToCSSVariables(tokens);
    setCssVariables(vars);
 }, [tokens]);

  /**
   * Apply the previewed theme
   */
  const applyTheme = () => {
    getThemeManager().applyCustomTheme(previewTokens);
    if (onClose) onClose();
 };

  /**
   * Close the preview (if modal)
   */
  const handleClose = () => {
    if (onClose) onClose();
 };

  // Create a style object from CSS variables
  const previewStyle: React.CSSProperties = {
    '--ff-color-primary': tokens.colors?.primary || '#3b82f6',
    '--ff-color-bg-surface': tokens.colors?.['bg-surface'] || '#f8fafc',
    '--ff-color-text-primary': tokens.colors?.['text-primary'] || '#0f172a',
    '--ff-color-border-base': tokens.colors?.['border-base'] || '#e2e8f0',
    '--ff-spacing-md': `${tokens.spacing?.md || 16}px`,
    '--ff-radius-md': `${tokens.radius?.md || 6}px`,
    ...Object.fromEntries(
      Object.entries(cssVariables).map(([key, value]) => [key, value])
    )
  } as React.CSSProperties;

  return (
    <div 
      className={`theme-preview ${isModal ? 'theme-preview-modal' : ''} ${className}`}
      style={previewStyle}
    >
      {isModal && (
        <div className="theme-preview-overlay" onClick={handleClose}>
          <div className="theme-preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="theme-preview-header">
              <h3>Theme Preview</h3>
              <button className="theme-preview-close" onClick={handleClose}>✕</button>
            </div>
            <div className="theme-preview-body">
              {renderPreviewContent()}
            </div>
            <div className="theme-preview-footer">
              <button className="theme-preview-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button className="theme-preview-apply" onClick={applyTheme}>
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isModal && (
        <div className="theme-preview-content">
          <div className="theme-preview-header">
            <h3>Theme Preview</h3>
          </div>
          <div className="theme-preview-body">
            {renderPreviewContent()}
          </div>
          <div className="theme-preview-footer">
            <button className="theme-preview-apply" onClick={applyTheme}>
              Apply Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render the preview content with sample UI elements
   */
  function renderPreviewContent() {
    return (
      <div className="theme-preview-components">
        {/* Color swatches */}
        <div className="theme-preview-section">
          <h4>Colors</h4>
          <div className="color-swatches">
            {tokens.colors && Object.entries(tokens.colors).slice(0, 8).map(([name, value]) => (
              <div key={name} className="color-swatch" title={`${name}: ${value}`}>
                <div 
                  className="color-swatch-box" 
                  style={{ backgroundColor: value as string }}
                />
                <span className="color-swatch-name">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="theme-preview-section">
          <h4>Typography</h4>
          <div className="typography-samples">
            <h1 style={{ fontFamily: tokens.typography?.fontFamily || 'system-ui' }}>Heading 1</h1>
            <h2 style={{ fontFamily: tokens.typography?.fontFamily || 'system-ui' }}>Heading 2</h2>
            <h3 style={{ fontFamily: tokens.typography?.fontFamily || 'system-ui' }}>Heading 3</h3>
            <p style={{ fontFamily: tokens.typography?.fontFamily || 'system-ui' }}>
              This is a paragraph with the theme&apos;s default font family. It demonstrates how text will appear with the selected theme.
            </p>
            <small style={{ fontFamily: tokens.typography?.fontFamily || 'system-ui' }}>
              This is small text to show the theme&apos;s smaller font size.
            </small>
          </div>
        </div>

        {/* Components */}
        <div className="theme-preview-section">
          <h4>Components</h4>
          <div className="component-samples">
            {/* Button */}
            <div className="component-group">
              <h5>Buttons</h5>
              <div className="button-samples">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button className="btn-outline">Outline Button</button>
              </div>
            </div>

            {/* Input fields */}
            <div className="component-group">
              <h5>Inputs</h5>
              <div className="input-samples">
                <input type="text" placeholder="Text input" className="input-field" />
                <input type="text" placeholder="Disabled input" className="input-field" disabled />
              </div>
            </div>

            {/* Card */}
            <div className="component-group">
              <h5>Card</h5>
              <div className="card-sample">
                <div className="card-header">
                  <h4>Card Title</h4>
                </div>
                <div className="card-body">
                  <p>This is a sample card component showing how the theme affects card elements.</p>
                </div>
                <div className="card-footer">
                  <button className="btn-secondary btn-sm">Action</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="theme-preview-section">
          <h4>Spacing</h4>
          <div className="spacing-samples">
            <div className="spacing-sample" style={{ margin: 'var(--ff-spacing-xs, 8px)' }}>XS Spacing</div>
            <div className="spacing-sample" style={{ margin: 'var(--ff-spacing-sm, 12px)' }}>SM Spacing</div>
            <div className="spacing-sample" style={{ margin: 'var(--ff-spacing-md, 16px)' }}>MD Spacing</div>
            <div className="spacing-sample" style={{ margin: 'var(--ff-spacing-lg, 24px)' }}>LG Spacing</div>
            <div className="spacing-sample" style={{ margin: 'var(--ff-spacing-xl, 32px)' }}>XL Spacing</div>
          </div>
        </div>
      </div>
    );
  }
};

export default ThemePreview;