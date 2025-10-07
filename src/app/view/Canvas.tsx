import React, { useCallback } from 'react';
import { useStore } from '../state/store';
import { renderComponent } from './components/UIComponents';
import { ComponentSpec } from '../../schema';

/**
 * Canvas component - The main interactive render area for the UI mock-up.
 * 
 * Features:
 * - Renders all components from the graph
 * - Handles component selection and hover states
 * - Supports region-based layout (left, center, right, overlay, tray)
 * - Provides click-to-select interaction
 * - Shows visual feedback for selected and hovered components
 */
const Canvas: React.FC = () => {
  // Subscribe to graph nodes and selection state
  const nodes = useStore((state) => state.graph.nodes);
  const selectedIds = useStore((state) => state.selection.selectedIds);
  const hoveredId = useStore((state) => state.selection.hoveredId);
  const { actions } = useStore();

  /**
   * Handle component click for selection
   */
  const handleComponentClick = useCallback((id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select with Cmd/Ctrl
      actions.toggleSelection(id);
    } else if (event.shiftKey) {
      // Add to selection with Shift
      if (!selectedIds.includes(id)) {
        actions.selectComponent(id);
      }
    } else {
      // Single select
      actions.clearSelection();
      actions.selectComponent(id);
    }
  }, [actions, selectedIds]);

  /**
   * Handle canvas background click to clear selection
   */
  const handleCanvasClick = useCallback(() => {
    actions.clearSelection();
  }, [actions]);

  /**
   * Handle component hover
   */
  const handleComponentMouseEnter = useCallback((id: string) => {
    actions.setHoveredId(id);
  }, [actions]);

  /**
   * Handle component mouse leave
   */
  const handleComponentMouseLeave = useCallback(() => {
    actions.setHoveredId(null);
  }, [actions]);

  /**
   * Group components by region for layout organization
   */
  const componentsByRegion = nodes.reduce((acc, node) => {
    const region = node.frame.region || 'center';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(node);
    return acc;
  }, {} as Record<string, ComponentSpec[]>);

  /**
   * Render a single component with positioning and interaction handlers
   */
  const renderComponentWithFrame = (node: ComponentSpec) => {
    const isSelected = selectedIds.includes(node.id);
    const isHovered = hoveredId === node.id;

    return (
      <div
        key={node.id}
        data-component-id={node.id}
        data-component-type={node.type}
        className="absolute transition-all"
        style={{
          left: node.frame.x,
          top: node.frame.y,
          width: node.frame.w,
          height: node.frame.h,
        }}
        onClick={(e) => handleComponentClick(node.id, e)}
        onMouseEnter={() => handleComponentMouseEnter(node.id)}
        onMouseLeave={handleComponentMouseLeave}
      >
        {renderComponent(node, {
          isSelected,
          isHovered,
          onClick: (id: string) => handleComponentClick(id, {} as React.MouseEvent),
          onMouseEnter: handleComponentMouseEnter,
          onMouseLeave: handleComponentMouseLeave,
        })}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none border-2 border-primary rounded-md" />
        )}
        
        {/* Hover indicator */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 rounded-md" />
        )}
        
        {/* Component label for debugging */}
        {(isSelected || isHovered) && (
          <div className="absolute -top-6 left-0 px-2 py-1 bg-primary text-white text-xs rounded-md whitespace-nowrap">
            {node.name || node.type} ({node.id.slice(0, 8)})
          </div>
        )}
      </div>
    );
  };

  /**
   * Render a region container with components
   */
  const renderRegion = (regionName: string, components: ComponentSpec[], className: string = '') => {
    if (!components || components.length === 0) return null;

    return (
      <div
        key={regionName}
        data-region={regionName}
        className={`relative ${className}`}
      >
        <div className="absolute top-2 left-2 px-2 py-1 bg-surface/80 backdrop-blur-sm text-xs text-secondary rounded-md z-10">
          {regionName}
        </div>
        {components.map(renderComponentWithFrame)}
      </div>
    );
  };

  return (
    <div
      data-testid="canvas"
      className="canvas-container h-full w-full bg-background overflow-auto"
      onClick={handleCanvasClick}
    >
      {nodes.length === 0 ? (
        // Empty state
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-text mb-2">Empty Canvas</h3>
            <p className="text-secondary">
              Add components from the Library or use the Command Bar to get started
            </p>
          </div>
        </div>
      ) : (
        // Render components grouped by region
        <div className="relative min-h-full">
          {/* Left region (sidebar) */}
          {componentsByRegion['left'] && renderRegion(
            'left',
            componentsByRegion['left'],
            'w-64 border-r border-border bg-surface/50'
          )}

          {/* Center/Main region */}
          <div className="flex-1 relative min-h-screen p-8">
            {componentsByRegion['center']?.map(renderComponentWithFrame)}
            {componentsByRegion['main']?.map(renderComponentWithFrame)}
            {componentsByRegion['header']?.map(renderComponentWithFrame)}
            {componentsByRegion['footer']?.map(renderComponentWithFrame)}
          </div>

          {/* Right region (sidebar) */}
          {componentsByRegion['right'] && renderRegion(
            'right',
            componentsByRegion['right'],
            'w-64 border-l border-border bg-surface/50'
          )}

          {/* Overlay region (modals, dialogs) */}
          {componentsByRegion['overlay'] && (
            <div className="fixed inset-0 pointer-events-none z-40">
              <div className="relative w-full h-full pointer-events-auto">
                {componentsByRegion['overlay'].map(renderComponentWithFrame)}
              </div>
            </div>
          )}

          {/* Tray region (bottom sheets) */}
          {componentsByRegion['tray'] && (
            <div className="fixed bottom-0 left-0 right-0 z-30">
              {componentsByRegion['tray'].map(renderComponentWithFrame)}
            </div>
          )}
        </div>
      )}

      {/* Selection info overlay */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-primary text-white rounded-md shadow-lg z-50">
          {selectedIds.length} component{selectedIds.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default Canvas;