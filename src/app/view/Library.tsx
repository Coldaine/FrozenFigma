import React, { useState } from 'react';
import { useStore } from '../state/store';
import { ComponentType, createComponent, generateId } from '../../schema';

/**
 * Skeleton component template definition
 */
interface SkeletonTemplate {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultSize: { w: number; h: number };
}

/**
 * Available skeleton component templates
 */
const SKELETON_TEMPLATES: SkeletonTemplate[] = [
  {
    type: 'button',
    label: 'Button',
    description: 'Interactive button component',
    icon: '🔘',
    defaultProps: { label: 'Button' },
    defaultSize: { w: 120, h: 40 },
  },
  {
    type: 'slider',
    label: 'Slider',
    description: 'Range slider control',
    icon: '🎚️',
    defaultProps: { label: 'Slider', min: 0, max: 100, value: 50 },
    defaultSize: { w: 200, h: 60 },
  },
  {
    type: 'toggle',
    label: 'Toggle',
    description: 'On/off switch',
    icon: '🔀',
    defaultProps: { label: 'Toggle', checked: false },
    defaultSize: { w: 150, h: 40 },
  },
  {
    type: 'tabs',
    label: 'Tabs',
    description: 'Tabbed navigation',
    icon: '📑',
    defaultProps: { tabs: ['Tab 1', 'Tab 2', 'Tab 3'] },
    defaultSize: { w: 400, h: 200 },
  },
  {
    type: 'modal',
    label: 'Modal',
    description: 'Modal dialog overlay',
    icon: '📦',
    defaultProps: { title: 'Modal Title', content: 'Modal content', open: false },
    defaultSize: { w: 400, h: 300 },
  },
  {
    type: 'card',
    label: 'Card',
    description: 'Content card',
    icon: '🃏',
    defaultProps: { title: 'Card Title', description: 'Card description' },
    defaultSize: { w: 300, h: 200 },
  },
  {
    type: 'card-grid',
    label: 'Card Grid',
    description: 'Grid of cards',
    icon: '📇',
    defaultProps: { items: [1, 2, 3, 4] },
    defaultSize: { w: 400, h: 300 },
  },
  {
    type: 'form',
    label: 'Form',
    description: 'Input form',
    icon: '📝',
    defaultProps: {},
    defaultSize: { w: 400, h: 300 },
  },
  {
    type: 'input',
    label: 'Input',
    description: 'Text input field',
    icon: '✏️',
    defaultProps: { label: 'Input', placeholder: 'Enter text' },
    defaultSize: { w: 250, h: 60 },
  },
  {
    type: 'select',
    label: 'Select',
    description: 'Dropdown select',
    icon: '📋',
    defaultProps: { label: 'Select', options: ['Option 1', 'Option 2', 'Option 3'] },
    defaultSize: { w: 250, h: 60 },
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'Multi-line text input',
    icon: '📄',
    defaultProps: { label: 'Textarea', placeholder: 'Enter text', rows: 4 },
    defaultSize: { w: 300, h: 120 },
  },
  {
    type: 'progress',
    label: 'Progress',
    description: 'Progress bar',
    icon: '📊',
    defaultProps: { label: 'Progress', value: 50 },
    defaultSize: { w: 300, h: 60 },
  },
  {
    type: 'tooltip',
    label: 'Tooltip',
    description: 'Hover tooltip',
    icon: '💬',
    defaultProps: { content: 'Tooltip content' },
    defaultSize: { w: 120, h: 40 },
  },
  {
    type: 'drawer',
    label: 'Drawer',
    description: 'Side drawer panel',
    icon: '📂',
    defaultProps: { title: 'Drawer', content: 'Drawer content', position: 'right', open: false },
    defaultSize: { w: 320, h: 400 },
  },
  {
    type: 'dialog',
    label: 'Dialog',
    description: 'Alert dialog',
    icon: '💭',
    defaultProps: { title: 'Dialog', message: 'Dialog message', open: false },
    defaultSize: { w: 350, h: 200 },
  },
  {
    type: 'tray',
    label: 'Tray',
    description: 'Bottom sheet tray',
    icon: '📥',
    defaultProps: { title: 'Tray', content: 'Tray content', open: false },
    defaultSize: { w: 400, h: 300 },
  },
  {
    type: 'popover',
    label: 'Popover',
    description: 'Popover menu',
    icon: '🎈',
    defaultProps: { title: 'Popover', content: 'Popover content' },
    defaultSize: { w: 200, h: 100 },
  },
];

/**
 * Library component - Shows available skeleton components for adding to the canvas.
 * 
 * Features:
 * - Displays all available component templates
 * - Click-to-add functionality
 * - Search/filter components
 * - Shows component preview and description
 */
const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'input' | 'layout' | 'overlay'>('all');
  const { actions } = useStore();

  /**
   * Handle adding a component to the canvas
   */
  const handleAddComponent = (template: SkeletonTemplate) => {
    // Create component at a default position (center-ish)
    const component = createComponent(
      template.type,
      {
        x: 100 + Math.random() * 200, // Random position to avoid overlap
        y: 100 + Math.random() * 200,
        w: template.defaultSize.w,
        h: template.defaultSize.h,
        region: 'center',
      },
      {
        props: template.defaultProps,
        name: `${template.label}-${generateId().slice(0, 4)}`,
      }
    );

    actions.addComponent(component);
    
    // Select the newly added component
    actions.clearSelection();
    actions.selectComponent(component.id);
  };

  /**
   * Filter templates based on search query and category
   */
  const filteredTemplates = SKELETON_TEMPLATES.filter((template) => {
    const matchesSearch = 
      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'all' ||
      (selectedCategory === 'input' && ['input', 'select', 'textarea', 'slider', 'toggle'].includes(template.type)) ||
      (selectedCategory === 'layout' && ['card', 'card-grid', 'form', 'tabs'].includes(template.type)) ||
      (selectedCategory === 'overlay' && ['modal', 'dialog', 'drawer', 'tray', 'popover', 'tooltip'].includes(template.type));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="library-container h-full flex flex-col bg-surface border-r border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-bold text-text">Library</h2>
        <p className="text-xs text-secondary mt-1">
          {SKELETON_TEMPLATES.length} components available
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text placeholder-secondary"
        />
      </div>

      {/* Category filters */}
      <div className="px-4 py-2 border-b border-border flex space-x-2">
        {(['all', 'input', 'layout', 'overlay'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize
              ${selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-background text-secondary hover:bg-surface'}
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-sm text-secondary text-center">
              No components match your search
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => handleAddComponent(template)}
                className="w-full p-3 bg-background hover:bg-surface border border-border hover:border-primary rounded-md transition-all text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                      {template.label}
                    </div>
                    <div className="text-xs text-secondary mt-1">
                      {template.description}
                    </div>
                    <div className="text-xs text-secondary mt-1 font-mono">
                      {template.defaultSize.w}×{template.defaultSize.h}
                    </div>
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-secondary">
          💡 Click a component to add it to the canvas
        </p>
      </div>
    </div>
  );
};

export default Library;