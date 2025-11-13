import React, { useState, useCallback } from 'react';
import { useStore } from '../state/store';
import { ComponentSpec } from '../../schema';

/**
 * JsonEditor component - Renders a JSON editor for editing component properties
 */
const JsonEditor: React.FC<{
  component: ComponentSpec;
  onSave: (id: string, jsonText: string) => void;
  error?: string | null;
}> = ({ component, onSave, error }) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(component, null, 2));

  return (
    <div className="space-y-2">
      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          // Clear error when user starts typing
        }}
        className="w-full h-96 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono text-text"
      />

      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={() => onSave(component.id, jsonText)}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 text-sm font-medium"
      >
        Apply Changes
      </button>
    </div>
  );
};

/**
 * Inspector component - Shows properties of selected components and allows editing.
 * 
 * Features:
 * - Displays properties of the currently selected component
 * - Supports both form view and raw JSON view
 * - Allows inline editing of component properties
 * - Shows component metadata (id, type, name, frame)
 * - Multi-select shows count but doesn't allow editing
 */
const Inspector: React.FC = () => {
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Subscribe to selection and get selected components
  const selectedIds = useStore((state) => state.selection.selectedIds);
  const { selectors, actions } = useStore();
  const selectedComponents = selectors.getSelectedComponents();

  /**
   * Handle property value change in form view
   */
  const handlePropertyChange = useCallback((
    componentId: string,
    propPath: string,
    value: unknown
  ) => {
    const component = selectors.getComponentById(componentId);
    if (!component) return;

    actions.updateComponent(componentId, {
      props: {
        ...component.props,
        [propPath]: value,
      },
    });
  }, [actions, selectors]);

  /**
   * Handle frame property change (position, size)
   */
  const handleFrameChange = useCallback((
    componentId: string,
    frameKey: keyof ComponentSpec['frame'],
    value: number | string
  ) => {
    const component = selectors.getComponentById(componentId);
    if (!component) return;

    actions.updateComponent(componentId, {
      frame: {
        ...component.frame,
        [frameKey]: frameKey === 'region' ? value : Number(value),
      },
    });
  }, [actions, selectors]);

  /**
   * Handle name change
   */
  const handleNameChange = useCallback((
    componentId: string,
    name: string
  ) => {
    actions.updateComponent(componentId, { name: name || undefined });
  }, [actions]);

  /**
   * Handle JSON edit and apply changes
   */
  const handleJsonSave = useCallback((componentId: string, jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError(null);
      
      // Validate that essential fields are present
      if (!parsed.id || !parsed.type || !parsed.frame) {
        setJsonError('Missing required fields: id, type, or frame');
        return;
      }

      actions.updateComponent(componentId, parsed);
    } catch (error) {
      setJsonError(`Invalid JSON: ${(error as Error).message}`);
    }
  }, [actions]);

  /**
   * Render property editor for a single component
   */
  const renderPropertyEditor = (component: ComponentSpec) => {
    const propEntries = Object.entries(component.props);

    return (
      <div className="space-y-4">
        {/* Component metadata */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">ID</label>
            <div className="px-3 py-2 bg-surface rounded-md text-sm font-mono text-text">
              {component.id}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Type</label>
            <div className="px-3 py-2 bg-surface rounded-md text-sm font-mono text-primary">
              {component.type}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Name</label>
            <input
              type="text"
              value={component.name || ''}
              onChange={(e) => handleNameChange(component.id, e.target.value)}
              placeholder="Optional name"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
            />
          </div>
        </div>

        {/* Frame properties */}
        <div>
          <h4 className="text-sm font-bold text-text mb-2">Frame</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">X</label>
              <input
                type="number"
                value={component.frame.x}
                onChange={(e) => handleFrameChange(component.id, 'x', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Y</label>
              <input
                type="number"
                value={component.frame.y}
                onChange={(e) => handleFrameChange(component.id, 'y', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Width</label>
              <input
                type="number"
                value={component.frame.w}
                onChange={(e) => handleFrameChange(component.id, 'w', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Height</label>
              <input
                type="number"
                value={component.frame.h}
                onChange={(e) => handleFrameChange(component.id, 'h', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-xs font-medium text-secondary mb-1">Region</label>
            <input
              type="text"
              value={component.frame.region}
              onChange={(e) => handleFrameChange(component.id, 'region', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
            />
          </div>
        </div>

        {/* Component props */}
        <div>
          <h4 className="text-sm font-bold text-text mb-2">Properties</h4>
          {propEntries.length === 0 ? (
            <p className="text-sm text-secondary italic">No properties</p>
          ) : (
            <div className="space-y-2">
              {propEntries.map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    {key}
                  </label>
                  {typeof value === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePropertyChange(component.id, key, e.target.checked)}
                      className="h-4 w-4 text-primary border-border rounded"
                    />
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handlePropertyChange(component.id, key, Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
                    />
                  ) : Array.isArray(value) ? (
                    <textarea
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handlePropertyChange(component.id, key, parsed);
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono text-text"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(value)}
                      onChange={(e) => handlePropertyChange(component.id, key, e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="inspector-container h-full flex flex-col bg-surface border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-bold text-text">Inspector</h2>
        {selectedIds.length > 0 && (
          <p className="text-xs text-secondary mt-1">
            {selectedIds.length} component{selectedIds.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedIds.length === 0 ? (
          // No selection state
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm text-secondary">
                Select a component on the canvas to view and edit its properties
              </p>
            </div>
          </div>
        ) : selectedIds.length > 1 ? (
          // Multi-select state
          <div className="p-4">
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-md">
              <p className="text-sm text-text">
                Multiple components selected. Select a single component to edit properties.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-text">Selected Components:</h3>
              {selectedComponents.map((component) => (
                <div
                  key={component.id}
                  className="px-3 py-2 bg-background rounded-md border border-border cursor-pointer hover:border-primary"
                  onClick={() => {
                    actions.clearSelection();
                    actions.selectComponent(component.id);
                  }}
                >
                  <div className="text-sm font-medium text-text">
                    {component.name || component.type}
                  </div>
                  <div className="text-xs text-secondary font-mono">
                    {component.id.slice(0, 8)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Single component selected
          <div className="p-4">
            {/* View mode toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setViewMode('form')}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'form'
                    ? 'bg-primary text-white'
                    : 'bg-background text-secondary hover:bg-surface'}
                `}
              >
                Form View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'json'
                    ? 'bg-primary text-white'
                    : 'bg-background text-secondary hover:bg-surface'}
                `}
              >
                JSON View
              </button>
            </div>

            {/* Editor */}
            {viewMode === 'form'
              ? renderPropertyEditor(selectedComponents[0])
              : (
                <JsonEditor
                  component={selectedComponents[0]}
                  onSave={handleJsonSave}
                  error={jsonError}
                />
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;