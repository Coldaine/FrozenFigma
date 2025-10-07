import { Graph, ComponentSpec, ComponentSpecSchema, validate, GraphSchema } from '../../schema';
import { Diagnostic } from '.';

/**
 * Run type checking on a graph.
 * 
 * @param graph - Graph to type check
 * @returns Type checking results with diagnostics
 */
export function runTypeCheck(graph: Graph): { passed: boolean; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];

  // Validate the entire graph against the schema
  const graphValidation = validate(GraphSchema, graph);
  
  if (!graphValidation.success && graphValidation.errors) {
    for (const error of graphValidation.errors) {
      diagnostics.push({
        gate: 'types',
        severity: 'error',
        message: `Type error at ${error.path.join('.')}: ${error.message}`,
      });
    }
  }

  // Run additional type checks on individual components
  for (const node of graph.nodes) {
    const componentValidation = validateComponentTypes(node);
    diagnostics.push(...componentValidation);
  }

  // Check for type consistency across related components
  const relationshipDiagnostics = checkTypeRelationships(graph);
  diagnostics.push(...relationshipDiagnostics);

  // Type errors cause the gate to fail
  const hasErrors = diagnostics.some(d => d.severity === 'error');
  
  return {
    passed: !hasErrors,
    diagnostics,
  };
}

/**
 * Validate types for a single component.
 * 
 * @param component - Component to validate
 * @returns Type validation diagnostics
 */
function validateComponentTypes(component: ComponentSpec): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Validate the component structure itself
  const componentValidation = validate(ComponentSpecSchema, component);
  
  if (!componentValidation.success && componentValidation.errors) {
    for (const error of componentValidation.errors) {
      diagnostics.push({
        gate: 'types',
        severity: 'error',
        message: `Component ${component.id} type error at ${error.path.join('.')}: ${error.message}`,
      });
    }
  }

  // Validate component-specific props based on type
 const propDiagnostics = validateComponentProps(component);
 diagnostics.push(...propDiagnostics);

  return diagnostics;
}

/**
 * Validate component props based on the component type.
 * 
 * @param component - Component to validate
 * @returns Prop validation diagnostics
 */
function validateComponentProps(component: ComponentSpec): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  switch (component.type) {
    case 'button':
      // Validate button-specific props
      if (component.props && typeof component.props === 'object') {
        for (const [key, value] of Object.entries(component.props)) {
          // Check for common prop types
          if (key === 'label' && value && typeof value !== 'string') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Button component ${component.id} prop '${key}' should be a string, got ${typeof value}`,
            });
          } else if (key === 'onClick' && typeof value !== 'function' && typeof value !== 'string') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Button component ${component.id} prop '${key}' should be a function or string, got ${typeof value}`,
            });
          } else if (key === 'disabled' && typeof value !== 'boolean') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Button component ${component.id} prop '${key}' should be a boolean, got ${typeof value}`,
            });
          }
        }
      }
      break;

    case 'input':
      // Validate input-specific props
      if (component.props && typeof component.props === 'object') {
        for (const [key, value] of Object.entries(component.props)) {
          if (key === 'value' && typeof value !== 'string' && typeof value !== 'number') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Input component ${component.id} prop '${key}' should be a string or number, got ${typeof value}`,
            });
          } else if (key === 'type' && typeof value !== 'string') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Input component ${component.id} prop '${key}' should be a string, got ${typeof value}`,
            });
          } else if (key === 'onChange' && typeof value !== 'function') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Input component ${component.id} prop '${key}' should be a function, got ${typeof value}`,
            });
          }
        }
      }
      break;

    case 'slider':
      // Validate slider-specific props
      if (component.props && typeof component.props === 'object') {
        for (const [key, value] of Object.entries(component.props)) {
          if (key === 'value' && typeof value !== 'number') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Slider component ${component.id} prop '${key}' should be a number, got ${typeof value}`,
            });
          } else if ((key === 'min' || key === 'max') && typeof value !== 'number') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Slider component ${component.id} prop '${key}' should be a number, got ${typeof value}`,
            });
          } else if (key === 'onChange' && typeof value !== 'function') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Slider component ${component.id} prop '${key}' should be a function, got ${typeof value}`,
            });
          }
        }
      }
      break;

    case 'toggle':
      // Validate toggle-specific props
      if (component.props && typeof component.props === 'object') {
        for (const [key, value] of Object.entries(component.props)) {
          if (key === 'checked' && typeof value !== 'boolean') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Toggle component ${component.id} prop '${key}' should be a boolean, got ${typeof value}`,
            });
          } else if (key === 'onChange' && typeof value !== 'function') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Toggle component ${component.id} prop '${key}' should be a function, got ${typeof value}`,
            });
          }
        }
      }
      break;

    case 'modal':
      // Validate modal-specific props
      if (component.props && typeof component.props === 'object') {
        for (const [key, value] of Object.entries(component.props)) {
          if (key === 'open' && typeof value !== 'boolean') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Modal component ${component.id} prop '${key}' should be a boolean, got ${typeof value}`,
            });
          } else if (key === 'onClose' && typeof value !== 'function') {
            diagnostics.push({
              gate: 'types',
              severity: 'error',
              message: `Modal component ${component.id} prop '${key}' should be a function, got ${typeof value}`,
            });
          }
        }
      }
      break;

    // Add validation for other component types as needed
    default:
      // For other component types, at least validate that props is an object
      if (component.props && typeof component.props !== 'object') {
        diagnostics.push({
          gate: 'types',
          severity: 'error',
          message: `Component ${component.id} (${component.type}) props should be an object, got ${typeof component.props}`,
        });
      }
  }

  return diagnostics;
}

/**
 * Check type relationships between components (e.g., parent-child relationships).
 * 
 * @param graph - Graph to check
 * @returns Relationship validation diagnostics
 */
function checkTypeRelationships(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Check that child references point to valid components
  for (const node of graph.nodes) {
    if (node.children) {
      for (const childId of node.children) {
        const childNode = graph.nodes.find(n => n.id === childId);
        if (!childNode) {
          diagnostics.push({
            gate: 'types',
            severity: 'error',
            message: `Component ${node.id} references non-existent child component: ${childId}`,
          });
        }
      }
    }
  }

  // Check for circular references in component relationships
  const circularRefDiagnostics = detectCircularReferences(graph);
 diagnostics.push(...circularRefDiagnostics);

  return diagnostics;
}

/**
 * Detect circular references in component relationships.
 * 
 * @param graph - Graph to check
 * @returns Circular reference diagnostics
 */
function detectCircularReferences(graph: Graph): Diagnostic[] {
 const diagnostics: Diagnostic[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string, path: string[] = []): boolean {
    if (recursionStack.has(nodeId)) {
      // Found a cycle
      path.push(nodeId);
      diagnostics.push({
        gate: 'types',
        severity: 'error',
        message: `Circular reference detected: ${path.join(' -> ')}`,
      });
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const node = graph.nodes.find(n => n.id === nodeId);
    if (node && node.children) {
      for (const childId of node.children) {
        if (hasCycle(childId, [...path])) {
          return true; // Already reported, just return
        }
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      hasCycle(node.id);
    }
  }

  return diagnostics;
}

/**
 * Run TypeScript compiler programmatically on the project files.
 * This function would typically run the TypeScript compiler.
 * 
 * @param filePaths - Optional list of file paths to type check (defaults to all src files)
 * @returns TypeScript compiler results
 */
export async function runTypeScriptCompiler(filePaths?: string[]): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  // In a real implementation, this would run the TypeScript compiler programmatically
  // For now, we'll return an empty result as a placeholder
 const diagnostics: Diagnostic[] = [];
  
  // This is a placeholder - in a real implementation, you would:
 // 1. Import TypeScript compiler programmatically
  // 2. Create a TypeScript program
  // 3. Run type checking on the specified files
  // 4. Format results into Diagnostic objects
  
  return {
    passed: true, // Placeholder - assume TypeScript passes
    diagnostics,
  };
}

/**
 * Format type diagnostics for display.
 * 
 * @param diagnostics - Array of type diagnostics
 * @returns Formatted string representation
 */
export function formatTypeDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'No type issues found.';
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = '';
  if (errors.length > 0) {
    output += `Type Errors (${errors.length}):\n`;
    errors.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (warnings.length > 0) {
    output += `Type Warnings (${warnings.length}):\n`;
    warnings.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (infos.length > 0) {
    output += `Type Info (${infos.length}):\n`;
    infos.forEach(d => output += ` - ${d.message}\n`);
    output += '\n';
  }
  
  return output.trim();
}