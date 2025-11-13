import React from 'react';
import { ComponentSpec } from '../../../schema';
import { SettingsPanelComponent } from './SettingsPanel';
import {
  ButtonComponent,
  SliderComponent,
  ToggleComponent,
  TabsComponent,
  ModalComponent,
  CardComponent,
  CardGridComponent,
  FormComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
  ProgressComponent,
  TooltipComponent,
  DrawerComponent,
  DialogComponent,
  TrayComponent,
  PopoverComponent,
} from './UIComponents';

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
