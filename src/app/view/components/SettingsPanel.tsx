import React from 'react';
import { ComponentSpec } from '../../../schema';
import { renderComponent } from './renderComponent';

/**
 * SettingsPanel component - Renders a complete settings panel with sliders, toggles, and other controls
 */
export const SettingsPanelComponent: React.FC<{
  spec: ComponentSpec;
  childComponents: ComponentSpec[];
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
}> = ({
  spec,
  childComponents,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const props = spec.props as Record<string, unknown>;
  const title = (props.title as string) || 'Settings';
  const backgroundColor = (props.backgroundColor as string) || 'bg-surface';
  const borderRadius = (props.borderRadius as string) || 'rounded-lg';
  const padding = (props.padding as string) || 'p-6';
  const description = (props.description as string) || undefined;

  return (
    <div
      className={`
        ${backgroundColor} border border-border ${borderRadius} ${padding}
        shadow-md transition-all
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered ? 'shadow-lg' : ''}
      `}
      onClick={() => onClick?.(spec.id)}
      onMouseEnter={() => onMouseEnter?.(spec.id)}
      onMouseLeave={onMouseLeave}
    >
      {/* Panel Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text">{title}</h3>
        {description && (
          <p className="text-sm text-secondary mt-1">{description}</p>
        )}
      </div>

      {/* Settings Content */}
      <div className="space-y-4">
        {childComponents.map((childSpec) => (
          <div key={childSpec.id} className="flex items-center justify-between">
            {renderComponent(childSpec, {
              isSelected: false,
              isHovered: false,
              onClick: () => {}, // Child components handle their own interactions
              onMouseEnter: () => {},
              onMouseLeave: () => {},
            })}
          </div>
        ))}
      </div>

      {/* Panel Footer */}
  {(props.showFooter as boolean) && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 text-sm text-secondary hover:text-text transition-colors">
              Reset
            </button>
            <button className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:opacity-90 transition-colors">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};