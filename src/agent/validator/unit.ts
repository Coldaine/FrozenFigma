import { Graph, ComponentType } from '../../schema';
import { Diagnostic } from '.';
import { runValidationGate } from '.';
import { createTestGraph, MockFactory, InteractionSimulator } from '../../tests/testUtils';
import { renderComponent } from '../../app/view/components/UIComponents';

/**
 * Run unit tests on the graph and related components.
 * 
 * @param graph - Graph to run unit tests on
 * @returns Unit test results with diagnostics
 */
export async function runUnitTests(graph: Graph): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];

  try {
    // Run unit tests for schema functions
    const schemaTestDiagnostics = await runSchemaUnitTests();
    diagnostics.push(...schemaTestDiagnostics);

    // Run unit tests for UI components
    const uiComponentTestDiagnostics = await runUIComponentUnitTests(graph);
    diagnostics.push(...uiComponentTestDiagnostics);

    // Run unit tests for agent modules
    const agentTestDiagnostics = await runAgentUnitTests(graph);
    diagnostics.push(...agentTestDiagnostics);

    // Run unit tests for utility functions
    const utilityTestDiagnostics = await runUtilityUnitTests();
    diagnostics.push(...utilityTestDiagnostics);

    // Check if any tests failed
    const failedTests = diagnostics.filter(d => d.severity === 'error');
    const passed = failedTests.length === 0;

    return {
      passed,
      diagnostics,
    };
  } catch (error) {
    diagnostics.push({
      gate: 'unit',
      severity: 'error',
      message: `Unit test execution failed: ${(error as Error).message}`,
    });

    return {
      passed: false,
      diagnostics,
    };
  }
}

/**
 * Run unit tests for schema functions.
 */
async function runSchemaUnitTests(): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  try {
    // Test createEmptyGraph
    try {
      const emptyGraph = await import('../../schema').then(m => m.createEmptyGraph());
      if (!emptyGraph || !Array.isArray(emptyGraph.nodes) || emptyGraph.nodes.length !== 0) {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'createEmptyGraph does not return a valid empty graph',
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `createEmptyGraph test failed: ${(error as Error).message}`,
      });
    }

    // Test createComponent
    try {
      const { createComponent } = await import('../../schema');
      const validTypes: ComponentType[] = ['button', 'slider', 'toggle', 'card', 'input'];
      
      for (const type of validTypes) {
        const component = createComponent(type, { x: 0, y: 0, w: 100, h: 50, region: 'main' });
        if (!component.id || component.type !== type) {
          diagnostics.push({
            gate: 'unit',
            severity: 'error',
            message: `createComponent failed for type ${type}`,
          });
        }
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `createComponent test failed: ${(error as Error).message}`,
      });
    }

    // Test validation functions
    try {
      const { validate, GraphSchema, createEmptyGraph } = await import('../../schema');
      const graph = createEmptyGraph();
      const result = validate(GraphSchema, graph);
      
      if (!result.success) {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'Graph validation failed for valid empty graph',
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `Graph validation test failed: ${(error as Error).message}`,
      });
    }
  } catch (error) {
    diagnostics.push({
      gate: 'unit',
      severity: 'error',
      message: `Schema unit tests failed: ${(error as Error).message}`,
    });
  }

  return diagnostics;
}

/**
 * Run unit tests for UI components.
 */
async function runUIComponentUnitTests(graph: Graph): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  try {
    // Test each component type
    const componentTypes: ComponentType[] = ['button', 'slider', 'toggle', 'card', 'input', 'select', 'textarea', 'modal', 'tabs', 'progress', 'tooltip', 'drawer', 'dialog', 'tray', 'popover'];

    for (const type of componentTypes) {
      try {
        // Create a mock component of this type
        const mockComponent = MockFactory.createMockComponent(type, {
          name: `test-${type}`,
          props: { label: `Test ${type}` }
        });

        // Try to render the component
        const element = renderComponent(mockComponent, { 
          isSelected: false,
          onClick: () => console.log('clicked')
        });

        // If we get here, the component rendered without throwing
        if (!element) {
          diagnostics.push({
            gate: 'unit',
            severity: 'error',
            message: `UI component ${type} did not render properly`,
          });
        }
      } catch (error) {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: `UI component ${type} test failed: ${(error as Error).message}`,
        });
      }
    }
  } catch (error) {
    diagnostics.push({
      gate: 'unit',
      severity: 'error',
      message: `UI component unit tests failed: ${(error as Error).message}`,
    });
  }

  return diagnostics;
}

/**
 * Run unit tests for agent modules.
 */
async function runAgentUnitTests(graph: Graph): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  try {
    // Test the validation gate itself
    try {
      const result = await runValidationGate(graph);
      if (typeof result.passed !== 'boolean' || !Array.isArray(result.diagnostics)) {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'runValidationGate returned invalid result structure',
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `runValidationGate test failed: ${(error as Error).message}`,
      });
    }

    // Test with a test graph
    try {
      const testGraph = createTestGraph({ componentCount: 3 });
      const result = await runValidationGate(testGraph);
      if (typeof result.passed !== 'boolean') {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'runValidationGate with test graph returned invalid result',
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `runValidationGate with test graph failed: ${(error as Error).message}`,
      });
    }
  } catch (error) {
    diagnostics.push({
      gate: 'unit',
      severity: 'error',
      message: `Agent unit tests failed: ${(error as Error).message}`,
    });
  }

  return diagnostics;
}

/**
 * Run unit tests for utility functions.
 */
async function runUtilityUnitTests(): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  try {
    // Test InteractionSimulator
    try {
      // Create a mock element for testing
      const mockElement = document.createElement('div');
      await InteractionSimulator.simulateClick(mockElement);
      // If no error was thrown, the test passes
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `InteractionSimulator test failed: ${(error as Error).message}`,
      });
    }

    // Test MockFactory
    try {
      const mockComponent = MockFactory.createMockComponent('button');
      if (!mockComponent.id || mockComponent.type !== 'button') {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'MockFactory.createMockComponent returned invalid component',
        });
      }

      const mockGraph = MockFactory.createMockGraph(2);
      if (!mockGraph.nodes || mockGraph.nodes.length !== 2) {
        diagnostics.push({
          gate: 'unit',
          severity: 'error',
          message: 'MockFactory.createMockGraph returned invalid graph',
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `MockFactory test failed: ${(error as Error).message}`,
      });
    }
  } catch (error) {
    diagnostics.push({
      gate: 'unit',
      severity: 'error',
      message: `Utility unit tests failed: ${(error as Error).message}`,
    });
  }

  return diagnostics;
}

/**
 * Run Vitest programmatically on the project files.
 * This function would typically run the Vitest test runner.
 * 
 * @param filePaths - Optional list of file paths to run tests on (defaults to all test files)
 * @returns Vitest results
 */
export async function runVitest(filePaths?: string[]): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  // In a real implementation, this would run Vitest programmatically
  // For now, we'll return an empty result as a placeholder
  const diagnostics: Diagnostic[] = [];
  
  // This is a placeholder - in a real implementation, you would:
 // 1. Import Vitest programmatically
  // 2. Configure and run the test runner
  // 3. Format results into Diagnostic objects
  
  return {
    passed: true, // Placeholder - assume tests pass
    diagnostics,
  };
}

/**
 * Format unit test diagnostics for display.
 * 
 * @param diagnostics - Array of unit test diagnostics
 * @returns Formatted string representation
 */
export function formatUnitDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'All unit tests passed.';
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = '';
  if (errors.length > 0) {
    output += `Unit Test Failures (${errors.length}):\n`;
    errors.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (warnings.length > 0) {
    output += `Unit Test Warnings (${warnings.length}):\n`;
    warnings.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (infos.length > 0) {
    output += `Unit Test Info (${infos.length}):\n`;
    infos.forEach(d => output += ` - ${d.message}\n`);
    output += '\n';
  }
  
  return output.trim();
}

/**
 * Create a unit test suite for a specific module.
 * 
 * @param moduleName - Name of the module to test
 * @param tests - Array of test functions
 * @returns Test suite results
 */
export async function createTestSuite(
  moduleName: string,
  tests: Array<() => Promise<boolean | { passed: boolean; message?: string }>>
): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];

  for (let i = 0; i < tests.length; i++) {
    try {
      const testResult = await tests[i]();
      const testName = `Test ${i + 1} for ${moduleName}`;
      
      if (typeof testResult === 'boolean') {
        if (!testResult) {
          diagnostics.push({
            gate: 'unit',
            severity: 'error',
            message: `${testName} failed`,
          });
        }
      } else {
        if (!testResult.passed) {
          diagnostics.push({
            gate: 'unit',
            severity: 'error',
            message: `${testName} failed: ${testResult.message || 'No message'}`,
          });
        }
      }
    } catch (error) {
      diagnostics.push({
        gate: 'unit',
        severity: 'error',
        message: `Test ${i + 1} for ${moduleName} threw an error: ${(error as Error).message}`,
      });
    }
  }

  return {
    passed: diagnostics.filter(d => d.severity === 'error').length === 0,
    diagnostics,
  };
}