import { z } from 'zod';

// ============================================================================
// COMPONENT SPECIFICATION SCHEMA
// ============================================================================

/**
 * Defines all supported component types in the FrozenFigma mock-up builder.
 * Each type represents a distinct UI element with specific interaction patterns.
 */
export const ComponentTypeSchema = z.enum([
  'button',
  'slider',
  'toggle',
  'tabs',
  'modal',
  'tray',
  'card',
  'card-grid',
  'form',
  'input',
  'select',
  'textarea',
  'progress',
  'tooltip',
  'popover',
  'drawer',
  'dialog',
  'settings-panel',
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

/**
 * Frame defines the positioning and dimensions of a component on the canvas.
 * - x, y: Absolute position in pixels from the top-left corner
 * - w, h: Width and height in pixels
 * - region: Semantic layout area (e.g., 'sidebar', 'main', 'header')
 */
export const FrameSchema = z.object({
  x: z.number().describe('X coordinate in pixels'),
  y: z.number().describe('Y coordinate in pixels'),
  w: z.number().min(1).describe('Width in pixels (minimum 1)'),
  h: z.number().min(1).describe('Height in pixels (minimum 1)'),
  region: z.string().describe('Semantic layout region identifier'),
});

export type Frame = z.infer<typeof FrameSchema>;

/**
 * ComponentSpec is the canonical specification for a single UI component.
 * It contains all information needed to render and interact with the component.
 * 
 * @property id - Unique UUID identifier for stable addressing
 * @property type - Component type determining render behavior
 * @property name - Optional human-readable name for addressability
 * @property props - Component-specific properties (validated at runtime by component)
 * @property frame - Position and dimensions on the canvas
 * @property children - Optional array of child component IDs for hierarchical composition
 */
export const ComponentSpecSchema = z.object({
  id: z.string().uuid().describe('Unique component identifier'),
  type: ComponentTypeSchema,
  name: z.string().optional().describe('Human-readable name for addressing'),
  props: z.record(z.unknown()).default({}).describe('Component-specific properties'),
  frame: FrameSchema,
  children: z.array(z.string().uuid()).optional().describe('Child component IDs'),
});

export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;

// ============================================================================
// TOKEN SCHEMA (Design System)
// ============================================================================

/**
 * TokenSet defines the complete design system for the mock-up.
 * Tokens are runtime-swappable to enable theme switching (light/dark/custom).
 * 
 * All tokens follow CSS variable naming conventions and can be directly
 * applied to the DOM for consistent styling.
 */
export const TokenSetSchema = z.object({
  /** Color palette with semantic naming (e.g., 'primary', 'bg-surface', 'text-muted') */
  colors: z.record(z.string()).describe('Color token map (CSS color values)'),
  
  /** Spacing scale in pixels (e.g., { xs: 4, sm: 8, md: 16, lg: 24 }) */
  spacing: z.record(z.number()).describe('Spacing scale in pixels'),
  
  /** Typography configuration */
  typography: z.object({
    fontFamily: z.string().describe('Primary font family'),
    sizes: z.record(z.number()).describe('Font size scale in pixels'),
    weights: z.record(z.number()).describe('Font weight scale (100-900)'),
    lineHeights: z.record(z.number()).optional().describe('Line height multipliers'),
  }),
  
  /** Border radius values for rounded corners */
  radius: z.record(z.number()).describe('Border radius scale in pixels'),
  
  /** Shadow definitions for elevation */
  shadows: z.record(z.string()).optional().describe('Box shadow definitions'),
  
  /** Animation/transition timing values - can be numbers (duration) or strings (easing) */
  transitions: z.record(z.union([z.number(), z.string()])).optional().describe('Transition duration in ms or easing functions'),
});

export type TokenSet = z.infer<typeof TokenSetSchema>;

// ============================================================================
// ENHANCED TOKEN SCHEMA (Extended Design System)
// ============================================================================

/**
 * Semantic color tokens for consistent theming
 */
export const SemanticColorTokensSchema = z.object({
  // Primary palette
  primary: z.string().describe('Primary brand color'),
  'primary-50': z.string().optional().describe('Lightest primary variant'),
  'primary-100': z.string().optional().describe('Light primary variant'),
  'primary-200': z.string().optional().describe('Lighter primary variant'),
  'primary-300': z.string().optional().describe('Light primary variant'),
  'primary-400': z.string().optional().describe('Slightly lighter primary variant'),
  'primary-500': z.string().optional().describe('Base primary color'),
  'primary-60': z.string().optional().describe('Darker primary variant'),
  'primary-700': z.string().optional().describe('Dark primary variant'),
  'primary-800': z.string().optional().describe('Darker primary variant'),
  'primary-900': z.string().optional().describe('Darkest primary variant'),
  
 // Secondary palette
 secondary: z.string().describe('Secondary brand color'),
  'secondary-50': z.string().optional().describe('Lightest secondary variant'),
  'secondary-100': z.string().optional().describe('Light secondary variant'),
  'secondary-200': z.string().optional().describe('Lighter secondary variant'),
  'secondary-300': z.string().optional().describe('Light secondary variant'),
  'secondary-400': z.string().optional().describe('Slightly lighter secondary variant'),
  'secondary-500': z.string().optional().describe('Base secondary color'),
  'secondary-60': z.string().optional().describe('Darker secondary variant'),
  'secondary-700': z.string().optional().describe('Dark secondary variant'),
  'secondary-800': z.string().optional().describe('Darker secondary variant'),
  'secondary-900': z.string().optional().describe('Darkest secondary variant'),
  
 // Background colors
  'bg-base': z.string().describe('Base background color'),
  'bg-surface': z.string().describe('Surface background color'),
  'bg-elevated': z.string().describe('Elevated surface background color'),
  'bg-overlay': z.string().describe('Overlay background color'),
  'bg-accent': z.string().describe('Accent background color'),
  
  // Text colors
  'text-primary': z.string().describe('Primary text color'),
  'text-secondary': z.string().describe('Secondary text color'),
  'text-muted': z.string().describe('Muted text color'),
  'text-disabled': z.string().describe('Disabled text color'),
  'text-inverse': z.string().describe('Inverse text color'),
  
  // Border colors
  'border-base': z.string().describe('Base border color'),
  'border-muted': z.string().describe('Muted border color'),
  'border-accent': z.string().describe('Accent border color'),
  'border-focus': z.string().describe('Focus border color'),
  
  // Status colors
  success: z.string().describe('Success state color'),
  'success-50': z.string().optional().describe('Lightest success variant'),
  'success-100': z.string().optional().describe('Light success variant'),
  'success-200': z.string().optional().describe('Lighter success variant'),
  'success-300': z.string().optional().describe('Light success variant'),
  'success-400': z.string().optional().describe('Slightly lighter success variant'),
  'success-500': z.string().optional().describe('Base success color'),
  'success-600': z.string().optional().describe('Darker success variant'),
  'success-700': z.string().optional().describe('Dark success variant'),
  'success-800': z.string().optional().describe('Darker success variant'),
  'success-900': z.string().optional().describe('Darkest success variant'),
  
 warning: z.string().describe('Warning state color'),
  'warning-50': z.string().optional().describe('Lightest warning variant'),
  'warning-100': z.string().optional().describe('Light warning variant'),
  'warning-200': z.string().optional().describe('Lighter warning variant'),
  'warning-300': z.string().optional().describe('Light warning variant'),
  'warning-40': z.string().optional().describe('Slightly lighter warning variant'),
  'warning-500': z.string().optional().describe('Base warning color'),
  'warning-600': z.string().optional().describe('Darker warning variant'),
  'warning-700': z.string().optional().describe('Dark warning variant'),
  'warning-800': z.string().optional().describe('Darker warning variant'),
  'warning-900': z.string().optional().describe('Darkest warning variant'),
  
 error: z.string().describe('Error state color'),
  'error-50': z.string().optional().describe('Lightest error variant'),
  'error-100': z.string().optional().describe('Light error variant'),
  'error-200': z.string().optional().describe('Lighter error variant'),
  'error-300': z.string().optional().describe('Light error variant'),
  'error-400': z.string().optional().describe('Slightly lighter error variant'),
  'error-500': z.string().optional().describe('Base error color'),
  'error-600': z.string().optional().describe('Darker error variant'),
  'error-700': z.string().optional().describe('Dark error variant'),
  'error-800': z.string().optional().describe('Darker error variant'),
  'error-900': z.string().optional().describe('Darkest error variant'),
  
  info: z.string().describe('Info state color'),
  'info-50': z.string().optional().describe('Lightest info variant'),
  'info-100': z.string().optional().describe('Light info variant'),
  'info-200': z.string().optional().describe('Lighter info variant'),
  'info-300': z.string().optional().describe('Light info variant'),
  'info-400': z.string().optional().describe('Slightly lighter info variant'),
  'info-500': z.string().optional().describe('Base info color'),
  'info-600': z.string().optional().describe('Darker info variant'),
  'info-700': z.string().optional().describe('Dark info variant'),
  'info-800': z.string().optional().describe('Darker info variant'),
  'info-900': z.string().optional().describe('Darkest info variant'),
  
  // Neutral/grayscale colors
 white: z.string().describe('Pure white'),
  black: z.string().describe('Pure black'),
  'gray-50': z.string().describe('Lightest gray'),
  'gray-100': z.string().describe('Light gray'),
  'gray-200': z.string().describe('Lighter gray'),
  'gray-300': z.string().describe('Light gray'),
  'gray-400': z.string().describe('Slightly lighter gray'),
  'gray-500': z.string().describe('Base gray'),
  'gray-600': z.string().describe('Darker gray'),
  'gray-700': z.string().describe('Dark gray'),
  'gray-800': z.string().describe('Darker gray'),
  'gray-900': z.string().describe('Darkest gray'),
});

export type SemanticColorTokens = z.infer<typeof SemanticColorTokensSchema>;

/**
 * Enhanced spacing scale with semantic naming
 */
export const SemanticSpacingTokensSchema = z.object({
  // Base spacing units
  '0': z.number().describe('Zero spacing'),
  '1': z.number().describe('1px spacing'),
  '2': z.number().describe('2px spacing'),
  '4': z.number().describe('4px spacing'),
  '8': z.number().describe('8px spacing'),
  '12': z.number().describe('12px spacing'),
  '16': z.number().describe('16px spacing'),
  '20': z.number().describe('20px spacing'),
  '24': z.number().describe('24px spacing'),
  '32': z.number().describe('32px spacing'),
  '40': z.number().describe('40px spacing'),
  '48': z.number().describe('48px spacing'),
  '56': z.number().describe('56px spacing'),
  '64': z.number().describe('64px spacing'),
  '80': z.number().describe('80px spacing'),
  '96': z.number().describe('96px spacing'),
  '128': z.number().describe('128px spacing'),
  '160': z.number().describe('160px spacing'),
  '192': z.number().describe('192px spacing'),
  '224': z.number().describe('224px spacing'),
  '256': z.number().describe('256px spacing'),
  '320': z.number().describe('320px spacing'),
  '384': z.number().describe('384px spacing'),
  
  // Semantic spacing
  'xs': z.number().describe('Extra small spacing'),
  'sm': z.number().describe('Small spacing'),
  'md': z.number().describe('Medium spacing'),
  'lg': z.number().describe('Large spacing'),
  'xl': z.number().describe('Extra large spacing'),
  '2xl': z.number().describe('2x extra large spacing'),
  '3xl': z.number().describe('3x extra large spacing'),
  '4xl': z.number().describe('4x extra large spacing'),
  '5xl': z.number().describe('5x extra large spacing'),
  '6xl': z.number().describe('6x extra large spacing'),
  '7xl': z.number().describe('7x extra large spacing'),
  '8xl': z.number().describe('8x extra large spacing'),
  '9xl': z.number().describe('9x extra large spacing'),
  
  // Component-specific spacing
  'component-gap': z.number().describe('Gap between components'),
  'section-gap': z.number().describe('Gap between sections'),
  'grid-gap': z.number().describe('Grid gap'),
  'form-gap': z.number().describe('Form element gap'),
  'button-padding': z.number().describe('Button padding'),
  'input-padding': z.number().describe('Input padding'),
  'card-padding': z.number().describe('Card padding'),
  'modal-padding': z.number().describe('Modal padding'),
});

export type SemanticSpacingTokens = z.infer<typeof SemanticSpacingTokensSchema>;

/**
 * Enhanced typography scale with semantic naming
 */
export const SemanticTypographyTokensSchema = z.object({
 fontFamily: z.string().describe('Primary font family'),
  'font-family-secondary': z.string().optional().describe('Secondary font family'),
  'font-family-mono': z.string().describe('Monospace font family'),
  
  // Font sizes
  'size-xs': z.number().describe('Extra small font size'),
  'size-sm': z.number().describe('Small font size'),
  'size-base': z.number().describe('Base font size'),
  'size-lg': z.number().describe('Large font size'),
  'size-xl': z.number().describe('Extra large font size'),
  'size-2xl': z.number().describe('2x extra large font size'),
  'size-3xl': z.number().describe('3x extra large font size'),
  'size-4xl': z.number().describe('4x extra large font size'),
  'size-5xl': z.number().describe('5x extra large font size'),
  'size-6xl': z.number().describe('6x extra large font size'),
  'size-7xl': z.number().describe('7x extra large font size'),
  'size-8xl': z.number().describe('8x extra large font size'),
  'size-9xl': z.number().describe('9x extra large font size'),
  
  // Font weights
  'weight-hairline': z.number().describe('Hairline font weight (100)'),
  'weight-thin': z.number().describe('Thin font weight (200)'),
  'weight-light': z.number().describe('Light font weight (300)'),
  'weight-normal': z.number().describe('Normal font weight (400)'),
  'weight-medium': z.number().describe('Medium font weight (500)'),
  'weight-semibold': z.number().describe('Semibold font weight (600)'),
  'weight-bold': z.number().describe('Bold font weight (700)'),
  'weight-extrabold': z.number().describe('Extra bold font weight (800)'),
  'weight-black': z.number().describe('Black font weight (900)'),
  
  // Line heights
  'line-height-none': z.number().describe('No line height'),
  'line-height-tight': z.number().describe('Tight line height'),
  'line-height-snug': z.number().describe('Snug line height'),
  'line-height-normal': z.number().describe('Normal line height'),
  'line-height-relaxed': z.number().describe('Relaxed line height'),
  'line-height-loose': z.number().describe('Loose line height'),
  
  // Letter spacing
  'letter-spacing-tighter': z.number().describe('Tighter letter spacing'),
  'letter-spacing-tight': z.number().describe('Tight letter spacing'),
  'letter-spacing-normal': z.number().describe('Normal letter spacing'),
  'letter-spacing-wide': z.number().describe('Wide letter spacing'),
  'letter-spacing-wider': z.number().describe('Wider letter spacing'),
  'letter-spacing-widest': z.number().describe('Widest letter spacing'),
});

export type SemanticTypographyTokens = z.infer<typeof SemanticTypographyTokensSchema>;

/**
 * Enhanced border radius scale with semantic naming
 */
export const SemanticRadiusTokensSchema = z.object({
  '0': z.number().describe('No radius'),
  '1': z.number().describe('1px radius'),
  '2': z.number().describe('2px radius'),
  '4': z.number().describe('4px radius'),
  '8': z.number().describe('8px radius'),
  '12': z.number().describe('12px radius'),
  '16': z.number().describe('16px radius'),
  '20': z.number().describe('20px radius'),
  '24': z.number().describe('24px radius'),
  '32': z.number().describe('32px radius'),
  '40': z.number().describe('40px radius'),
  '48': z.number().describe('48px radius'),
  '56': z.number().describe('56px radius'),
  '64': z.number().describe('64px radius'),
  
  // Semantic radii
  'xs': z.number().describe('Extra small radius'),
  'sm': z.number().describe('Small radius'),
  'md': z.number().describe('Medium radius'),
  'lg': z.number().describe('Large radius'),
  'xl': z.number().describe('Extra large radius'),
  '2xl': z.number().describe('2x extra large radius'),
  '3xl': z.number().describe('3x extra large radius'),
  'full': z.number().describe('Full circle radius'),
  
  // Component-specific radii
  'button-radius': z.number().describe('Button border radius'),
  'input-radius': z.number().describe('Input border radius'),
  'card-radius': z.number().describe('Card border radius'),
  'modal-radius': z.number().describe('Modal border radius'),
  'avatar-radius': z.number().describe('Avatar border radius'),
  'badge-radius': z.number().describe('Badge border radius'),
});

export type SemanticRadiusTokens = z.infer<typeof SemanticRadiusTokensSchema>;

/**
 * Enhanced shadow scale with semantic naming
 */
export const SemanticShadowTokensSchema = z.object({
  'none': z.string().describe('No shadow'),
  'sm': z.string().describe('Small shadow'),
  'base': z.string().describe('Base shadow'),
  'md': z.string().describe('Medium shadow'),
  'lg': z.string().describe('Large shadow'),
  'xl': z.string().describe('Extra large shadow'),
  '2xl': z.string().describe('2x extra large shadow'),
  'inner': z.string().describe('Inner shadow'),
  
  // Component-specific shadows
  'button-shadow': z.string().describe('Button shadow'),
  'card-shadow': z.string().describe('Card shadow'),
  'modal-shadow': z.string().describe('Modal shadow'),
  'popover-shadow': z.string().describe('Popover shadow'),
  'dropdown-shadow': z.string().describe('Dropdown shadow'),
  'tooltip-shadow': z.string().describe('Tooltip shadow'),
  'toast-shadow': z.string().describe('Toast shadow'),
});

export type SemanticShadowTokens = z.infer<typeof SemanticShadowTokensSchema>;

/**
 * Enhanced transition scale with semantic naming
 */
export const SemanticTransitionTokensSchema = z.object({
 'duration-instant': z.number().describe('Instant transition (0ms)'),
  'duration-fastest': z.number().describe('Fastest transition (75ms)'),
  'duration-faster': z.number().describe('Faster transition (150ms)'),
  'duration-fast': z.number().describe('Fast transition (200ms)'),
  'duration-normal': z.number().describe('Normal transition (250ms)'),
  'duration-slow': z.number().describe('Slow transition (300ms)'),
  'duration-slower': z.number().describe('Slower transition (400ms)'),
  'duration-slowest': z.number().describe('Slowest transition (500ms)'),
  
  // Component-specific transitions
 'button-transition': z.number().describe('Button transition duration'),
  'input-transition': z.number().describe('Input transition duration'),
  'modal-transition': z.number().describe('Modal transition duration'),
  'drawer-transition': z.number().describe('Drawer transition duration'),
  'tooltip-transition': z.number().describe('Tooltip transition duration'),
  
  // Easing functions - using string values
 'easing-linear': z.string().describe('Linear easing'),
  'easing-in': z.string().describe('Ease in'),
  'easing-out': z.string().describe('Ease out'),
  'easing-in-out': z.string().describe('Ease in out'),
  'easing-bounce': z.string().describe('Bounce easing'),
});

export type SemanticTransitionTokens = z.infer<typeof SemanticTransitionTokensSchema>;

/**
 * Enhanced TokenSet with comprehensive semantic tokens
 */
export const EnhancedTokenSetSchema = z.object({
 colors: SemanticColorTokensSchema.describe('Semantic color tokens'),
  spacing: SemanticSpacingTokensSchema.describe('Semantic spacing tokens'),
  typography: SemanticTypographyTokensSchema.describe('Semantic typography tokens'),
  radius: SemanticRadiusTokensSchema.describe('Semantic radius tokens'),
  shadows: SemanticShadowTokensSchema.optional().describe('Semantic shadow tokens'),
  transitions: SemanticTransitionTokensSchema.optional().describe('Semantic transition tokens'),
  
  // Additional token categories
 sizes: z.record(z.number()).optional().describe('Dimension tokens (width, height, etc.)'),
  zIndices: z.record(z.number()).optional().describe('Z-index tokens'),
  breakpoints: z.record(z.number()).optional().describe('Responsive breakpoints'),
  opacities: z.record(z.number()).optional().describe('Opacity tokens'),
  motion: z.record(z.string()).optional().describe('Motion tokens'),
});

export type EnhancedTokenSet = z.infer<typeof EnhancedTokenSetSchema>;

// ============================================================================
// GRAPH SCHEMA (Canonical UI State)
// ============================================================================

/**
 * Graph is the single source of truth for the entire UI mock-up.
 * It contains all components, their relationships, theme tokens, and metadata.
 * 
 * The graph is versioned for compatibility and includes metadata for tooling.
 * All mutations to the graph must be atomic and validated.
 */
export const GraphSchema = z.object({
  /** Schema version for backward compatibility */
  version: z.string().default('1.0.0').describe('Graph schema version'),
  
  /** All components in the mock-up */
  nodes: z.array(ComponentSpecSchema).describe('Component specifications'),
  
  /** Design tokens (theme) applied to the entire graph */
  tokens: TokenSetSchema.optional().describe('Active design token set'),
  
  /** Metadata for tooling and persistence */
  meta: z.object({
    created: z.string().datetime().optional().describe('ISO timestamp of creation'),
    modified: z.string().datetime().optional().describe('ISO timestamp of last modification'),
    author: z.string().optional().describe('Author or system identifier'),
    description: z.string().optional().describe('Project description'),
  }).optional(),
  
  /** Reserved for future use: explicit connections between components */
  connections: z.array(z.any()).optional().describe('Future: explicit component links'),
});

export type Graph = z.infer<typeof GraphSchema>;

// ============================================================================
// COMMAND SCHEMA (Discriminated Union for Graph Operations)
// ============================================================================

/**
 * Base command properties shared by all command types.
 */
const BaseCommandSchema = z.object({
  id: z.string().uuid().describe('Unique command identifier for tracking'),
});

/**
 * ADD: Adds a new component to the graph.
 */
export const AddCommandSchema = BaseCommandSchema.extend({
  type: z.literal('ADD'),
  component: ComponentSpecSchema.describe('Complete component specification to add'),
});

/**
 * UPDATE: Modifies properties of an existing component.
 */
export const UpdateCommandSchema = BaseCommandSchema.extend({
  type: z.literal('UPDATE'),
  targetId: z.string().uuid().describe('ID of component to update'),
  updates: z.object({
    props: z.record(z.any()).optional().describe('Property updates'),
    frame: FrameSchema.partial().optional().describe('Frame updates'),
    name: z.string().optional().describe('Name update'),
  }).describe('Partial updates to apply'),
});

/**
 * REMOVE: Deletes a component from the graph.
 */
export const RemoveCommandSchema = BaseCommandSchema.extend({
  type: z.literal('REMOVE'),
  targetId: z.string().uuid().describe('ID of component to remove'),
  cascade: z.boolean().default(true).describe('Also remove child components'),
});

/**
 * MOVE: Repositions a component on the canvas.
 */
export const MoveCommandSchema = BaseCommandSchema.extend({
  type: z.literal('MOVE'),
  targetId: z.string().uuid().describe('ID of component to move'),
  position: z.object({
    x: z.number().describe('New X coordinate'),
    y: z.number().describe('New Y coordinate'),
  }),
  region: z.string().optional().describe('Optional new region assignment'),
});

/**
 * SET_TOKENS: Replaces the entire token set (theme switch).
 */
export const SetTokensCommandSchema = BaseCommandSchema.extend({
  type: z.literal('SET_TOKENS'),
  tokens: TokenSetSchema.describe('New token set to apply'),
});

/**
 * Command is a discriminated union of all possible graph operations.
 * Each command type is validated independently and applied atomically.
 */
export const CommandSchema = z.discriminatedUnion('type', [
  AddCommandSchema,
  UpdateCommandSchema,
  RemoveCommandSchema,
  MoveCommandSchema,
  SetTokensCommandSchema,
]);

export type Command = z.infer<typeof CommandSchema>;
export type AddCommand = z.infer<typeof AddCommandSchema>;
export type UpdateCommand = z.infer<typeof UpdateCommandSchema>;
export type RemoveCommand = z.infer<typeof RemoveCommandSchema>;
export type MoveCommand = z.infer<typeof MoveCommandSchema>;
export type SetTokensCommand = z.infer<typeof SetTokensCommandSchema>;

// ============================================================================
// EDIT PLAN SCHEMA (Agent Operations)
// ============================================================================

/**
 * EditPlan represents a complete set of atomic operations to transform the graph.
 * Plans are generated by the agent's Planner and executed atomically by the Patcher.
 * 
 * If any operation fails validation, the entire plan is rolled back.
 */
export const EditPlanSchema = z.object({
  id: z.string().uuid().describe('Unique plan identifier'),
  
  /** Ordered list of commands to execute */
  operations: z.array(CommandSchema).describe('Commands to execute in sequence'),
  
  /** Human-readable description of what this plan accomplishes */
  description: z.string().describe('Summary of planned changes'),
  
  /** Original natural language prompt that generated this plan */
  prompt: z.string().optional().describe('Source NL prompt'),
  
  /** Timestamp of plan generation */
  timestamp: z.string().datetime().optional().describe('ISO timestamp of creation'),
  
  /** Metadata for tracking and debugging */
  meta: z.object({
    estimatedDuration: z.number().optional().describe('Estimated execution time in ms'),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    tags: z.array(z.string()).optional().describe('Categorization tags'),
  }).optional(),
});

export type EditPlan = z.infer<typeof EditPlanSchema>;

// ============================================================================
// VALIDATION RESULT SCHEMA
// ============================================================================

/**
 * ValidationResult captures the outcome of schema validation.
 * Used throughout the system for consistent error reporting.
 */
export const ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
    code: z.string().optional(),
  })).optional(),
  data: z.any().optional(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates data against a Zod schema and returns a structured result.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns ValidationResult with success status and errors
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    errors: result.error.errors.map((err: z.ZodIssue) => ({
      path: err.path,
      message: err.message,
      code: err.code,
    })),
  };
}

/**
 * Type guard to check if a command is an ADD command.
 */
export function isAddCommand(cmd: Command): cmd is AddCommand {
  return cmd.type === 'ADD';
}

/**
 * Type guard to check if a command is an UPDATE command.
 */
export function isUpdateCommand(cmd: Command): cmd is UpdateCommand {
  return cmd.type === 'UPDATE';
}

/**
 * Type guard to check if a command is a REMOVE command.
 */
export function isRemoveCommand(cmd: Command): cmd is RemoveCommand {
  return cmd.type === 'REMOVE';
}

/**
 * Type guard to check if a command is a MOVE command.
 */
export function isMoveCommand(cmd: Command): cmd is MoveCommand {
  return cmd.type === 'MOVE';
}

/**
 * Type guard to check if a command is a SET_TOKENS command.
 */
export function isSetTokensCommand(cmd: Command): cmd is SetTokensCommand {
  return cmd.type === 'SET_TOKENS';
}

/**
 * Creates a new empty graph with optional initial tokens.
 * 
 * @param tokens - Optional design token set
 * @param meta - Optional metadata
 * @returns A valid Graph object
 */
export function createEmptyGraph(
  tokens?: TokenSet,
  meta?: Graph['meta']
): Graph {
  return GraphSchema.parse({
    version: '1.0.0',
    nodes: [],
    tokens,
    meta: meta || {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  });
}

/**
 * Generates a UUID v4 string for component/command IDs.
 * Uses crypto.randomUUID() if available, falls back to a simple implementation.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a new ComponentSpec with required fields and optional overrides.
 * 
 * @param type - Component type
 * @param frame - Position and dimensions
 * @param options - Optional overrides for props, name, children
 * @returns A valid ComponentSpec
 */
export function createComponent(
  type: ComponentType,
  frame: Frame,
  options?: {
    name?: string;
    props?: Record<string, unknown>;
    children?: string[];
  }
): ComponentSpec {
  return ComponentSpecSchema.parse({
    id: generateId(),
    type,
    frame,
    name: options?.name,
    props: options?.props || {},
    children: options?.children,
  });
}

/**
 * Creates a new ADD command for adding a component to the graph.
 */
export function createAddCommand(component: ComponentSpec): AddCommand {
  return AddCommandSchema.parse({
    id: generateId(),
    type: 'ADD',
    component,
  });
}

/**
 * Creates a new UPDATE command for modifying a component.
 */
export function createUpdateCommand(
  targetId: string,
  updates: UpdateCommand['updates']
): UpdateCommand {
  return UpdateCommandSchema.parse({
    id: generateId(),
    type: 'UPDATE',
    targetId,
    updates,
  });
}

/**
 * Creates a new REMOVE command for deleting a component.
 */
export function createRemoveCommand(
  targetId: string,
  cascade = true
): RemoveCommand {
  return RemoveCommandSchema.parse({
    id: generateId(),
    type: 'REMOVE',
    targetId,
    cascade,
  });
}

/**
 * Creates a new MOVE command for repositioning a component.
 */
export function createMoveCommand(
  targetId: string,
  position: { x: number; y: number },
  region?: string
): MoveCommand {
  return MoveCommandSchema.parse({
    id: generateId(),
    type: 'MOVE',
    targetId,
    position,
    region,
  });
}

/**
 * Creates a new SET_TOKENS command for theme switching.
 */
export function createSetTokensCommand(tokens: TokenSet): SetTokensCommand {
  return SetTokensCommandSchema.parse({
    id: generateId(),
    type: 'SET_TOKENS',
    tokens,
  });
}

/**
 * Creates a new EditPlan with operations and metadata.
 */
export function createEditPlan(
  operations: Command[],
  description: string,
  options?: {
    prompt?: string;
    meta?: EditPlan['meta'];
  }
): EditPlan {
  return EditPlanSchema.parse({
    id: generateId(),
    operations,
    description,
    prompt: options?.prompt,
    timestamp: new Date().toISOString(),
    meta: options?.meta,
  });
}

/**
 * Finds a component in a graph by ID.
 * 
 * @param graph - Graph to search
 * @param id - Component ID to find
 * @returns ComponentSpec if found, undefined otherwise
 */
export function findComponentById(
  graph: Graph,
  id: string
): ComponentSpec | undefined {
  return graph.nodes.find((node: ComponentSpec) => node.id === id);
}

/**
 * Finds components in a graph by name.
 * 
 * @param graph - Graph to search
 * @param name - Component name to find
 * @returns Array of matching ComponentSpecs
 */
export function findComponentsByName(
  graph: Graph,
  name: string
): ComponentSpec[] {
  return graph.nodes.filter((node: ComponentSpec) => node.name === name);
}

/**
 * Finds components in a graph by type.
 * 
 * @param graph - Graph to search
 * @param type - Component type to find
 * @returns Array of matching ComponentSpecs
 */
export function findComponentsByType(
  graph: Graph,
  type: ComponentType
): ComponentSpec[] {
  return graph.nodes.filter((node: ComponentSpec) => node.type === type);
}

/**
 * Finds components in a graph by region.
 * 
 * @param graph - Graph to search
 * @param region - Region name to find
 * @returns Array of matching ComponentSpecs
 */
export function findComponentsByRegion(
  graph: Graph,
  region: string
): ComponentSpec[] {
  return graph.nodes.filter((node: ComponentSpec) => node.frame.region === region);
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export default {
  // Schemas
  ComponentTypeSchema,
  FrameSchema,
  ComponentSpecSchema,
  TokenSetSchema,
  GraphSchema,
  CommandSchema,
  AddCommandSchema,
  UpdateCommandSchema,
  RemoveCommandSchema,
  MoveCommandSchema,
  SetTokensCommandSchema,
  EditPlanSchema,
  ValidationResultSchema,
  
  // Validators
  validate,
  
  // Type guards
  isAddCommand,
  isUpdateCommand,
  isRemoveCommand,
  isMoveCommand,
  isSetTokensCommand,
  
  // Factories
  generateId,
  createEmptyGraph,
  createComponent,
  createAddCommand,
  createUpdateCommand,
  createRemoveCommand,
  createMoveCommand,
  createSetTokensCommand,
  createEditPlan,
  
  // Finders
  findComponentById,
  findComponentsByName,
  findComponentsByType,
  findComponentsByRegion,
};