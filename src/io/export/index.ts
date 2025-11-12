import { ComponentSpec, Graph, TokenSet, ComponentType } from '../../schema';

// Helper alias for typed props used in TSX generators
type PropsRecord = Record<string, unknown>;

// ============================================================================
// EXPORT TYPES & INTERFACES
// ============================================================================

/**
 * Options for exporting components.
 */
export interface ExportOptions {
  format?: 'tsx' | 'jsx' | 'vue' | 'svelte'; // Default is 'tsx'
  includeTokens?: boolean;
  includeStyles?: boolean;
  componentFilter?: (component: ComponentSpec) => boolean;
  basePath?: string; // Base path for exports
}

/**
 * Represents the result of an export operation.
 */
export interface ExportResult {
  success: boolean;
  exportedFiles: string[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// REACT TSX GENERATION
// ============================================================================

/**
 * Generates a React TSX component from a ComponentSpec.
 * 
 * @param component - The component specification to convert
 * @param tokens - Optional design tokens to apply
 * @returns Generated TSX code as a string
 */
export function generateTSX(component: ComponentSpec, tokens?: TokenSet): string {
  const { type, props } = component;
  
  // Generate component-specific TSX based on component type
  let componentCode = '';
  
  switch (type) {
    case 'button':
      componentCode = generateButtonTSX(props, tokens);
      break;
    case 'input':
      componentCode = generateInputTSX(props, tokens);
      break;
    case 'card':
      componentCode = generateCardTSX(props, tokens);
      break;
    case 'card-grid':
      componentCode = generateCardGridTSX(props, tokens);
      break;
    case 'form':
      componentCode = generateFormTSX(props, tokens);
      break;
    case 'slider':
      componentCode = generateSliderTSX(props, tokens);
      break;
    case 'toggle':
      componentCode = generateToggleTSX(props, tokens);
      break;
    case 'tabs':
      componentCode = generateTabsTSX(props, tokens);
      break;
    case 'modal':
      componentCode = generateModalTSX(props, tokens);
      break;
    case 'tray':
      componentCode = generateTrayTSX(props, tokens);
      break;
    case 'select':
      componentCode = generateSelectTSX(props, tokens);
      break;
    case 'textarea':
      componentCode = generateTextareaTSX(props, tokens);
      break;
    case 'progress':
      componentCode = generateProgressTSX(props, tokens);
      break;
    case 'tooltip':
      componentCode = generateTooltipTSX(props, tokens);
      break;
    case 'popover':
      componentCode = generatePopoverTSX(props, tokens);
      break;
    case 'drawer':
      componentCode = generateDrawerTSX(props, tokens);
      break;
    case 'dialog':
      componentCode = generateDialogTSX(props, tokens);
      break;
    case 'settings-panel':
      componentCode = generateSettingsPanelTSX(component, tokens);
      break;
    default:
      // Generic component fallback
      componentCode = generateGenericComponentTSX(type, props, tokens);
      break;
  }
  
  // Wrap the component in a React functional component
  const pascalCase = (s: string) => {
    return s
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  };

  const baseName = component.name ? pascalCase(component.name) : pascalCase(type);
  const componentName = baseName.toLowerCase().endsWith('component') ? baseName : `${baseName}Component`;
  
  return `import React from 'react';

interface ${componentName}Props {
  // Add your props here based on the component specification
  [key: string]: unknown;
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
${indent(componentCode, 4)}
  );
};

export default ${componentName};
`;
}

/**
 * Generates a React TSX component for a button.
 */
function generateButtonTSX(props: PropsRecord, tokens?: TokenSet): string {
  const text = typeof props['text'] === 'string' ? props['text'] : 'Button';
  const variant = typeof props['variant'] === 'string' ? props['variant'] : 'primary';
  const size = typeof props['size'] === 'string' ? props['size'] : 'md';
  const classNameSuffix = typeof props['className'] === 'string' && props['className'] ? ' ' + props['className'] : '';
  
  // Apply tokens if available
  const style = tokens ? generateStyleFromTokens(tokens, 'button') : {};
  const styleString = JSON.stringify(style, null, 2).replace(/\n/g, '\n ');
  
 return `<button
  className={\`btn btn-${variant} btn-${size}${classNameSuffix}\`}
  style={${styleString}}
  {...props}
>
  ${text}
</button>`;
}

/**
 * Generates a React TSX component for an input.
 */
function generateInputTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const label = typeof props['label'] === 'string' ? props['label'] : undefined;
  const placeholder = typeof props['placeholder'] === 'string' ? props['placeholder'] : '';
  const type = typeof props['type'] === 'string' ? props['type'] : 'text';
  
  return `<div className="input-container">
  ${label ? `<label>${label}</label>` : ''}
  <input
    type="${type}"
    placeholder="${placeholder || ''}"
    value={props.value}
    className="input-field"
    {...props}
  />
</div>`;
}

/**
 * Generates a React TSX component for a card.
 */
function generateCardTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const title = typeof props['title'] === 'string' ? props['title'] : undefined;
  const content = typeof props['content'] === 'string' ? props['content'] : undefined;
  const footer = typeof props['footer'] === 'string' ? props['footer'] : undefined;
  
  return `<div className="card">
  ${title ? `<div className="card-header"><h3>${title}</h3></div>` : ''}
  <div className="card-content">
    ${content || '{props.children}'}
  </div>
 ${footer ? `<div className="card-footer">${footer}</div>` : ''}
</div>`;
}

/**
 * Generates a React TSX component for a card grid.
 */
function generateCardGridTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<div className="card-grid">
  {/* Map through card data if provided */}
  {props.cards?.map((card: any, index: number) => (
    <div key={index} className="card-grid-item">
      {card.title && <h3>{card.title}</h3>}
      {card.content && <p>{card.content}</p>}
    </div>
  ))}
</div>`;
}

/**
 * Generates a React TSX component for a form.
 */
function generateFormTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<form className="form" onSubmit={props.onSubmit}>
  {/* Form fields would be generated based on props.fields */}
  {props.children}
  <button type="submit" className="form-submit-btn">
    {props.submitText || 'Submit'}
  </button>
</form>`;
}

/**
 * Generates a React TSX component for a slider.
 */
function generateSliderTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const min = typeof props['min'] === 'number' ? props['min'] : 0;
  const max = typeof props['max'] === 'number' ? props['max'] : 100;
  const value = typeof props['value'] === 'number' ? props['value'] : 50;
  
  return `<div className="slider-container">
  <input
    type="range"
    min="${min}"
    max="${max}"
    value={${value}}
    className="slider"
    {...props}
  />
  <span className="slider-value">{${value}}</span>
</div>`;
}

/**
 * Generates a React TSX component for a toggle.
 */
function generateToggleTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const checked = typeof props['checked'] === 'boolean' ? props['checked'] : false;
  
  return `<div className="toggle-container">
  <input
    type="checkbox"
    checked={${checked}}
    className="toggle-input"
    {...props}
 />
  <span className="toggle-slider"></span>
</div>`;
}

/**
 * Generates a React TSX component for tabs.
 */
function generateTabsTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<div className="tabs">
  <div className="tab-headers">
    {props.tabs?.map((tab: any, index: number) => (
      <button
        key={index}
        className={\`tab-header \${props.activeTab === index ? 'active' : ''}\`}
        onClick={() => props.onTabChange?.(index)}
      >
        {tab.title}
      </button>
    ))}
  </div>
  <div className="tab-content">
    {props.tabs?.[props.activeTab]?.content}
  </div>
</div>`;
}

/**
 * Generates a React TSX component for a modal.
 */
function generateModalTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<div className={\`modal \${props.isOpen ? 'open' : 'closed'}\`}>
  <div className="modal-overlay" onClick={props.onClose}></div>
  <div className="modal-content">
    <div className="modal-header">
      <h2>{props.title}</h2>
      <button className="modal-close" onClick={props.onClose}>×</button>
    </div>
    <div className="modal-body">
      {props.children}
    </div>
    <div className="modal-footer">
      {props.footer}
    </div>
  </div>
</div>`;
}

/**
 * Generates a React TSX component for a tray.
 */
function generateTrayTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const position = typeof props['position'] === 'string' ? props['position'] : 'right';
  
  return `<div className={\`tray tray-\${props.isOpen ? 'open' : 'closed'} tray-pos-\${'${position}'}\`}>
  <div className="tray-content">
    {props.children}
  </div>
</div>`;
}

/**
 * Generates a React TSX component for a select dropdown.
 */
function generateSelectTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<select className="select" {...props}>
  {props.options?.map((option: any, index: number) => (
    <option key={index} value={option.value}>
      {option.label}
    </option>
  ))}
</select>`;
}

/**
 * Generates a React TSX component for a textarea.
 */
function generateTextareaTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const placeholder = typeof props['placeholder'] === 'string' ? props['placeholder'] : '';
  return `<textarea
  className="textarea"
  placeholder="${placeholder}"
  {...props}
></textarea>`;
}

/**
 * Generates a React TSX component for a progress bar.
 */
function generateProgressTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
 const value = typeof props['value'] === 'number' ? props['value'] : 0;
 const max = typeof props['max'] === 'number' ? props['max'] : 100;
  
  return `<div className="progress-container">
  <div
    className="progress-bar"
    style={{ width: \`\${(${value} / ${max}) * 100}%\` }}
  ></div>
  <span className="progress-text">{${value}}%</span>
</div>`;
}

/**
 * Generates a React TSX component for a tooltip.
 */
function generateTooltipTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<div className="tooltip-container">
  <span className="tooltip-trigger">{props.children}</span>
  <div className="tooltip-content">{props.content}</div>
</div>`;
}

/**
 * Generates a React TSX component for a popover.
 */
function generatePopoverTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<div className="popover-container">
  <button className="popover-trigger" onClick={props.onToggle}>
    {props.triggerText || 'Popover'}
  </button>
  <div className={\`popover \${props.isOpen ? 'open' : 'closed'}\`}>
    {props.content}
  </div>
</div>`;
}

/**
 * Generates a React TSX component for a drawer.
 */
function generateDrawerTSX(props: PropsRecord, _tokens?: TokenSet): string {
  void _tokens;
  const position = typeof props['position'] === 'string' ? props['position'] : 'left';
  
  return `<div className={\`drawer drawer-\${props.isOpen ? 'open' : 'closed'} drawer-pos-\${'${position}'}\`}>
  <div className="drawer-overlay" onClick={props.onClose}></div>
  <div className="drawer-content">
    <div className="drawer-header">
      <h2>{props.title}</h2>
      <button className="drawer-close" onClick={props.onClose}>×</button>
    </div>
    <div className="drawer-body">
      {props.children}
    </div>
  </div>
</div>`;
}

/**
 * Generates a React TSX component for a dialog.
 */
function generateDialogTSX(_props: PropsRecord, _tokens?: TokenSet): string {
  void _props; void _tokens;
  return `<dialog className={\`dialog \${props.isOpen ? 'open' : ''}\`}>
  <div className="dialog-content">
    <div className="dialog-header">
      <h2>{props.title}</h2>
      <button className="dialog-close" onClick={props.onClose}>×</button>
    </div>
    <div className="dialog-body">
      {props.children}
    </div>
    <div className="dialog-footer">
      {props.footer}
    </div>
  </div>
</dialog>`;
}

/**
 * Generates a React TSX component for a settings panel.
 */
function generateSettingsPanelTSX(component: ComponentSpec, _tokens?: TokenSet): string {
  void _tokens;
  const { props } = component;
  const title = props.title || 'Settings Panel';

  // Note: This is a simplified representation. A real implementation would
  // need to handle child components and their state.
  const childComponents = (props.children as ComponentSpec[]) || [];

  const childrenTSX = childComponents.map(child => {
    switch (child.type) {
      case 'slider':
        return `
        <div>
          <label className="block text-sm font-medium">${child.props.label || 'Slider'}</label>
          <input type="range" min="${child.props.min || 0}" max="${child.props.max || 100}" defaultValue="${child.props.value || 50}" className="w-full" />
        </div>
      `;
      case 'toggle':
        return `
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">${child.props.label || 'Toggle'}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={${child.props.checked || false}} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      `;
      default:
        return `<div>Unsupported component: ${child.type}</div>`;
    }
  }).join('');

  return `
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">${title}</h2>
      <div className="space-y-4">
        ${childrenTSX}
      </div>
    </div>
  `;
}

// ============================================================================
// TOKENS EXPORT
// ============================================================================

/**
 * Generates design tokens in JSON format.
 * 
 * @param tokens - The token set to export
 * @returns Generated tokens as a formatted JSON string
 */
export function generateTokens(tokens: TokenSet): string {
  return `{
  "colors": ${JSON.stringify(tokens.colors || {}, null, 2)},
  "spacing": ${JSON.stringify(tokens.spacing || {}, null, 2)},
  "typography": ${JSON.stringify(tokens.typography || {}, null, 2)},
  "radius": ${JSON.stringify(tokens.radius || {}, null, 2)},
  "shadows": ${JSON.stringify(tokens.shadows || {}, null, 2)},
  "transitions": ${JSON.stringify(tokens.transitions || {}, null, 2)}
}`;
}

/**
 * Generates CSS custom properties from design tokens.
 * 
 * @param tokens - The token set to convert
 * @returns CSS custom properties as a string
 */
export function generateCSSTokens(tokens: TokenSet): string {
  let css = ':root {\\n';
  
  // Add color tokens
  if (tokens.colors) {
    for (const [name, value] of Object.entries(tokens.colors)) {
      css += `  --color-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\\n`;
    }
  }
  
  // Add spacing tokens
 if (tokens.spacing) {
    for (const [name, value] of Object.entries(tokens.spacing)) {
      css += `  --spacing-${name}: ${value}px;\\n`;
    }
 }
  
  // Add typography tokens
  if (tokens.typography) {
    if (tokens.typography.fontFamily) {
      css += `  --font-family: ${tokens.typography.fontFamily};\\n`;
    }
    
    if (tokens.typography.sizes) {
      for (const [name, value] of Object.entries(tokens.typography.sizes)) {
        css += `  --font-size-${name}: ${value}px;\\n`;
      }
    }
    
    if (tokens.typography.weights) {
      for (const [name, value] of Object.entries(tokens.typography.weights)) {
        css += `  --font-weight-${name}: ${value};\\n`;
      }
    }
  }
  
  // Add radius tokens
  if (tokens.radius) {
    for (const [name, value] of Object.entries(tokens.radius)) {
      css += `  --radius-${name}: ${value}px;\\n`;
    }
  }
  
  css += '}\\n';
  
  return css;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Exports a single component to a file.
 * 
 * @param component - The component to export
 * @param path - The file path to export to
 * @param options - Export options
 * @returns Promise that resolves to export result
 */
export async function exportComponent(component: ComponentSpec, path: string, options: ExportOptions = {}): Promise<ExportResult> {
  try {
    const { format = 'tsx', includeTokens = false } = options;
    let content = '';
    
    // Generate component code based on format
    if (format === 'tsx' || format === 'jsx') {
      content = generateTSX(component);
    } else {
      // For other formats, we could implement different generators
      content = generateTSX(component); // Default to TSX for now
    }
    
    // Add tokens if requested
    if (includeTokens) {
      // This would be more complex in a real implementation
      content += `\\n// Tokens would be included here\\n`;
    }
    
    // In a browser environment, we'll simulate file saving
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
    const blob = new Blob([content], { type: 'application/typescript' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a') as HTMLAnchorElement;
    anchor.href = url;
    anchor.download = path.split('/').pop() || `${component.name || component.type}.tsx`;
      try {
        // Append/remove will fail if document.createElement was mocked to return a plain object
        // Wrap in a try/catch and fall back to just calling click()
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(anchor);
        }
        anchor.click();
        if (document.body && typeof document.body.removeChild === 'function') {
          try { document.body.removeChild(anchor); } catch (e) { void e; }
        }
      } catch (err) {
        // Best effort: call click directly if append/remove fails
    try { anchor.click && anchor.click(); } catch (ignore) { void ignore; }
      }
      window.URL.revokeObjectURL(url);
    } else {
      console.log(`Exporting component to ${path}:`, content.substring(0, 100) + '...');
    }
    
    return {
      success: true,
      exportedFiles: [path],
      errors: [],
      warnings: []
    };
  } catch (error) {
    console.error(`Error exporting component to ${path}:`, error);
    return {
      success: false,
      exportedFiles: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: []
    };
  }
}

/**
 * Exports all components in a graph to individual files.
 * 
 * @param graph - The graph containing components to export
 * @param basePath - The base directory path for exports
 * @param options - Export options
 * @returns Promise that resolves to export result
 */
export async function exportAll(graph: Graph, basePath: string = './exports', options: ExportOptions = {}): Promise<ExportResult> {
  const results: ExportResult = {
    success: true,
    exportedFiles: [],
    errors: [],
    warnings: []
  };
  
  try {
    // Filter components if a filter function is provided
    const components = options.componentFilter 
      ? graph.nodes.filter(options.componentFilter)
      : graph.nodes;
    
    // Export each component
    for (const component of components) {
      const fileName = component.name || `${component.type}_${component.id.substring(0, 8)}`;
      const componentPath = `${basePath}/${fileName}.tsx`;
      
      const result = await exportComponent(component, componentPath, options);
      
      results.exportedFiles.push(...result.exportedFiles);
      results.errors.push(...result.errors);
      results.warnings.push(...result.warnings);
      
      if (!result.success) {
        results.success = false;
      }
    }
    
    // Export tokens if requested
    if (options.includeTokens && graph.tokens) {
      const tokensPath = `${basePath}/tokens.json`;
      const tokensContent = generateTokens(graph.tokens);
      
      if (typeof window !== 'undefined' && window.Blob && window.URL) {
    const blob = new Blob([tokensContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a') as HTMLAnchorElement;
    anchor.href = url;
    anchor.download = 'tokens.json';
        try {
          if (document.body && typeof document.body.appendChild === 'function') {
            document.body.appendChild(anchor);
          }
          anchor.click();
          if (document.body && typeof document.body.removeChild === 'function') {
            try { document.body.removeChild(anchor); } catch (e) { /* ignore */ }
          }
        } catch (err) {
            try { anchor.click && anchor.click(); } catch (ignore) { void ignore; }
        }
        window.URL.revokeObjectURL(url);
      } else {
        console.log(`Exporting tokens to ${tokensPath}:`, tokensContent.substring(0, 100) + '...');
      }
      
      results.exportedFiles.push(tokensPath);
    }
    
    // Export a combined index file
    const indexPath = `${basePath}/index.ts`;
    const indexContent = components
      .map(comp => {
        const fileName = comp.name || `${comp.type}_${comp.id.substring(0, 8)}`;
        return `export { default as ${fileName} } from './${fileName}';`;
      })
      .join('\\n');
      
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
  const blob = new Blob([indexContent], { type: 'application/typescript' });
  const url = window.URL.createObjectURL(blob);
      
  const anchor = document.createElement('a') as HTMLAnchorElement;
  anchor.href = url;
  anchor.download = 'index.ts';
      try {
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(anchor);
        }
        anchor.click();
        if (document.body && typeof document.body.removeChild === 'function') {
          try { document.body.removeChild(anchor); } catch (e) { void e; }
        }
      } catch (err) {
        try { anchor.click && anchor.click(); } catch (ignore) { void ignore; }
        void err;
      }
      window.URL.revokeObjectURL(url);
    } else {
      console.log(`Exporting index to ${indexPath}:`, indexContent.substring(0, 100) + '...');
    }
    
    results.exportedFiles.push(indexPath);
    
  } catch (error) {
    console.error('Error exporting all components:', error);
    results.success = false;
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }
  
 return results;
}

/**
 * Exports the entire graph as a single React component.
 * 
 * @param graph - The graph to export
 * @param path - The file path to export to
 * @param options - Export options
 * @returns Promise that resolves to export result
 */
export async function exportGraph(graph: Graph, path: string = './App.tsx', _options: ExportOptions = {}): Promise<ExportResult> {
  try {
    // Suppress unused parameter warning - options are reserved for future use
    void _options;
    // Generate a top-level component that includes all components in the graph
    let content = `import React from 'react';\\n\\n`;
    
    // Import all components
    graph.nodes.forEach((node, index) => {
      const componentName = node.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}_${index}`;
      content += `import ${componentName} from './components/${componentName}';\\n`;
    });
    
    content += `\\nconst App: React.FC = () => {\\n  return (\\n    <div className="app-container">\\n`;
    
    // Add each component to the app
    graph.nodes.forEach((node, index) => {
      const componentName = node.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}_${index}`;
      content += `      <${componentName} key="${node.id}" />\\n`;
    });
    
    content += `    </div>\\n  );\\n};\\n\\nexport default App;`;
    
    // Save the file
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
      const blob = new Blob([content], { type: 'application/typescript' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'App.tsx';
      try {
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(a as HTMLAnchorElement);
        }
        (a as HTMLAnchorElement).click();
        if (document.body && typeof document.body.removeChild === 'function') {
          try { document.body.removeChild(a as HTMLAnchorElement); } catch (e) { void e; }
        }
      } catch (err) {
        try { (a as HTMLAnchorElement).click && (a as HTMLAnchorElement).click(); } catch (ignore) { void ignore; }
        void err;
      }
      window.URL.revokeObjectURL(url);
    } else {
      console.log(`Exporting graph to ${path}:`, content.substring(0, 100) + '...');
    }
    
    return {
      success: true,
      exportedFiles: [path],
      errors: [],
      warnings: []
    };
  } catch (error) {
    console.error(`Error exporting graph to ${path}:`, error);
    return {
      success: false,
      exportedFiles: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: []
    };
  }
}

/**
 * Exports design tokens to various formats.
 * 
 * @param tokens - The tokens to export
 * @param path - The file path to export to
 * @param format - The export format ('json', 'css', 'sass', 'less')
 * @returns Promise that resolves to export result
 */
export async function exportTokens(tokens: TokenSet, path: string, format: 'json' | 'css' | 'sass' | 'less' = 'json'): Promise<ExportResult> {
  try {
    let content = '';
    
    switch (format) {
      case 'css':
        content = generateCSSTokens(tokens);
        break;
      case 'json':
      default:
        content = generateTokens(tokens);
        break;
    }
    
    // Save the file
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
      let mimeType = 'application/json';
      if (format === 'css') mimeType = 'text/css';
      else if (format === 'sass') mimeType = 'text/x-sass';
      else if (format === 'less') mimeType = 'text/x-less';
      
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a') as HTMLAnchorElement;
      anchor.href = url;
      anchor.download = path.split('/').pop() || `tokens.${format}`;
      try {
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(anchor);
        }
        anchor.click();
        if (document.body && typeof document.body.removeChild === 'function') {
          try { document.body.removeChild(anchor); } catch (e) { /* ignore */ }
        }
      } catch (err) {
        try { anchor.click && anchor.click(); } catch (ignore) { void ignore; }
      }
      window.URL.revokeObjectURL(url);
    } else {
      console.log(`Exporting tokens to ${path} in ${format} format:`, content.substring(0, 100) + '...');
    }
    
    return {
      success: true,
      exportedFiles: [path],
      errors: [],
      warnings: []
    };
  } catch (error) {
    console.error(`Error exporting tokens to ${path}:`, error);
    return {
      success: false,
      exportedFiles: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: []
    };
  }
}

/**
 * Generates CSS styles from design tokens.
 */
function generateStyleFromTokens(tokens: TokenSet, componentType: string): Record<string, string | number | undefined> {
  const style: Record<string, string | number | undefined> = {};
  
  // Apply common tokens based on component type
  if (tokens.colors) {
    if (componentType === 'button') {
      style.backgroundColor = tokens.colors.primary || tokens.colors['bg-surface'];
      style.color = tokens.colors['text-primary'] || 'white';
    }
  }
  
  if (tokens.spacing) {
    style.padding = `${tokens.spacing.md || 16}px`;
    style.margin = `${tokens.spacing.sm || 8}px`;
  }
  
  if (tokens.radius) {
    style.borderRadius = `${tokens.radius.md || 4}px`;
  }
  
  if (tokens.typography) {
    style.fontFamily = tokens.typography.fontFamily;
    style.fontSize = `${tokens.typography.sizes?.base || 16}px`;
  }
  
  if (tokens.shadows) {
    style.boxShadow = tokens.shadows.default || tokens.shadows['level-1'];
  }
  
  return style;
}

/**
 * Helper function to indent text.
 */
function indent(text: string, spaces: number): string {
  const indentation = ' '.repeat(spaces);
  return text
    .split('\\n')
    .map(line => indentation + line)
    .join('\\n');
}

function generateGenericComponentTSX(type: ComponentType, props: Record<string, unknown>, tokens?: TokenSet): string {
    const style = tokens ? generateStyleFromTokens(tokens, type) : {};
    const propsString = Object.entries(props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    return `<div style={${JSON.stringify(style, null, 2)}} ${propsString}>Generic ${type}</div>`;
}