import { Graph, ComponentSpec } from '../../schema';
import { Diagnostic } from '.';

/**
 * Custom lint rule definition.
 */
export interface LintRule {
  id: string;
  description: string;
 category: 'naming' | 'structure' | 'performance' | 'accessibility' | 'consistency';
  severity: 'error' | 'warning' | 'info';
  check: (component: ComponentSpec) => Diagnostic | null;
}

/**
 * Run lint checks on a graph.
 * 
 * @param graph - Graph to lint
 * @returns Lint results with diagnostics
 */
export function runLint(graph: Graph): { passed: boolean; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  
  // Define built-in lint rules
  const rules: LintRule[] = [
    // Naming convention rule
    {
      id: 'component-naming',
      description: 'Component names should follow kebab-case convention',
      category: 'naming',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        if (component.name && !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(component.name)) {
          return {
            gate: 'lint',
            severity: 'warning',
            message: `Component ${component.id} name "${component.name}" should use kebab-case (e.g., "my-component")`,
          };
        }
        return null;
      }
    },
    
    // Component without props rule
    {
      id: 'no-props',
      description: 'Components should have meaningful props',
      category: 'structure',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        if (!component.props || Object.keys(component.props).length === 0) {
          return {
            gate: 'lint',
            severity: 'warning',
            message: `Component ${component.id} (${component.type}) has no props`,
          };
        }
        return null;
      }
    },
    
    // Very small dimensions rule
    {
      id: 'small-dimensions',
      description: 'Components should not have very small dimensions',
      category: 'structure',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        if (component.frame.w < 10 || component.frame.h < 10) {
          return {
            gate: 'lint',
            severity: 'warning',
            message: `Component ${component.id} has very small dimensions (${component.frame.w}x${component.frame.h})`,
          };
        }
        return null;
      }
    },
    
    // Large dimensions rule
    {
      id: 'large-dimensions',
      description: 'Components should not have very large dimensions',
      category: 'structure',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        if (component.frame.w > 5000 || component.frame.h > 5000) {
          return {
            gate: 'lint',
            severity: 'warning',
            message: `Component ${component.id} has very large dimensions (${component.frame.w}x${component.frame.h})`,
          };
        }
        return null;
      }
    },
    
    // Position validation rule
    {
      id: 'position-validation',
      description: 'Components should be positioned within reasonable bounds',
      category: 'structure',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        if (component.frame.x < -1000 || component.frame.x > 10000 || 
            component.frame.y < -1000 || component.frame.y > 10000) {
          return {
            gate: 'lint',
            severity: 'warning',
            message: `Component ${component.id} has position out of bounds: (${component.frame.x}, ${component.frame.y})`,
          };
        }
        return null;
      }
    },
    
    // Required props for specific types
    {
      id: 'required-props',
      description: 'Certain component types require specific props',
      category: 'structure',
      severity: 'warning',
      check: (component: ComponentSpec) => {
        switch (component.type) {
          case 'button':
            if (!component.props.label && !component.props.text && !component.props.children) {
              return {
                gate: 'lint',
                severity: 'warning',
                message: `Button component ${component.id} should have a label, text, or children prop`,
              };
            }
            break;
          case 'input':
            if (!component.props.placeholder && !component.props.label) {
              return {
                gate: 'lint',
                severity: 'warning',
                message: `Input component ${component.id} should have a placeholder or label prop`,
              };
            }
            break;
          case 'modal':
            if (!component.props.title && !component.props.header) {
              return {
                gate: 'lint',
                severity: 'warning',
                message: `Modal component ${component.id} should have a title or header prop`,
              };
            }
            break;
        }
        return null;
      }
    },
    
    // Accessibility rule for certain components
    {
      id: 'accessibility',
      description: 'Components should have accessibility attributes when needed',
      category: 'accessibility',
      severity: 'info',
      check: (component: ComponentSpec) => {
        if (component.type === 'button' && !component.props.ariaLabel) {
          return {
            gate: 'lint',
            severity: 'info',
            message: `Button component ${component.id} should have an aria-label for accessibility`,
          };
        }
        return null;
      }
    }
  ];

  // Run all rules against each component
  for (const component of graph.nodes) {
    for (const rule of rules) {
      const diagnostic = rule.check(component);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }
  }

  // Check for duplicate names (across all components)
  const nameMap: Record<string, ComponentSpec[]> = {};
  for (const component of graph.nodes) {
    if (component.name) {
      if (!nameMap[component.name]) {
        nameMap[component.name] = [];
      }
      nameMap[component.name].push(component);
    }
  }
  
  for (const [name, components] of Object.entries(nameMap)) {
    if (components.length > 1) {
      diagnostics.push({
        gate: 'lint',
        severity: 'warning',
        message: `Duplicate component name "${name}" used by ${components.length} components: ${components.map(c => c.id).join(', ')}`,
      });
    }
 }

  // Lint warnings don't fail the gate, only errors do
  const hasErrors = diagnostics.some(d => d.severity === 'error');
  
  return {
    passed: !hasErrors,
    diagnostics,
  };
}

/**
 * Run ESLint programmatically on the project files.
 * This function would typically run ESLint on the actual code files.
 * 
 * @param filePaths - Optional list of file paths to lint (defaults to all src files)
 * @returns ESLint results
 */
export async function runESLint(_filePaths?: string[]): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  void _filePaths;
  // In a real implementation, this would run ESLint programmatically
  // For now, we'll return an empty result as a placeholder
  const diagnostics: Diagnostic[] = [];
  
  // This is a placeholder - in a real implementation, you would:
  // 1. Import ESLint programmatically
  // 2. Create an ESLint instance
  // 3. Run linting on the specified files
  // 4. Format results into Diagnostic objects
  
  return {
    passed: true, // Placeholder - assume ESLint passes
    diagnostics,
  };
}

/**
 * Create a custom lint rule.
 * 
 * @param rule - The lint rule to register
 */
export function createLintRule(rule: LintRule): LintRule {
  return { ...rule };
}

/**
 * Format lint diagnostics for display.
 * 
 * @param diagnostics - Array of lint diagnostics
 * @returns Formatted string representation
 */
export function formatLintDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'No lint issues found.';
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = '';
  if (errors.length > 0) {
    output += `Errors (${errors.length}):\n`;
    errors.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (warnings.length > 0) {
    output += `Warnings (${warnings.length}):\n`;
    warnings.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (infos.length > 0) {
    output += `Info (${infos.length}):\n`;
    infos.forEach(d => output += ` - ${d.message}\n`);
    output += '\n';
  }
  
  return output.trim();
}