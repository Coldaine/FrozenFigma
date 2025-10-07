import React, { useState } from 'react';
import { ComponentSpec } from '../../../schema';

/**
 * Props shared by all UI component renderers
 */
interface UIComponentProps {
  spec: ComponentSpec;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
}

/**
 * Button component renderer
 */
export const ButtonComponent: React.FC<UIComponentProps> = ({ spec, isSelected, isHovered, onClick }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={`
        px-4 py-2 rounded-md font-medium transition-all
        bg-primary text-white hover:opacity-90 active:scale-95
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered ? 'shadow-lg' : 'shadow-md'}
      `}
      onClick={() => onClick?.(spec.id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        opacity: isPressed ? 0.8 : 1,
      }}
    >
      {spec.props.label || 'Button'}
    </button>
  );
};

/**
 * Slider component renderer
 */
export const SliderComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [value, setValue] = useState(spec.props.value || 50);
  const min = spec.props.min || 0;
  const max = spec.props.max || 100;

  return (
    <div
      className={`p-4 ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium mb-2 text-text">
        {spec.props.label || 'Slider'}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
};

/**
 * Toggle component renderer
 */
export const ToggleComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [enabled, setEnabled] = useState(spec.props.checked || false);

  return (
    <div
      className={`flex items-center space-x-3 p-2 ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEnabled(!enabled);
        }}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary' : 'bg-surface border border-border'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm font-medium text-text">{spec.props.label || 'Toggle'}</span>
    </div>
  );
};

/**
 * Tabs component renderer
 */
export const TabsComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const tabs = spec.props.tabs || ['Tab 1', 'Tab 2', 'Tab 3'];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="flex border-b border-border">
        {tabs.map((tab: string, index: number) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(index);
            }}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === index
                ? 'border-b-2 border-primary text-primary'
                : 'text-secondary hover:text-text'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 bg-surface">
        <p className="text-text">{tabs[activeTab]} content</p>
      </div>
    </div>
  );
};

/**
 * Modal component renderer
 */
export const ModalComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [isOpen, setIsOpen] = useState(spec.props.open || true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Open Modal
      </button>
    );
  }

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-text mb-4">
            {spec.props.title || 'Modal Title'}
          </h3>
          <p className="text-text mb-6">
            {spec.props.content || 'Modal content goes here'}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-surface text-text rounded-md hover:bg-border"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Card component renderer
 */
export const CardComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  return (
    <div
      className={`
        p-6 bg-surface rounded-lg shadow-md hover:shadow-lg transition-shadow
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
      onClick={() => onClick?.(spec.id)}
    >
      <h3 className="text-lg font-bold text-text mb-2">
        {spec.props.title || 'Card Title'}
      </h3>
      <p className="text-secondary text-sm">
        {spec.props.description || 'Card description'}
      </p>
    </div>
  );
};

/**
 * Card Grid component renderer
 */
export const CardGridComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const items = spec.props.items || [1, 2, 3, 4];

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="grid grid-cols-2 gap-4">
        {items.map((_item: any, index: number) => (
          <div key={index} className="p-4 bg-surface rounded-md shadow">
            <p className="text-text font-medium">Item {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Form component renderer
 */
export const FormComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  return (
    <form
      className={`space-y-4 p-4 bg-surface rounded-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onClick?.(spec.id)}
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label className="block text-sm font-medium text-text mb-1">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
          placeholder="Enter name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
          placeholder="Enter email"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
      >
        Submit
      </button>
    </form>
  );
};

/**
 * Input component renderer
 */
export const InputComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {spec.props.label || 'Input'}
      </label>
      <input
        type={spec.props.type || 'text'}
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
        placeholder={spec.props.placeholder || 'Enter text'}
      />
    </div>
  );
};

/**
 * Select component renderer
 */
export const SelectComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const options = spec.props.options || ['Option 1', 'Option 2', 'Option 3'];

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {spec.props.label || 'Select'}
      </label>
      <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-text">
        {options.map((option: string, index: number) => (
          <option key={index}>{option}</option>
        ))}
      </select>
    </div>
  );
};

/**
 * Textarea component renderer
 */
export const TextareaComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {spec.props.label || 'Textarea'}
      </label>
      <textarea
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
        rows={spec.props.rows || 4}
        placeholder={spec.props.placeholder || 'Enter text'}
      />
    </div>
  );
};

/**
 * Progress component renderer
 */
export const ProgressComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const value = spec.props.value || 50;

  return (
    <div
      className={`p-4 ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-text">{spec.props.label || 'Progress'}</span>
        <span className="text-sm font-medium text-text">{value}%</span>
      </div>
      <div className="w-full bg-surface rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Tooltip component renderer
 */
export const TooltipComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative inline-block ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button className="px-4 py-2 bg-primary text-white rounded-md">
        Hover me
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-text text-background text-sm rounded-md shadow-lg whitespace-nowrap">
          {spec.props.content || 'Tooltip content'}
        </div>
      )}
    </div>
  );
};

/**
 * Drawer component renderer
 */
export const DrawerComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [isOpen, setIsOpen] = useState(spec.props.open || false);
  const position = spec.props.position || 'right';

  return (
    <div onClick={() => onClick?.(spec.id)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        {isOpen ? 'Close' : 'Open'} Drawer
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div
            className={`
              fixed bg-background shadow-xl p-6 h-full w-80
              ${position === 'left' ? 'left-0' : 'right-0'}
              ${isSelected ? 'ring-2 ring-primary' : ''}
            `}
          >
            <h3 className="text-lg font-bold text-text mb-4">
              {spec.props.title || 'Drawer'}
            </h3>
            <p className="text-text">{spec.props.content || 'Drawer content'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dialog component renderer (similar to modal but different styling)
 */
export const DialogComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [isOpen, setIsOpen] = useState(spec.props.open || true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Open Dialog
      </button>
    );
  }

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6">
          <h3 className="text-xl font-bold text-text mb-2">
            {spec.props.title || 'Dialog'}
          </h3>
          <p className="text-secondary mb-6">
            {spec.props.message || 'Dialog message'}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Tray component renderer (bottom sheet)
 */
export const TrayComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [isOpen, setIsOpen] = useState(spec.props.open || false);

  return (
    <div onClick={() => onClick?.(spec.id)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        {isOpen ? 'Close' : 'Open'} Tray
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div
            className={`
              w-full bg-background rounded-t-lg shadow-xl p-6 max-h-96
              ${isSelected ? 'ring-2 ring-primary' : ''}
            `}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text mb-4">
              {spec.props.title || 'Tray'}
            </h3>
            <p className="text-text">{spec.props.content || 'Tray content'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Popover component renderer
 */
export const PopoverComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative inline-block ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Toggle Popover
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg p-4 z-10">
          <h4 className="font-bold text-text mb-2">{spec.props.title || 'Popover'}</h4>
          <p className="text-sm text-secondary">{spec.props.content || 'Popover content'}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Component renderer factory that maps component types to their renderers
 */
export const renderComponent = (
  spec: ComponentSpec,
  props: Omit<UIComponentProps, 'spec'>
): React.ReactElement => {
  const componentProps = { spec, ...props };

  switch (spec.type) {
    case 'button':
      return <ButtonComponent {...componentProps} />;
    case 'slider':
      return <SliderComponent {...componentProps} />;
    case 'toggle':
      return <ToggleComponent {...componentProps} />;
    case 'tabs':
      return <TabsComponent {...componentProps} />;
    case 'modal':
      return <ModalComponent {...componentProps} />;
    case 'card':
      return <CardComponent {...componentProps} />;
    case 'card-grid':
      return <CardGridComponent {...componentProps} />;
    case 'form':
      return <FormComponent {...componentProps} />;
    case 'input':
      return <InputComponent {...componentProps} />;
    case 'select':
      return <SelectComponent {...componentProps} />;
    case 'textarea':
      return <TextareaComponent {...componentProps} />;
    case 'progress':
      return <ProgressComponent {...componentProps} />;
    case 'tooltip':
      return <TooltipComponent {...componentProps} />;
    case 'drawer':
      return <DrawerComponent {...componentProps} />;
    case 'dialog':
      return <DialogComponent {...componentProps} />;
    case 'tray':
      return <TrayComponent {...componentProps} />;
    case 'popover':
      return <PopoverComponent {...componentProps} />;
    default:
      return (
        <div className="p-4 border-2 border-dashed border-border rounded-md">
          <p className="text-secondary text-sm">Unknown component: {spec.type}</p>
        </div>
      );
  }
};