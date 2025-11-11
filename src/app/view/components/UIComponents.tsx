import React, { useState } from 'react';
import { ComponentSpec } from '../../../schema';
import { SettingsPanelComponent } from './SettingsPanel';

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
  const props = spec.props as Record<string, unknown>;
  const [isPressed, setIsPressed] = useState(false);
  const label = (props.label as string) || 'Button';

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
  {label}
    </button>
  );
};

/**
 * Slider component renderer
 */
export const SliderComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const rawValue = props.value as number | string | undefined;
  const initialValue = typeof rawValue === 'number' ? rawValue : (typeof rawValue === 'string' && !Number.isNaN(Number(rawValue)) ? Number(rawValue) : 50);
  const [value, setValue] = useState<number>(initialValue);
  const minRaw = props.min as number | string | undefined;
  const maxRaw = props.max as number | string | undefined;
  const min = typeof minRaw === 'number' ? minRaw : (typeof minRaw === 'string' && !Number.isNaN(Number(minRaw)) ? Number(minRaw) : 0);
  const max = typeof maxRaw === 'number' ? maxRaw : (typeof maxRaw === 'string' && !Number.isNaN(Number(maxRaw)) ? Number(maxRaw) : 100);

  return (
    <div
      className={`p-4 ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium mb-2 text-text">
  {(props.label as string) || 'Slider'}: {value}
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
  const props = spec.props as Record<string, unknown>;
  const initChecked = typeof props.checked === 'boolean' ? (props.checked as boolean) : false;
  const [enabled, setEnabled] = useState<boolean>(initChecked);

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
  <span className="text-sm font-medium text-text">{(props.label as string) || 'Toggle'}</span>
    </div>
  );
};

/**
 * Tabs component renderer
 */
export const TabsComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const tabs = Array.isArray(props.tabs) ? (props.tabs as string[]) : ['Tab 1', 'Tab 2', 'Tab 3'];
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
  const props = spec.props as Record<string, unknown>;
  const openInit = typeof props.open === 'boolean' ? (props.open as boolean) : true;
  const [isOpen, setIsOpen] = useState<boolean>(openInit);

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
            {(props.title as string) || 'Modal Title'}
          </h3>
          <p className="text-text mb-6">
            {(props.content as string) || 'Modal content goes here'}
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
  const props = spec.props as Record<string, unknown>;
  const title = (props.title as string) || 'Card Title';
  const description = (props.description as string) || 'Card description';
  return (
    <div
      className={`
        p-6 bg-surface rounded-lg shadow-md hover:shadow-lg transition-shadow
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
      onClick={() => onClick?.(spec.id)}
    >
      <h3 className="text-lg font-bold text-text mb-2">
        {title}
      </h3>
      <p className="text-secondary text-sm">
        {description}
      </p>
    </div>
  );
};

/**
 * Card Grid component renderer
 */
export const CardGridComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const items = Array.isArray(props.items) ? (props.items as unknown[]) : [1, 2, 3, 4];

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="grid grid-cols-2 gap-4">
  {items.map((_item: unknown, index: number) => (
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
  const props = spec.props as Record<string, unknown>;
  const label = (props.label as string) || 'Input';
  const type = (props.type as string) || 'text';
  const placeholder = (props.placeholder as string) || 'Enter text';
  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
        placeholder={placeholder}
      />
    </div>
  );
};

/**
 * Select component renderer
 */
export const SelectComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const options = Array.isArray(props.options) ? (props.options as string[]) : ['Option 1', 'Option 2', 'Option 3'];

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {(props.label as string) || 'Select'}
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
  const props = spec.props as Record<string, unknown>;
  const label = (props.label as string) || 'Textarea';
  const rowsRaw = props.rows as number | string | undefined;
  const rows = typeof rowsRaw === 'number' ? rowsRaw : (typeof rowsRaw === 'string' && !Number.isNaN(Number(rowsRaw)) ? Number(rowsRaw) : 4);
  const placeholder = (props.placeholder as string) || 'Enter text';
  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary rounded-md p-2' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <label className="block text-sm font-medium text-text mb-1">
        {label}
      </label>
      <textarea
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text"
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
};

/**
 * Progress component renderer
 */
export const ProgressComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const rawValue = props.value as number | string | undefined;
  const value = typeof rawValue === 'number' ? rawValue : (typeof rawValue === 'string' && !Number.isNaN(Number(rawValue)) ? Number(rawValue) : 50);

  return (
    <div
      className={`p-4 ${isSelected ? 'ring-2 ring-primary rounded-md' : ''}`}
      onClick={() => onClick?.(spec.id)}
    >
      <div className="flex justify-between mb-1">
  <span className="text-sm font-medium text-text">{(props.label as string) || 'Progress'}</span>
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
  const props = spec.props as Record<string, unknown>;
  const [showTooltip, setShowTooltip] = useState(false);
  const content = (props.content as string) || 'Tooltip content';

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
          {content}
        </div>
      )}
    </div>
  );
};

/**
 * Drawer component renderer
 */
export const DrawerComponent: React.FC<UIComponentProps> = ({ spec, isSelected, onClick }) => {
  const props = spec.props as Record<string, unknown>;
  const openInit = typeof props.open === 'boolean' ? (props.open as boolean) : false;
  const [isOpen, setIsOpen] = useState<boolean>(openInit);
  const position = (props.position as string) || 'right';
  const title = (props.title as string) || 'Drawer';
  const content = (props.content as string) || 'Drawer content';

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
                {title}
            </h3>
            <p className="text-text">{content}</p>
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
  const props = spec.props as Record<string, unknown>;
  const openInit = typeof props.open === 'boolean' ? (props.open as boolean) : true;
  const [isOpen, setIsOpen] = useState<boolean>(openInit);

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
            {(props.title as string) || 'Dialog'}
          </h3>
          <p className="text-secondary mb-6">
            {(props.message as string) || 'Dialog message'}
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
  const props = spec.props as Record<string, unknown>;
  const openInit = typeof props.open === 'boolean' ? (props.open as boolean) : false;
  const [isOpen, setIsOpen] = useState<boolean>(openInit);

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
                {(props.title as string) || 'Tray'}
            </h3>
            <p className="text-text">{(props.content as string) || 'Tray content'}</p>
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
          <h4 className="font-bold text-text mb-2">{(spec.props.title as string) || 'Popover'}</h4>
          <p className="text-sm text-secondary">{(spec.props.content as string) || 'Popover content'}</p>
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
    case 'settings-panel':
      // For settings panel, we need to find child components
      // This is a simplified implementation - in practice, we'd need to pass child components
      return <SettingsPanelComponent {...componentProps} childComponents={[]} />;
    default:
      return (
        <div className="p-4 border-2 border-dashed border-border rounded-md">
          <p className="text-secondary text-sm">Unknown component: {spec.type}</p>
        </div>
      );
  }
};