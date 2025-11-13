import { 
  EditPlan, 
  Command,
  ComponentType,
  generateId,
  createAddCommand,
  createUpdateCommand,
  createRemoveCommand,
  createMoveCommand,
  createComponent,
} from '../../schema';
import { generateSettingsPanel } from '../skeletons';

/**
 * Intent represents the parsed user's goal from a natural language prompt.
 */
interface Intent {
  action: 'add' | 'update' | 'remove' | 'move' | 'restyle';
  componentType?: ComponentType;
  targetId?: string;
  targetName?: string;
  properties?: Record<string, unknown>;
  position?: { x: number; y: number; region?: string };
  count?: number;
  description: string;
}

/**
 * Keyword patterns for identifying intents in natural language.
 * This is a simple deterministic parser - no LLM yet.
 */
const PATTERNS = {
  // Action keywords
  add: /\b(add|create|insert|make|new)\b/i,
  update: /\b(update|change|modify|edit|set)\b/i,
  remove: /\b(remove|delete|destroy|kill)\b/i,
  move: /\b(move|reposition|relocate)\b/i,
  restyle: /\b(restyle|recolor|resize|padding|margin)\b/i,
  
  // Component types
  button: /\bbutton\b/i,
  slider: /\bslider(?:s)?\b/i,
  toggle: /\btoggle(?:s)?\b/i,
  tabs: /\btabs?\b/i,
  modal: /\bmodal\b/i,
  tray: /\btray\b/i,
  card: /\bcard\b/i,
  cardGrid: /\bcard[- ]?grid\b/i,
  form: /\bform\b/i,
  input: /\binput\b/i,
  select: /\bselect\b/i,
  textarea: /\btextarea\b/i,
  progress: /\bprogress\b/i,
  tooltip: /\btooltip\b/i,
  popover: /\bpopover\b/i,
  drawer: /\bdrawer\b/i,
  dialog: /\bdialog\b/i,
  
  // Special patterns
  settings: /\bsettings?\b/i,
  sliders: /\bslider(?:s)?\b/i,
  toggles: /\btoggle(?:s)?\b/i,
  
  // Numbers and quantities
  number: /\b(\d+)\b/,
  
  // Positions
  region: /\b(sidebar|main|header|footer|left|right|center|top|bottom)\b/i,
};

/**
 * Extracts the primary intent from a natural language prompt.
 * Uses keyword matching and pattern recognition.
 */
function extractIntent(prompt: string): Intent {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine action
  let action: Intent['action'] = 'add'; // default
  
  if (PATTERNS.remove.test(lowerPrompt)) {
    action = 'remove';
  } else if (PATTERNS.update.test(lowerPrompt)) {
    action = 'update';
  } else if (PATTERNS.move.test(lowerPrompt)) {
    action = 'move';
  } else if (PATTERNS.restyle.test(lowerPrompt)) {
    action = 'restyle';
  } else if (PATTERNS.add.test(lowerPrompt)) {
    action = 'add';
  }
  
  // Extract component type
  let componentType: ComponentType | undefined;
  
  if (PATTERNS.button.test(lowerPrompt)) componentType = 'button';
  else if (PATTERNS.slider.test(lowerPrompt)) componentType = 'slider';
  else if (PATTERNS.toggle.test(lowerPrompt)) componentType = 'toggle';
  else if (PATTERNS.tabs.test(lowerPrompt)) componentType = 'tabs';
  else if (PATTERNS.modal.test(lowerPrompt)) componentType = 'modal';
  else if (PATTERNS.tray.test(lowerPrompt)) componentType = 'tray';
  else if (PATTERNS.cardGrid.test(lowerPrompt)) componentType = 'card-grid';
  else if (PATTERNS.card.test(lowerPrompt)) componentType = 'card';
  else if (PATTERNS.form.test(lowerPrompt)) componentType = 'form';
  else if (PATTERNS.input.test(lowerPrompt)) componentType = 'input';
  else if (PATTERNS.select.test(lowerPrompt)) componentType = 'select';
  else if (PATTERNS.textarea.test(lowerPrompt)) componentType = 'textarea';
  else if (PATTERNS.progress.test(lowerPrompt)) componentType = 'progress';
  else if (PATTERNS.tooltip.test(lowerPrompt)) componentType = 'tooltip';
  else if (PATTERNS.popover.test(lowerPrompt)) componentType = 'popover';
  else if (PATTERNS.drawer.test(lowerPrompt)) componentType = 'drawer';
  else if (PATTERNS.dialog.test(lowerPrompt)) componentType = 'dialog';
  
  // Extract count (e.g., "add 3 buttons")
  const numberMatch = prompt.match(PATTERNS.number);
  const count = numberMatch ? parseInt(numberMatch[1], 10) : 1;
  
  // Extract region
  const regionMatch = prompt.match(PATTERNS.region);
  const region = regionMatch ? regionMatch[1].toLowerCase() : 'main';
  
  // Extract properties from prompt (simplified for now)
  const properties: Record<string, unknown> = {};
  
  // Special case: settings panel properties
  if (componentType === 'settings-panel') {
    // Extract slider count
    const sliderMatch = prompt.match(/(\d+)\s*slider/i);
    if (sliderMatch) {
      properties.sliderCount = parseInt(sliderMatch[1], 10);
    }
    
    // Extract toggle count
    const toggleMatch = prompt.match(/(\d+)\s*toggle/i);
    if (toggleMatch) {
      properties.toggleCount = parseInt(toggleMatch[1], 10);
    }
  }
  
  // Look for label/text patterns
  const labelMatch = prompt.match(/(?:labeled?|titled?|text)\s+["']([^"']+)["']/i);
  if (labelMatch) {
    properties.label = labelMatch[1];
  } else if (componentType === 'button' && action === 'add') {
    properties.label = 'Button';
  }
  
  // Look for color patterns
  const colorMatch = prompt.match(/\b(red|blue|green|yellow|purple|orange|gray|black|white)\b/i);
  if (colorMatch) {
    properties.color = colorMatch[1].toLowerCase();
  }
  
  // Look for disabled state
  if (/\bdisabled\b/i.test(prompt)) {
    properties.disabled = true;
  }
  
  return {
    action,
    componentType,
    count,
    properties,
    position: { x: 100, y: 100, region }, // Default position
    description: prompt,
  };
}

/**
 * Generates commands based on the extracted intent.
 * Converts high-level intent into low-level graph operations.
 */
function intentToCommands(intent: Intent): Command[] {
  const commands: Command[] = [];
  
  switch (intent.action) {
    case 'add': {
      if (!intent.componentType) {
        console.warn('No component type specified for add action');
        break;
      }
      
      const count = intent.count || 1;
      
      // Special case: settings panel
      if (intent.componentType === 'settings-panel') {
        const sliderCount = (() => {
          const v = intent.properties?.sliderCount;
          if (typeof v === 'number') return v;
          if (typeof v === 'string') return parseInt(v, 10);
          return 3;
        })();
        const toggleCount = (() => {
          const v = intent.properties?.toggleCount;
          if (typeof v === 'number') return v;
          if (typeof v === 'string') return parseInt(v, 10);
          return 2;
        })();
        
        const settingsComponents = generateSettingsPanel({
          sliderCount,
          toggleCount,
          region: intent.position!.region || 'sidebar',
          x: intent.position!.x,
          y: intent.position!.y,
        });
        
        // Add all components from the settings panel
        for (const component of settingsComponents) {
          commands.push(createAddCommand(component));
        }
      } else {
        // Generate multiple components if count > 1
        for (let i = 0; i < count; i++) {
          const component = createComponent(
            intent.componentType,
            {
              x: intent.position!.x + (i * 120), // Offset each component
              y: intent.position!.y,
              w: getDefaultWidth(intent.componentType),
              h: getDefaultHeight(intent.componentType),
              region: intent.position!.region || 'main',
            },
            {
              props: {
                ...intent.properties,
                // Add default label if count > 1
                ...(count > 1 && intent.properties?.label ? {
                  label: `${intent.properties.label} ${i + 1}`,
                } : {}),
              },
            }
          );
          
          commands.push(createAddCommand(component));
        }
      }
      break;
    }
    
    case 'update': {
      if (!intent.targetId && !intent.targetName) {
        console.warn('No target specified for update action');
        break;
      }
      
      // Note: targetId would be resolved by the orchestrator from targetName
      if (intent.targetId) {
        commands.push(createUpdateCommand(intent.targetId, {
          props: intent.properties,
        }));
      }
      break;
    }
    
    case 'remove': {
      if (!intent.targetId && !intent.targetName) {
        console.warn('No target specified for remove action');
        break;
      }
      
      if (intent.targetId) {
        commands.push(createRemoveCommand(intent.targetId, true));
      }
      break;
    }
    
    case 'move': {
      if (!intent.targetId && !intent.targetName) {
        console.warn('No target specified for move action');
        break;
      }
      
      if (intent.targetId && intent.position) {
        commands.push(createMoveCommand(
          intent.targetId,
          { x: intent.position.x, y: intent.position.y },
          intent.position.region
        ));
      }
      break;
    }
    
    case 'restyle': {
      if (!intent.targetId && !intent.targetName) {
        console.warn('No target specified for restyle action');
        break;
      }
      
      if (intent.targetId) {
        commands.push(createUpdateCommand(intent.targetId, {
          props: intent.properties,
        }));
      }
      break;
    }
  }
  
  return commands;
}

/**
 * Get default width for a component type.
 */
function getDefaultWidth(type: ComponentType): number {
  switch (type) {
    case 'button': return 120;
    case 'slider': return 200;
    case 'toggle': return 60;
    case 'tabs': return 400;
    case 'modal': return 500;
    case 'tray': return 300;
    case 'card': return 250;
    case 'card-grid': return 600;
    case 'form': return 400;
    case 'input': return 200;
    case 'select': return 180;
    case 'textarea': return 300;
    case 'progress': return 200;
    case 'tooltip': return 150;
    case 'popover': return 200;
    case 'drawer': return 300;
    case 'dialog': return 400;
    default: return 200;
  }
}

/**
 * Get default height for a component type.
 */
function getDefaultHeight(type: ComponentType): number {
  switch (type) {
    case 'button': return 40;
    case 'slider': return 40;
    case 'toggle': return 24;
    case 'tabs': return 300;
    case 'modal': return 400;
    case 'tray': return 500;
    case 'card': return 200;
    case 'card-grid': return 400;
    case 'form': return 350;
    case 'input': return 36;
    case 'select': return 36;
    case 'textarea': return 120;
    case 'progress': return 20;
    case 'tooltip': return 40;
    case 'popover': return 150;
    case 'drawer': return 500;
    case 'dialog': return 300;
    default: return 100;
  }
}

/**
 * Main entry point: Parses the NL prompt into a normalized intent, then creates an EditPlan.
 * 
 * This is a deterministic keyword-based parser. Future versions may integrate LLM parsing.
 * 
 * @param prompt - Natural language prompt from the user
 * @returns EditPlan with structured commands
 * 
 * @example
 * parseIntent("Add a button labeled 'Submit'")
 * // Returns: EditPlan with ADD command for a button component
 * 
 * @example
 * parseIntent("Create 3 sliders in the sidebar")
 * // Returns: EditPlan with 3 ADD commands for slider components
 */
export function parseIntent(prompt: string): EditPlan {
  // Extract intent from natural language
  const intent = extractIntent(prompt);
  
  // Convert intent to commands
  const operations = intentToCommands(intent);
  
  // Create edit plan
  const plan: EditPlan = {
    id: generateId(),
    operations,
    description: generateDescription(intent, operations.length),
    prompt,
    timestamp: new Date().toISOString(),
    meta: {
      priority: 'normal',
      tags: [intent.action, intent.componentType || 'unknown'].filter(Boolean) as string[],
    },
  };
  
  return plan;
}

/**
 * Generate a human-readable description of what the plan will do.
 */
function generateDescription(intent: Intent, operationCount: number): string {
  const action = intent.action.charAt(0).toUpperCase() + intent.action.slice(1);
  const type = intent.componentType || 'component';
  const count = intent.count || 1;
  
  if (intent.action === 'add') {
    if (count > 1) {
      return `${action} ${count} ${type}s to the ${intent.position?.region || 'canvas'}`;
    }
    return `${action} a ${type} to the ${intent.position?.region || 'canvas'}`;
  }
  
  if (intent.action === 'update' || intent.action === 'restyle') {
    return `${action} ${type} properties`;
  }
  
  if (intent.action === 'remove') {
    return `${action} ${type} from the canvas`;
  }
  
  if (intent.action === 'move') {
    return `${action} ${type} to ${intent.position?.region || 'new position'}`;
  }
  
  return `Execute ${operationCount} operation(s)`;
}