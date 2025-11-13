// Skeleton generator parameters are defined below
import { ComponentSpec, ComponentType, createComponent, generateId } from '../../schema';

/**
 * Skeleton generator parameters for customizing templates.
 */
export interface SkeletonParams {
  region?: string;
  x?: number;
  w?: number;
  h?: number;
  sliderCount?: number;
  toggleCount?: number;
  y?: number;
  title?: string;
  labels?: string[];
  count?: number;
  props?: Record<string, unknown>;
  size?: 'small' | 'medium' | 'large' | 'responsive';
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  variant?: string;
  [key: string]: unknown;
}

/**
 * Generate a Settings Panel skeleton with sliders and toggles.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a complete settings panel
 * 
 * @example
 * generateSettingsPanel({ sliderCount: 6, toggleCount: 4, region: 'sidebar' })
 */
export function generateSettingsPanel(params: SkeletonParams & { 
  sliderCount?: number; 
  toggleCount?: number;
  sectionCount?: number;
  includeColorPicker?: boolean;
  includeTextInputs?: boolean;
  includeSelects?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'sidebar',
    x = 20,
    y = 20,
    title = 'Settings',
    sliderCount = 3,
    toggleCount = 2,
    sectionCount = 2,
    includeColorPicker = true,
    includeTextInputs = true,
    includeSelects = true,
  } = params;

  const components: ComponentSpec[] = [];
  let currentY = y + 40; // Start below title

  // Add title
  components.push(createComponent(
    'input',
    {
      x,
      y,
      w: 280,
      h: 30,
      region,
    },
    {
      props: {
        label: title,
        type: 'title',
        disabled: true,
        value: title,
      },
    }
  ));

  // Add sections with different settings
  for (let section = 0; section < sectionCount; section++) {
    // Section header
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 280,
        h: 30,
        region,
      },
      {
        props: {
          label: `Section ${section + 1}`,
          type: 'section-header',
          disabled: true,
          value: `Section ${section + 1}`,
        },
      }
    ));
    currentY += 40;

    // Add sliders
    for (let i = 0; i < sliderCount; i++) {
      components.push(createComponent(
        'slider',
        {
          x,
          y: currentY,
          w: 280,
          h: 40,
          region,
        },
        {
          props: {
            label: `Slider ${section + 1}-${i + 1}`,
            min: 0,
            max: 100,
            value: Math.floor(Math.random() * 100),
          },
        }
      ));
      currentY += 60;
    }

    // Add toggles
    for (let i = 0; i < toggleCount; i++) {
      components.push(createComponent(
        'toggle',
        {
          x,
          y: currentY,
          w: 280,
          h: 30,
          region,
        },
        {
          props: {
            label: `Toggle ${section + 1}-${i + 1}`,
            checked: Math.random() > 0.5,
          },
        }
      ));
      currentY += 50;
    }

    // Add text inputs if requested
    if (includeTextInputs) {
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: 280,
          h: 36,
          region,
        },
        {
          props: {
            label: `Input ${section + 1}`,
            placeholder: `Enter value ${section + 1}`,
            type: 'text',
          },
        }
      ));
      currentY += 60;
    }

    // Add selects if requested
    if (includeSelects) {
      components.push(createComponent(
        'select',
        {
          x,
          y: currentY,
          w: 280,
          h: 36,
          region,
        },
        {
          props: {
            label: `Select ${section + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            placeholder: 'Choose an option',
          },
        }
      ));
      currentY += 60;
    }

    // Add color picker if requested
    if (includeColorPicker) {
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: 280,
          h: 36,
          region,
        },
        {
          props: {
            label: `Color ${section + 1}`,
            type: 'color',
            value: `#${Math.floor(Math.random()*1677215).toString(16)}`,
          },
        }
      ));
      currentY += 60;
    }

    // Add spacing between sections
    currentY += 20;
  }

 // Add save/cancel buttons at the bottom
  components.push(createComponent(
    'button',
    {
      x,
      y: currentY,
      w: 120,
      h: 40,
      region,
    },
    {
      props: {
        label: 'Save',
        variant: 'primary',
      },
    }
  ));

  components.push(createComponent(
    'button',
    {
      x: x + 160,
      y: currentY,
      w: 120,
      h: 40,
      region,
    },
    {
      props: {
        label: 'Cancel',
        variant: 'secondary',
      },
    }
  ));

  return components;
}

/**
 * Generate a Tabs skeleton with multiple tab panels and content.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a tabs interface
 * 
 * @example
 * generateTabs({ labels: ['General', 'Display', 'Network'] })
 */
export function generateTabs(params: SkeletonParams & {
  labels?: string[];
  tabContent?: string[];
  includeInputs?: boolean;
  includeButtons?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    labels = ['General', 'Display', 'Network'],
    includeInputs = true,
    includeButtons = true,
  } = params;

  const components: ComponentSpec[] = [];

  // Create the main tabs container
  components.push(createComponent(
    'tabs',
    {
      x,
      y,
      w: 600,
      h: 400,
      region,
    },
    {
      props: {
        tabs: labels.map((label, index) => ({
          id: generateId(),
          label,
          active: index === 0,
        })),
        activeTab: 0,
      },
    }
  ));

  // Add content for each tab (these would be positioned within the tab area)
  let currentY = y + 80; // Start below the tab headers

  // Add some content for the first tab as an example
  if (includeInputs) {
    // Text input
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 350,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Name',
          placeholder: 'Enter your name',
          type: 'text',
        },
      }
    ));
    currentY += 60;

    // Email input
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 350,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Email',
          placeholder: 'Enter your email',
          type: 'email',
        },
      }
    ));
    currentY += 60;

    // Select dropdown
    components.push(createComponent(
      'select',
      {
        x: x + 20,
        y: currentY,
        w: 350,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Country',
          options: ['USA', 'Canada', 'UK', 'Other'],
          placeholder: 'Select a country',
        },
      }
    ));
    currentY += 60;
  }

  if (includeButtons) {
    // Submit button
    components.push(createComponent(
      'button',
      {
        x: x + 20,
        y: currentY,
        w: 120,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Submit',
          variant: 'primary',
        },
      }
    ));

    components.push(createComponent(
      'button',
      {
        x: x + 160,
        y: currentY,
        w: 120,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Reset',
          variant: 'secondary',
        },
      }
    ));
  }

 return components;
}

/**
 * Generate a Modal skeleton with sophisticated content and actions.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a modal dialog
 * 
 * @example
 * generateModal({ title: 'Confirm Action', region: 'main' })
 */
export function generateModal(params: SkeletonParams & {
  includeForm?: boolean;
  includeImage?: boolean;
  actionButtons?: number;
  includeCloseButton?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 300,
    y = 150,
    title = 'Modal Title',
    props = {},
    includeForm = true,
    includeImage = false,
    actionButtons = 2,
    includeCloseButton = true,
 } = params;

 const components: ComponentSpec[] = [];
  let currentY = y + 50; // Start below title

  // Main modal container
  components.push(createComponent(
    'modal',
    {
      x,
      y,
      w: 500,
      h: 500,
      region,
    },
    {
      props: {
        title,
        visible: true,
        closable: true,
  ...(props ?? {}),
      },
    }
  ));

  // Add title inside modal
  components.push(createComponent(
    'input',
    {
      x: x + 20,
      y: y + 20,
      w: 460,
      h: 30,
      region,
    },
    {
      props: {
        label: title,
        type: 'title',
        disabled: true,
        value: title,
      },
    }
  ));

  // Add image if requested
  if (includeImage) {
    components.push(createComponent(
      'card',
      {
        x: x + 20,
        y: currentY,
        w: 460,
        h: 150,
        region,
      },
      {
        props: {
          title: 'Preview Image',
          description: 'Image content would go here',
        },
      }
    ));
    currentY += 170;
  }

 // Add form content if requested
  if (includeForm) {
    // Text input
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 460,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Username',
          placeholder: 'Enter username',
          type: 'text',
        },
      }
    ));
    currentY += 60;

    // Password input
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 460,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Password',
          placeholder: 'Enter password',
          type: 'password',
        },
      }
    ));
    currentY += 60;

    // Toggle
    components.push(createComponent(
      'toggle',
      {
        x: x + 20,
        y: currentY,
        w: 460,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Remember me',
          checked: false,
        },
      }
    ));
    currentY += 50;
  }

  // Calculate button positions
  const buttonAreaY = y + 400;
  const buttonWidth = 120;
  const totalButtonWidth = actionButtons * buttonWidth + (actionButtons - 1) * 10;
  const startX = x + (500 - totalButtonWidth) / 2;

  // Add action buttons
  for (let i = 0; i < actionButtons; i++) {
    const buttonLabels = ['Confirm', 'Cancel', 'Save', 'Delete'];
    const buttonVariants = ['primary', 'secondary', 'danger'];
    
    components.push(createComponent(
      'button',
      {
        x: startX + i * (buttonWidth + 10),
        y: buttonAreaY,
        w: buttonWidth,
        h: 40,
        region,
      },
      {
        props: {
          label: buttonLabels[i % buttonLabels.length],
          variant: buttonVariants[i % buttonVariants.length],
        },
      }
    ));
  }

  // Add close button if requested
 if (includeCloseButton) {
    components.push(createComponent(
      'button',
      {
        x: x + 450,
        y: y + 20,
        w: 30,
        h: 30,
        region,
      },
      {
        props: {
          label: '✕',
          variant: 'icon',
        },
      }
    ));
  }

  return components;
}

/**
 * Generate a Tray skeleton (slide-out panel) with realistic items and interactions.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a tray
 * 
 * @example
 * generateTray({ title: 'Notifications', region: 'right' })
 */
export function generateTray(params: SkeletonParams & {
  itemCount?: number;
  includeHeaders?: boolean;
  includeActions?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
} = {}): ComponentSpec[] {
  const {
    region = 'right',
    x = 800,
    y = 0,
    title = 'Tray',
    props = {},
    itemCount = 5,
    includeHeaders = true,
    includeActions = true,
    position = 'right',
  } = params;

  const components: ComponentSpec[] = [];
  let currentY = y + 50; // Start below title

  // Main tray container
 components.push(createComponent(
    'tray',
    {
      x,
      y,
      w: 320,
      h: 600,
      region,
    },
    {
      props: {
        title,
        visible: true,
        position,
  ...(props ?? {}),
      },
    }
  ));

  // Add title inside tray
  components.push(createComponent(
    'input',
    {
      x: x + 20,
      y: y + 20,
      w: 280,
      h: 30,
      region,
    },
    {
      props: {
        label: title,
        type: 'title',
        disabled: true,
        value: title,
      },
    }
  ));

  // Add header if requested
  if (includeHeaders) {
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 280,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Recent Items',
          type: 'section-header',
          disabled: true,
          value: 'Recent Items',
        },
      }
    ));
    currentY += 40;
  }

  // Add tray items
 for (let i = 0; i < itemCount; i++) {
    // Item card
    components.push(createComponent(
      'card',
      {
        x: x + 20,
        y: currentY,
        w: 280,
        h: 80,
        region,
      },
      {
        props: {
          title: `Item ${i + 1}`,
          description: `Description for item ${i + 1}`,
        },
      }
    ));

    // Add action button to each item if requested
    if (includeActions) {
      components.push(createComponent(
        'button',
        {
          x: x + 240,
          y: currentY + 20,
          w: 60,
          h: 40,
          region,
        },
        {
          props: {
            label: 'View',
            variant: 'small',
          },
        }
      ));
    }

    currentY += 100;
  }

  // Add search input at the bottom if there are many items
  if (itemCount > 3) {
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 280,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Search',
          placeholder: 'Search items...',
          type: 'text',
        },
      }
    ));
    currentY += 50;
  }

 // Add close button
  components.push(createComponent(
    'button',
    {
      x: x + 270,
      y: y + 20,
      w: 30,
      h: 30,
      region,
    },
    {
      props: {
        label: '✕',
        variant: 'icon',
      },
    }
  ));

  return components;
}

/**
 * Generate a Card Grid skeleton with responsive design and enhanced cards.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a card grid
 * 
 * @example
 * generateCardGrid({ count: 6, region: 'main' })
 */
export function generateCardGrid(params: SkeletonParams & {
  count?: number;
  columns?: number;
  includeImages?: boolean;
  includeActions?: boolean;
  cardHeight?: number;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    count = 6,
    columns = 3,
    includeImages = true,
    includeActions = true,
    cardHeight = 200,
  } = params;

  const components: ComponentSpec[] = [];

  // Calculate grid dimensions
  const cardWidth = 250;
  const gap = 20;
  const rows = Math.ceil(count / columns);
  const gridWidth = columns * cardWidth + (columns - 1) * gap;
  const gridHeight = rows * cardHeight + (rows - 1) * gap;

  // Main card grid container
 components.push(createComponent(
    'card-grid',
    {
      x,
      y,
      w: gridWidth,
      h: gridHeight,
      region,
    },
    {
      props: {
        columns,
        gap,
        cards: Array.from({ length: count }, (_, i) => ({
          id: generateId(),
          title: `Card ${i + 1}`,
          description: `Description for card ${i + 1}`,
        })),
      },
    }
  ));

  // Add individual cards in a grid layout
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    const cardX = x + col * (cardWidth + gap);
    const cardY = y + row * (cardHeight + gap);

    // Card container
    components.push(createComponent(
      'card',
      {
        x: cardX,
        y: cardY,
        w: cardWidth,
        h: cardHeight,
        region,
      },
      {
        props: {
          title: `Card ${i + 1}`,
          description: `Description for card ${i + 1}`,
        },
      }
    ));

    // Add image to card if requested
    if (includeImages) {
      components.push(createComponent(
        'card',
        {
          x: cardX + 10,
          y: cardY + 10,
          w: cardWidth - 20,
          h: 80,
          region,
        },
        {
          props: {
            title: 'Image Preview',
            description: 'Image would go here',
          },
        }
      ));
    }

    // Add action buttons if requested
    if (includeActions) {
      const actionY = cardY + cardHeight - 50;
      components.push(createComponent(
        'button',
        {
          x: cardX + 15,
          y: actionY,
          w: 80,
          h: 35,
          region,
        },
        {
          props: {
            label: 'View',
            variant: 'small',
          },
        }
      ));

      components.push(createComponent(
        'button',
        {
          x: cardX + 110,
          y: actionY,
          w: 80,
          h: 35,
          region,
        },
        {
          props: {
            label: 'Edit',
            variant: 'small',
          },
        }
      ));

      components.push(createComponent(
        'button',
        {
          x: cardX + 205,
          y: actionY,
          w: 30,
          h: 35,
          region,
        },
        {
          props: {
            label: '…',
            variant: 'icon',
          },
        }
      ));
    }
  }

  return components;
}

/**
 * Generate a Form skeleton with various input types and validation.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a form
 * 
 * @example
 * generateForm({ title: 'User Profile', region: 'main' })
 */
export function generateForm(params: SkeletonParams & {
  title?: string;
  includeValidation?: boolean;
  includeFileUpload?: boolean;
  includeDate?: boolean;
  includeRadio?: boolean;
  includeCheckboxGroup?: boolean;
  includeTextarea?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    title = 'Form',
    includeValidation = true,
    includeFileUpload = true,
    includeDate = true,
    includeRadio = true,
    includeCheckboxGroup = true,
    includeTextarea = true,
  } = params;

 const components: ComponentSpec[] = [];
  let currentY = y + 40;

  // Add form title
  components.push(createComponent(
    'input',
    {
      x,
      y,
      w: 400,
      h: 30,
      region,
    },
    {
      props: {
        label: title,
        type: 'title',
        disabled: true,
        value: title,
      },
    }
  ));

  // Text input
  components.push(createComponent(
    'input',
    {
      x,
      y: currentY,
      w: 350,
      h: 36,
      region,
    },
    {
      props: {
        label: 'Full Name',
        placeholder: 'Enter your full name',
        type: 'text',
        required: includeValidation,
      },
    }
  ));
  currentY += 60;

  // Email input
  components.push(createComponent(
    'input',
    {
      x,
      y: currentY,
      w: 350,
      h: 36,
      region,
    },
    {
      props: {
        label: 'Email Address',
        placeholder: 'Enter your email',
        type: 'email',
        required: includeValidation,
      },
    }
  ));
  currentY += 60;

  // Phone input
  components.push(createComponent(
    'input',
    {
      x,
      y: currentY,
      w: 350,
      h: 36,
      region,
    },
    {
      props: {
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        type: 'tel',
      },
    }
  ));
  currentY += 60;

  if (includeDate) {
    // Date input
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 350,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Birth Date',
          type: 'date',
        },
      }
    ));
    currentY += 60;
  }

 // Select dropdown
 components.push(createComponent(
    'select',
    {
      x,
      y: currentY,
      w: 350,
      h: 36,
      region,
    },
    {
      props: {
        label: 'Country',
        options: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Other'],
        placeholder: 'Select a country',
        required: includeValidation,
      },
    }
  ));
  currentY += 60;

  if (includeRadio) {
    // Radio group
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 350,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Gender',
          type: 'radio-group',
        },
      }
    ));
    currentY += 50;
  }

 if (includeCheckboxGroup) {
    // Checkbox group
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 350,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Interests',
          type: 'checkbox-group',
        },
      }
    ));
    currentY += 50;
  }

  if (includeFileUpload) {
    // File upload
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 350,
        h: 36,
        region,
      },
      {
        props: {
          label: 'Profile Picture',
          type: 'file',
          placeholder: 'Choose file...',
        },
      }
    ));
    currentY += 60;
  }

  if (includeTextarea) {
    // Textarea
    components.push(createComponent(
      'textarea',
      {
        x,
        y: currentY,
        w: 350,
        h: 120,
        region,
      },
      {
        props: {
          label: 'Bio',
          placeholder: 'Tell us about yourself',
          rows: 4,
        },
      }
    ));
    currentY += 140;
  }

 // Form actions
 components.push(createComponent(
    'button',
    {
      x,
      y: currentY,
      w: 120,
      h: 40,
      region,
    },
    {
      props: {
        label: 'Submit',
        variant: 'primary',
      },
    }
  ));

  components.push(createComponent(
    'button',
    {
      x: x + 140,
      y: currentY,
      w: 120,
      h: 40,
      region,
    },
    {
      props: {
        label: 'Reset',
        variant: 'secondary',
      },
    }
  ));

  components.push(createComponent(
    'button',
    {
      x: x + 280,
      y: currentY,
      w: 120,
      h: 40,
      region,
    },
    {
      props: {
        label: 'Cancel',
        variant: 'outline',
      },
    }
  ));

  return components;
}

/**
 * Generate a Lens (detail view) skeleton with better visual feedback.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a lens view
 * 
 * @example
 * generateLens({ title: 'Details', region: 'main' })
 */
export function generateLens(params: SkeletonParams & {
  includeDetails?: boolean;
  includeMetadata?: boolean;
  includeActions?: boolean;
  includeRelatedItems?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    title = 'Details',
    includeDetails = true,
    includeMetadata = true,
    includeActions = true,
    includeRelatedItems = true,
  } = params;

  const components: ComponentSpec[] = [];
  let currentY = y + 50;

  // Main dialog container
  components.push(createComponent(
    'dialog',
    {
      x,
      y,
      w: 700,
      h: 600,
      region,
    },
    {
      props: {
        title,
        visible: true,
        closable: true,
        content: 'Detailed view content here',
      },
    }
  ));

  // Add title inside dialog
 components.push(createComponent(
    'input',
    {
      x: x + 20,
      y: y + 20,
      w: 660,
      h: 30,
      region,
    },
    {
      props: {
        label: title,
        type: 'title',
        disabled: true,
        value: title,
      },
    }
  ));

  // Add main content area
  if (includeDetails) {
    // Large title
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 660,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Item Title',
          type: 'large-title',
          disabled: true,
          value: 'Detailed Item Title',
        },
      }
    ));
    currentY += 50;

    // Description
    components.push(createComponent(
      'textarea',
      {
        x: x + 20,
        y: currentY,
        w: 660,
        h: 100,
        region,
      },
      {
        props: {
          label: 'Description',
          value: 'Detailed description of the item would appear here with more information about its features and functionality.',
          rows: 4,
          disabled: true,
        },
      }
    ));
    currentY += 120;
  }

  // Add metadata section if requested
  if (includeMetadata) {
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 660,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Metadata',
          type: 'section-header',
          disabled: true,
          value: 'Metadata',
        },
      }
    ));
    currentY += 40;

    // Metadata items
    const metadataItems = [
      { label: 'Created', value: '2023-01-15' },
      { label: 'Modified', value: '2023-05-20' },
      { label: 'Author', value: 'John Doe' },
      { label: 'Status', value: 'Active' },
    ];

    for (const item of metadataItems) {
      components.push(createComponent(
        'input',
        {
          x: x + 20,
          y: currentY,
          w: 300,
          h: 30,
          region,
        },
        {
          props: {
            label: item.label,
            type: 'metadata-label',
            disabled: true,
            value: item.label,
          },
        }
      ));

      components.push(createComponent(
        'input',
        {
          x: x + 150,
          y: currentY,
          w: 200,
          h: 30,
          region,
        },
        {
          props: {
            label: item.value,
            type: 'metadata-value',
            disabled: true,
            value: item.value,
          },
        }
      ));

      currentY += 40;
    }
  }

  // Add related items if requested
  if (includeRelatedItems) {
    currentY += 20; // Add some space
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: currentY,
        w: 660,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Related Items',
          type: 'section-header',
          disabled: true,
          value: 'Related Items',
        },
      }
    ));
    currentY += 40;

    // Related item cards
    for (let i = 0; i < 3; i++) {
      components.push(createComponent(
        'card',
        {
          x: x + 20 + i * 220,
          y: currentY,
          w: 200,
          h: 100,
          region,
        },
        {
          props: {
            title: `Related Item ${i + 1}`,
            description: `Description for related item ${i + 1}`,
          },
        }
      ));
    }
    currentY += 120;
  }

  // Add action buttons if requested
  if (includeActions) {
    const buttonAreaY = y + 520; // Positioned at bottom
    
    components.push(createComponent(
      'button',
      {
        x: x + 20,
        y: buttonAreaY,
        w: 100,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Edit',
          variant: 'primary',
        },
      }
    ));

    components.push(createComponent(
      'button',
      {
        x: x + 140,
        y: buttonAreaY,
        w: 100,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Share',
          variant: 'secondary',
        },
      }
    ));

    components.push(createComponent(
      'button',
      {
        x: x + 260,
        y: buttonAreaY,
        w: 100,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Delete',
          variant: 'danger',
        },
      }
    ));

    components.push(createComponent(
      'button',
      {
        x: x + 580,
        y: buttonAreaY,
        w: 100,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Close',
          variant: 'outline',
        },
      }
    ));
  }

  // Add close button
  components.push(createComponent(
    'button',
    {
      x: x + 650,
      y: y + 20,
      w: 30,
      h: 30,
      region,
    },
    {
      props: {
        label: '✕',
        variant: 'icon',
      },
    }
  ));

  return components;
}

/**
 * Generate a Navigation skeleton with navbar, sidebar, and breadcrumbs.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a navigation pattern
 * 
 * @example
 * generateNavigation({ type: 'navbar', items: ['Home', 'About', 'Contact'] })
 */
export function generateNavigation(params: SkeletonParams & {
  navType?: 'navbar' | 'sidebar' | 'breadcrumbs';
  items?: string[];
  includeSearch?: boolean;
  includeUserMenu?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'header',
    x = 0,
    y = 0,
    navType = 'navbar',
    items = ['Home', 'Products', 'Services', 'About', 'Contact'],
    includeSearch = true,
    includeUserMenu = true,
 } = params;

  const components: ComponentSpec[] = [];

  if (navType === 'navbar') {
    // Main navbar container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 1200,
        h: 60,
        region,
      },
      {
        props: {
          label: 'Navigation Bar',
          type: 'navbar',
          disabled: true,
        },
      }
    ));

    // Logo
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: y + 15,
        w: 100,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Logo',
          type: 'logo',
          disabled: true,
          value: 'LOGO',
        },
      }
    ));

    // Navigation items
    items.forEach((item, index) => {
      components.push(createComponent(
        'button',
        {
          x: x + 150 + index * 100,
          y: y + 15,
          w: 90,
          h: 30,
          region,
        },
        {
          props: {
            label: item,
            variant: 'nav',
          },
        }
      ));
    });

    // Search bar if requested
    if (includeSearch) {
      components.push(createComponent(
        'input',
        {
          x: x + 800,
          y: y + 15,
          w: 200,
          h: 30,
          region,
        },
        {
          props: {
            label: 'Search',
            type: 'search',
            placeholder: 'Search...',
          },
        }
      ));
    }

    // User menu if requested
    if (includeUserMenu) {
      components.push(createComponent(
        'button',
        {
          x: x + 1050,
          y: y + 15,
          w: 120,
          h: 30,
          region,
        },
        {
          props: {
            label: 'User',
            variant: 'user-menu',
          },
        }
      ));
    }
  } else if (navType === 'sidebar') {
    // Sidebar container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 250,
        h: 600,
        region,
      },
      {
        props: {
          label: 'Sidebar Navigation',
          type: 'sidebar',
          disabled: true,
        },
      }
    ));

    // Navigation items
    items.forEach((item, index) => {
      components.push(createComponent(
        'button',
        {
          x: x + 20,
          y: y + 80 + index * 50,
          w: 210,
          h: 40,
          region,
        },
        {
          props: {
            label: item,
            variant: 'nav',
          },
        }
      ));
    });
  } else if (navType === 'breadcrumbs') {
    // Breadcrumbs container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 800,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Breadcrumbs',
          type: 'breadcrumbs',
          disabled: true,
        },
      }
    ));

    // Breadcrumb items
    items.forEach((item, index) => {
      components.push(createComponent(
        'button',
        {
          x: x + index * 120,
          y: y + 10,
          w: 100,
          h: 20,
          region,
        },
        {
          props: {
            label: item,
            variant: 'breadcrumb',
          },
        }
      ));

      // Add separator except for last item
      if (index < items.length - 1) {
        components.push(createComponent(
          'input',
          {
            x: x + (index + 1) * 120 - 20,
            y: y + 10,
            w: 20,
            h: 20,
            region,
          },
          {
            props: {
              label: '/',
              type: 'separator',
              disabled: true,
            },
          }
        ));
      }
    });
  }

  return components;
}

/**
 * Generate a Data Display skeleton with table, chart, or list patterns.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for a data display pattern
 * 
 * @example
 * generateDataDisplay({ type: 'table', columns: ['Name', 'Email', 'Status'] })
 */
export function generateDataDisplay(params: SkeletonParams & {
  displayType?: 'table' | 'chart' | 'list';
  columns?: string[];
  rows?: number;
  includeFilters?: boolean;
  includePagination?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    displayType = 'table',
    columns = ['Name', 'Email', 'Status'],
    rows = 5,
    includeFilters = true,
    includePagination = true,
  } = params;

  const components: ComponentSpec[] = [];
  let currentY = y;

  if (displayType === 'table') {
    // Table container
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 800,
        h: 400,
        region,
      },
      {
        props: {
          label: 'Data Table',
          type: 'table',
          disabled: true,
        },
      }
    ));

    currentY += 40;

    // Table header
    columns.forEach((col, index) => {
      components.push(createComponent(
        'input',
        {
          x: x + index * 200,
          y: currentY,
          w: 190,
          h: 30,
          region,
        },
        {
          props: {
            label: col,
            type: 'table-header',
            disabled: true,
          },
        }
      ));
    });

    currentY += 40;

    // Table rows
    for (let i = 0; i < rows; i++) {
      columns.forEach((_, index) => {
        components.push(createComponent(
          'input',
          {
            x: x + index * 200,
            y: currentY,
            w: 190,
            h: 30,
            region,
          },
          {
            props: {
              label: `Cell ${i+1}-${index+1}`,
              type: 'table-cell',
              disabled: true,
            },
          }
        ));
      });
      currentY += 40;
    }

    // Add filters if requested
    if (includeFilters) {
      currentY += 20;
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: 800,
          h: 40,
          region,
        },
        {
          props: {
            label: 'Filters',
            type: 'filter-bar',
            disabled: true,
          },
        }
      ));
    }

    // Add pagination if requested
    if (includePagination) {
      currentY += 60;
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: 800,
          h: 40,
          region,
        },
        {
          props: {
            label: 'Pagination',
            type: 'pagination',
            disabled: true,
          },
        }
      ));
    }
  } else if (displayType === 'chart') {
    // Chart container
    components.push(createComponent(
      'card',
      {
        x,
        y: currentY,
        w: 600,
        h: 400,
        region,
      },
      {
        props: {
          title: 'Chart Visualization',
          description: 'Chart would be displayed here',
        },
      }
    ));

    // Chart controls
    components.push(createComponent(
      'select',
      {
        x: x + 20,
        y: currentY + 20,
        w: 150,
        h: 30,
        region,
      },
      {
        props: {
          label: 'Chart Type',
          options: ['Bar', 'Line', 'Pie', 'Area'],
          placeholder: 'Select chart type',
        },
      }
    ));
  } else if (displayType === 'list') {
    // List container
    components.push(createComponent(
      'input',
      {
        x,
        y: currentY,
        w: 500,
        h: 400,
        region,
      },
      {
        props: {
          label: 'Data List',
          type: 'list',
          disabled: true,
        },
      }
    ));

    // List items
    for (let i = 0; i < rows; i++) {
      components.push(createComponent(
        'card',
        {
          x: x + 20,
          y: currentY + 40 + i * 70,
          w: 460,
          h: 60,
          region,
        },
        {
          props: {
            title: `List Item ${i + 1}`,
            description: `Description for list item ${i + 1}`,
          },
        }
      ));
    }
  }

  return components;
}

/**
 * Generate an Input skeleton with search, filter, and date picker patterns.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for input patterns
 * 
 * @example
 * generateInput({ type: 'search', placeholder: 'Search items...' })
 */
export function generateInput(params: SkeletonParams & {
  inputType?: 'search' | 'filter' | 'date-picker' | 'autocomplete';
  placeholder?: string;
  options?: string[];
  includeButton?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 10,
    y = 10,
    inputType = 'search',
    placeholder = 'Enter text...',
    options = [],
    includeButton = true,
  } = params;

  const components: ComponentSpec[] = [];

  if (inputType === 'search') {
    // Search input
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 300,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Search',
          type: 'search',
          placeholder,
        },
      }
    ));

    if (includeButton) {
      components.push(createComponent(
        'button',
        {
          x: x + 260,
          y: y + 5,
          w: 30,
          h: 30,
          region,
        },
        {
          props: {
            label: '🔍',
            variant: 'icon',
          },
        }
      ));
    }
  } else if (inputType === 'filter') {
    // Filter container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 400,
        h: 120,
        region,
      },
      {
        props: {
          label: 'Filter Panel',
          type: 'filter-panel',
          disabled: true,
        },
      }
    ));

    // Filter inputs
    const filterFields = ['Category', 'Date Range', 'Status'];
    filterFields.forEach((field, index) => {
      components.push(createComponent(
        'input',
        {
          x: x + 20,
          y: y + 30 + index * 30,
          w: 150,
          h: 25,
          region,
        },
        {
          props: {
            label: field,
            type: 'filter-field',
            placeholder: `Filter by ${field.toLowerCase()}`,
          },
        }
      ));
    });

    // Apply button
    if (includeButton) {
      components.push(createComponent(
        'button',
        {
          x: x + 320,
          y: y + 80,
          w: 60,
          h: 30,
          region,
        },
        {
          props: {
            label: 'Apply',
            variant: 'small',
          },
        }
      ));
    }
  } else if (inputType === 'date-picker') {
    // Date picker
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 200,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Date',
          type: 'date',
          placeholder: 'Select date',
        },
      }
    ));

    if (includeButton) {
      components.push(createComponent(
        'button',
        {
          x: x + 160,
          y: y + 5,
          w: 30,
          h: 30,
          region,
        },
        {
          props: {
            label: '📅',
            variant: 'icon',
          },
        }
      ));
    }
  } else if (inputType === 'autocomplete') {
    // Autocomplete input
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 300,
        h: 40,
        region,
      },
      {
        props: {
          label: 'Autocomplete',
          type: 'text',
          placeholder,
        },
      }
    ));

    if (options.length > 0) {
      // Suggested options
      options.slice(0, 5).forEach((option, index) => {
        components.push(createComponent(
          'button',
          {
            x: x + 10,
            y: y + 45 + index * 30,
            w: 280,
            h: 25,
            region,
          },
          {
            props: {
              label: option,
              variant: 'suggestion',
            },
          }
        ));
      });
    }
  }

  return components;
}

/**
 * Generate a Feedback skeleton with toast, notification, and progress patterns.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for feedback patterns
 * 
 * @example
 * generateFeedback({ type: 'notification', message: 'Operation completed successfully' })
 */
export function generateFeedback(params: SkeletonParams & {
  feedbackType?: 'toast' | 'notification' | 'progress';
  message?: string;
  duration?: number;
  includeActions?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 100,
    y = 100,
    feedbackType = 'notification',
    message = 'This is a feedback message',
    includeActions = true,
  } = params;

  const components: ComponentSpec[] = [];

  if (feedbackType === 'toast') {
    // Toast notification
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 300,
        h: 60,
        region,
      },
      {
        props: {
          label: 'Toast Notification',
          type: 'toast',
          disabled: true,
        },
      }
    ));

    // Toast content
    components.push(createComponent(
      'input',
      {
        x: x + 10,
        y: y + 15,
        w: 240,
        h: 30,
        region,
      },
      {
        props: {
          label: message,
          type: 'toast-message',
          disabled: true,
          value: message,
        },
      }
    ));

    // Close button
    if (includeActions) {
      components.push(createComponent(
        'button',
        {
          x: x + 260,
          y: y + 15,
          w: 30,
          h: 30,
          region,
        },
        {
          props: {
            label: '✕',
            variant: 'icon',
          },
        }
      ));
    }
  } else if (feedbackType === 'notification') {
    // Notification container
    components.push(createComponent(
      'card',
      {
        x,
        y,
        w: 350,
        h: 120,
        region,
      },
      {
        props: {
          title: 'Notification',
          description: message,
        },
      }
    ));

    // Notification actions
    if (includeActions) {
      components.push(createComponent(
        'button',
        {
          x: x + 20,
          y: y + 80,
          w: 80,
          h: 30,
          region,
        },
        {
          props: {
            label: 'View',
            variant: 'small',
          },
        }
      ));

      components.push(createComponent(
        'button',
        {
          x: x + 120,
          y: y + 80,
          w: 80,
          h: 30,
          region,
        },
        {
          props: {
            label: 'Dismiss',
            variant: 'small',
          },
        }
      ));
    }
  } else if (feedbackType === 'progress') {
    // Progress container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 300,
        h: 80,
        region,
      },
      {
        props: {
          label: 'Progress Indicator',
          type: 'progress-container',
          disabled: true,
        },
      }
    ));

    // Progress bar
    components.push(createComponent(
      'progress',
      {
        x: x + 20,
        y: y + 30,
        w: 260,
        h: 20,
        region,
      },
      {
        props: {
          label: 'Progress',
          value: 65,
        },
      }
    ));

    // Progress text
    components.push(createComponent(
      'input',
      {
        x: x + 20,
        y: y + 10,
        w: 260,
        h: 20,
        region,
      },
      {
        props: {
          label: 'Uploading files...',
          type: 'progress-text',
          disabled: true,
          value: 'Uploading files...',
        },
      }
    ));
  }

  return components;
}

/**
 * Generate a Layout skeleton with grid, flex, and container patterns.
 * 
 * @param params - Customization parameters
 * @returns Array of component specifications for layout patterns
 * 
 * @example
 * generateLayout({ type: 'grid', columns: 3, rows: 2 })
 */
export function generateLayout(params: SkeletonParams & {
  layoutType?: 'grid' | 'flex' | 'container';
  columns?: number;
  rows?: number;
  includeHeader?: boolean;
  includeSidebar?: boolean;
  includeFooter?: boolean;
} = {}): ComponentSpec[] {
  const {
    region = 'main',
    x = 0,
    y = 0,
    layoutType = 'container',
    columns = 3,
    rows = 2,
    includeHeader = true,
    includeSidebar = true,
    includeFooter = true,
 } = params;

 const components: ComponentSpec[] = [];

  if (layoutType === 'container') {
    // Main container layout
    const containerWidth = 1200;
    let currentY = y;

    // Header
    if (includeHeader) {
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: containerWidth,
          h: 80,
          region,
        },
        {
          props: {
            label: 'Header',
            type: 'header',
            disabled: true,
          },
        }
      ));
      currentY += 80;
    }

    // Main content area with sidebar
    const mainContentY = currentY;
    const mainContentHeight = includeFooter ? 620 : 720;

    if (includeSidebar) {
      // Sidebar
      components.push(createComponent(
        'input',
        {
          x,
          y: mainContentY,
          w: 250,
          h: mainContentHeight,
          region,
        },
        {
          props: {
            label: 'Sidebar',
            type: 'sidebar',
            disabled: true,
          },
        }
      ));

      // Main content
      components.push(createComponent(
        'input',
        {
          x: x + 250,
          y: mainContentY,
          w: containerWidth - 250,
          h: mainContentHeight,
          region,
        },
        {
          props: {
            label: 'Main Content',
            type: 'main-content',
            disabled: true,
          },
        }
      ));
    } else {
      // Full width main content
      components.push(createComponent(
        'input',
        {
          x,
          y: mainContentY,
          w: containerWidth,
          h: mainContentHeight,
          region,
        },
        {
          props: {
            label: 'Main Content',
            type: 'main-content',
            disabled: true,
          },
        }
      ));
    }

    currentY += mainContentHeight;

    // Footer
    if (includeFooter) {
      components.push(createComponent(
        'input',
        {
          x,
          y: currentY,
          w: containerWidth,
          h: 100,
          region,
        },
        {
          props: {
            label: 'Footer',
            type: 'footer',
            disabled: true,
          },
        }
      ));
    }
  } else if (layoutType === 'grid') {
    // Grid layout
    const cellWidth = 200;
    const cellHeight = 150;
    const gap = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        components.push(createComponent(
          'card',
          {
            x: x + c * (cellWidth + gap),
            y: y + r * (cellHeight + gap),
            w: cellWidth,
            h: cellHeight,
            region,
          },
          {
            props: {
              title: `Grid Item ${r + 1}-${c + 1}`,
              description: `Content for grid item ${r + 1}-${c + 1}`,
            },
          }
        ));
      }
    }
  } else if (layoutType === 'flex') {
    // Flex layout container
    components.push(createComponent(
      'input',
      {
        x,
        y,
        w: 800,
        h: 400,
        region,
      },
      {
        props: {
          label: 'Flex Container',
          type: 'flex-container',
          disabled: true,
        },
      }
    ));

    // Flex items
    const flexItems = 4;
    for (let i = 0; i < flexItems; i++) {
      components.push(createComponent(
        'card',
        {
          x: x + 20 + i * 180,
          y: y + 50,
          w: 160,
          h: 300,
          region,
        },
        {
          props: {
            title: `Flex Item ${i + 1}`,
            description: `Content for flex item ${i + 1}`,
          },
        }
      ));
    }
  }

  return components;
}

/**
 * Main skeleton generator that routes to specific template functions.
 * 
 * @param type - The skeleton type to generate
 * @param params - Customization parameters
 * @returns Array of component specifications
 * 
 * @example
 * generateSkeleton('settings-panel', { sliderCount: 6, toggleCount: 4 })
 * generateSkeleton('tabs', { labels: ['Home', 'Profile', 'Settings'] })
 */
export function generateSkeleton(
  type: string, 
  params?: SkeletonParams
): ComponentSpec[] {
  const normalizedType = type.toLowerCase().replace(/[-_\s]/g, '');

  switch (normalizedType) {
    case 'settingspanel':
    case 'settings':
      return generateSettingsPanel(params);
    
    case 'tabs':
    case 'tab':
      return generateTabs(params);
    
    case 'modal':
    case 'dialog':
      return generateModal(params);
    
    case 'tray':
    case 'drawer':
      return generateTray(params);
    
    case 'cardgrid':
    case 'cards':
      return generateCardGrid(params);
    
    case 'form':
      return generateForm(params);
    
    case 'lens':
    case 'detailview':
      return generateLens(params);

    case 'navigation':
    case 'navbar':
    case 'sidebar':
    case 'breadcrumbs':
      return generateNavigation(params);

    case 'datadisplay':
    case 'table':
    case 'chart':
    case 'list':
      return generateDataDisplay(params);

    case 'input':
    case 'search':
    case 'filter':
    case 'datepicker':
    case 'autocomplete':
      return generateInput(params);

    case 'feedback':
    case 'toast':
    case 'notification':
    case 'progress':
      return generateFeedback(params);

    case 'layout':
    case 'grid':
    case 'flex':
    case 'container':
      return generateLayout(params);
    
    default: {
      console.warn(`Unknown skeleton type: ${type}`);
      // Fallback: return a single component based on the type if it matches a ComponentType
      const componentType = type as ComponentType;
      return [createComponent(
        componentType,
        {
          x: params?.x || 0,
          y: params?.y || 0,
          w: params?.w || 30,
          h: params?.h || 200,
          region: params?.region || 'main',
        },
        {
          props: (params?.props ?? {}) as Record<string, unknown>,
        }
      )];
    }
  }
}
