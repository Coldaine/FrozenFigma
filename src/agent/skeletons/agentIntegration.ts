import { ComponentSpec } from '../../schema';
import { 
  generateSkeleton,
  SkeletonParams 
} from './index';

/**
 * Extended skeleton parameters that include all possible options for all skeleton types
 */
export interface ExtendedSkeletonParams extends SkeletonParams {
  // Settings panel parameters
  sliderCount?: number;
  toggleCount?: number;
  sectionCount?: number;
  includeColorPicker?: boolean;
  includeTextInputs?: boolean;
  includeSelects?: boolean;
  
  // Tabs parameters
  tabLabels?: string[]; // Renamed from labels to avoid conflict
  tabContent?: string[];
  includeTabInputs?: boolean; // Renamed from includeInputs to avoid conflict
 includeTabButtons?: boolean; // Renamed from includeButtons to avoid conflict
  
  // Modal parameters
  includeModalForm?: boolean; // Renamed from includeForm to avoid conflict
  includeModalImage?: boolean; // Renamed from includeImage to avoid conflict
 actionButtonCount?: number; // Renamed from actionButtons to avoid conflict
  includeModalCloseButton?: boolean; // Renamed from includeCloseButton to avoid conflict
  
  // Tray parameters
  trayItemCount?: number; // Renamed from itemCount to avoid conflict
  includeTrayHeaders?: boolean; // Renamed from includeHeaders to avoid conflict
  includeTrayActions?: boolean; // Renamed from includeActions to avoid conflict
  trayPosition?: 'left' | 'right' | 'top' | 'bottom'; // Renamed from position to avoid conflict
  
  // Card grid parameters
  cardCount?: number; // Renamed from count to avoid conflict
  cardColumns?: number; // Renamed from columns to avoid conflict
  includeCardImages?: boolean; // Renamed from includeImages to avoid conflict
  includeCardActions?: boolean; // Renamed from includeActions to avoid conflict
  cardItemHeight?: number; // Renamed from cardHeight to avoid conflict
  
  // Form parameters
  includeFormValidation?: boolean; // Renamed from includeValidation to avoid conflict
  includeFileUpload?: boolean;
  includeDateField?: boolean; // Renamed from includeDate to avoid conflict
  includeRadioButtons?: boolean; // Renamed from includeRadio to avoid conflict
  includeCheckboxGroup?: boolean;
  includeTextarea?: boolean;
  
  // Lens parameters
  includeLensDetails?: boolean; // Renamed from includeDetails to avoid conflict
  includeLensMetadata?: boolean; // Renamed from includeMetadata to avoid conflict
  includeLensActions?: boolean; // Renamed from includeActions to avoid conflict
  includeRelatedItems?: boolean;
  
  // Navigation parameters
  navType?: 'navbar' | 'sidebar' | 'breadcrumbs';
  navItems?: string[]; // Renamed from items to avoid conflict
  includeSearch?: boolean;
  includeUserMenu?: boolean;
  
  // Data display parameters
 displayType?: 'table' | 'chart' | 'list';
  tableColumns?: string[]; // Renamed from columns to avoid conflict
  dataRows?: number; // Renamed from rows to avoid conflict
  includeFilters?: boolean;
  includePagination?: boolean;
  
  // Input parameters
  inputType?: 'search' | 'filter' | 'date-picker' | 'autocomplete';
  placeholder?: string;
  options?: string[];
  includeInputButton?: boolean; // Renamed from includeButton to avoid conflict
  
  // Feedback parameters
  feedbackType?: 'toast' | 'notification' | 'progress';
  message?: string;
  duration?: number;
  
  // Layout parameters
  layoutType?: 'grid' | 'flex' | 'container';
  layoutColumns?: number; // Renamed from columns to avoid conflict
  layoutRows?: number; // Renamed from rows to avoid conflict
  includeHeader?: boolean;
  includeSidebar?: boolean;
  includeFooter?: boolean;
}

/**
 * Interface for skeleton composition - combining multiple skeletons into complex UIs
 */
export interface SkeletonComposition {
  id: string;
  name: string;
  description: string;
  components: Array<{
    type: string;
    params: ExtendedSkeletonParams;
    position: { x: number; y: number };
    dependencies?: string[]; // IDs of components this one depends on
  }>;
}

/**
 * Skeleton planner - matches natural language prompts to appropriate skeleton templates
 */
export class SkeletonPlanner {
  /**
   * Matches a natural language prompt to the most appropriate skeleton template(s)
   * 
   * @param prompt - Natural language description of desired UI
   * @returns Array of skeleton specifications to generate
   */
  static matchPromptToSkeletons(prompt: string): Array<{ type: string; params: ExtendedSkeletonParams }> {
    const normalizedPrompt = prompt.toLowerCase();
    
    // Simple keyword matching - in a real system, this would use NLP/ML
    const matches: Array<{ type: string; params: ExtendedSkeletonParams }> = [];
    
    // Match for settings panels
    if (normalizedPrompt.includes('settings') || 
        normalizedPrompt.includes('preferences') || 
        normalizedPrompt.includes('configuration')) {
      matches.push({
        type: 'settings-panel',
        params: {
          title: 'Settings',
          sliderCount: 3,
          toggleCount: 2,
          sectionCount: 2,
          includeColorPicker: true,
          includeTextInputs: true,
          includeSelects: true
        }
      });
    }
    
    // Match for forms
    if (normalizedPrompt.includes('form') || 
        normalizedPrompt.includes('input') || 
        normalizedPrompt.includes('signup') || 
        normalizedPrompt.includes('login')) {
      matches.push({
        type: 'form',
        params: {
          title: 'Form',
          includeFormValidation: true,
          includeFileUpload: normalizedPrompt.includes('upload'),
          includeDateField: normalizedPrompt.includes('date'),
          includeRadioButtons: normalizedPrompt.includes('option'),
          includeCheckboxGroup: normalizedPrompt.includes('multiple') || normalizedPrompt.includes('check'),
          includeTextarea: normalizedPrompt.includes('description') || normalizedPrompt.includes('message')
        }
      });
    }
    
    // Match for navigation
    if (normalizedPrompt.includes('navigation') || 
        normalizedPrompt.includes('menu') || 
        normalizedPrompt.includes('navbar') || 
        normalizedPrompt.includes('sidebar')) {
      matches.push({
        type: 'navigation',
        params: {
          navType: normalizedPrompt.includes('sidebar') ? 'sidebar' : 
                   normalizedPrompt.includes('breadcrumb') ? 'breadcrumbs' : 'navbar',
          navItems: ['Home', 'About', 'Contact'], // In a real system, these would be extracted from prompt
          includeSearch: normalizedPrompt.includes('search'),
          includeUserMenu: normalizedPrompt.includes('user') || normalizedPrompt.includes('profile')
        }
      });
    }
    
    // Match for data display
    if (normalizedPrompt.includes('table') || 
        normalizedPrompt.includes('list') || 
        normalizedPrompt.includes('grid') || 
        normalizedPrompt.includes('chart') || 
        normalizedPrompt.includes('data')) {
      matches.push({
        type: 'data-display',
        params: {
          displayType: normalizedPrompt.includes('table') ? 'table' : 
                      normalizedPrompt.includes('chart') ? 'chart' : 
                      normalizedPrompt.includes('list') ? 'list' : 'table',
          tableColumns: ['Name', 'Value'], // In a real system, these would be extracted from prompt
          dataRows: 5,
          includeFilters: normalizedPrompt.includes('filter'),
          includePagination: normalizedPrompt.includes('page')
        }
      });
    }
    
    // Default to a simple component if no specific matches
    if (matches.length === 0) {
      // Try to match more specific component types
      if (normalizedPrompt.includes('modal') || normalizedPrompt.includes('dialog')) {
        matches.push({ type: 'modal', params: { title: 'Dialog' }});
      } else if (normalizedPrompt.includes('card') || normalizedPrompt.includes('tile')) {
        matches.push({ type: 'card-grid', params: { cardCount: 4 }});
      } else if (normalizedPrompt.includes('tabs')) {
        matches.push({ type: 'tabs', params: { tabLabels: ['Tab 1', 'Tab 2'] }});
      } else {
        // Default fallback
        matches.push({ type: 'card', params: { title: 'Component', description: 'Default component' } as ExtendedSkeletonParams});
      }
    }
    
    return matches;
  }
}

/**
 * Skeletonizer - converts skeleton compositions into actual component specifications
 */
export class Skeletonizer {
  /**
   * Converts a skeleton composition into actual component specifications
   * 
   * @param composition - The skeleton composition to convert
   * @returns Array of component specifications
   */
  static composeSkeleton(composition: SkeletonComposition): ComponentSpec[] {
    const allComponents: ComponentSpec[] = [];
    
    // Generate components in dependency order
    for (const compSpec of composition.components) {
      // Apply position offset to each component
      const paramsWithPosition = {
        ...compSpec.params,
        x: compSpec.position.x,
        y: compSpec.position.y
      };
      
      const components = generateSkeleton(compSpec.type, paramsWithPosition);
      
      // Add the generated components to our collection
      allComponents.push(...components);
    }
    
    return allComponents;
  }
  
  /**
   * Generates components from a natural language prompt
   * 
   * @param prompt - Natural language description of desired UI
   * @param baseX - Base X coordinate for positioning
   * @param baseY - Base Y coordinate for positioning
   * @returns Array of component specifications
   */
  static generateFromPrompt(prompt: string, baseX: number = 100, baseY: number = 100): ComponentSpec[] {
    const skeletonMatches = SkeletonPlanner.matchPromptToSkeletons(prompt);
    const allComponents: ComponentSpec[] = [];
    
    const currentY = baseY;
    const rowHeight = 300; // Approximate height for layout
    
    for (let i = 0; i < skeletonMatches.length; i++) {
      const match = skeletonMatches[i];
      
      // Position components in a grid pattern
      const x = baseX + (i % 2) * 400; // Two columns
      const y = currentY + Math.floor(i / 2) * rowHeight;
      
      // Add position to params
      const paramsWithPosition = {
        ...match.params,
        x,
        y
      };
      
      const components = generateSkeleton(match.type, paramsWithPosition);
      allComponents.push(...components);
    }
    
    return allComponents;
  }
}

/**
 * Utility function to create a skeleton composition from a prompt
 */
export function createCompositionFromPrompt(prompt: string): SkeletonComposition {
  const matches = SkeletonPlanner.matchPromptToSkeletons(prompt);
  
  return {
    id: `composition-${Date.now()}`,
    name: `Composition for: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
    description: prompt,
    components: matches.map((match, index) => ({
      type: match.type,
      params: match.params,
      position: { 
        x: 100 + (index % 3) * 300, 
        y: 100 + Math.floor(index / 3) * 250 
      }
    }))
  };
}