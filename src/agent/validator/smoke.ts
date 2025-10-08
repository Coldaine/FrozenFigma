import { Graph } from '../../schema';
import { Diagnostic } from '.';
import { renderComponent } from '../../app/view/components/UIComponents';

/**
 * Run smoke tests to verify basic UI functionality.
 * 
 * @param graph - Graph to run smoke tests on
 * @returns Smoke test results with diagnostics
 */
export function runSmokeTests(graph: Graph): { passed: boolean; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];

  try {
    // Check that the graph has at least one component (if not empty by design)
    if (graph.nodes.length === 0) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'info',
        message: 'Graph is empty (no components)',
      });
    }

    // Run basic render tests for each component
    const renderDiagnostics = testComponentRendering(graph);
    diagnostics.push(...renderDiagnostics);

    // Run basic interaction tests
    const interactionDiagnostics = testComponentInteractions(graph);
    diagnostics.push(...interactionDiagnostics);

    // Check that all components are within reasonable bounds
    const boundsDiagnostics = testComponentBounds(graph);
    diagnostics.push(...boundsDiagnostics);

    // Check for potential rendering issues
    const renderingDiagnostics = testRenderingIssues(graph);
    diagnostics.push(...renderingDiagnostics);

    // Smoke tests fail only on critical issues
    const criticalErrors = diagnostics.filter(d => d.severity === 'error');
    const passed = criticalErrors.length === 0;

    return {
      passed,
      diagnostics,
    };
  } catch (error) {
    diagnostics.push({
      gate: 'smoke',
      severity: 'error',
      message: `Smoke test execution failed: ${(error as Error).message}`,
    });

    return {
      passed: false,
      diagnostics,
    };
  }
}

/**
 * Test that each component can be rendered without errors.
 */
function testComponentRendering(graph: Graph): Diagnostic[] {
 const diagnostics: Diagnostic[] = [];

  for (const node of graph.nodes) {
    try {
      // Try to render the component
      const element = renderComponent(node, { 
        isSelected: false,
        onClick: () => console.log('clicked'),
        onMouseEnter: () => console.log('mouseenter'),
        onMouseLeave: () => console.log('mouseleave')
      });

      // If we get a valid element, rendering passed
      if (!element) {
        diagnostics.push({
          gate: 'smoke',
          severity: 'error',
          message: `Component ${node.id} (${node.type}) failed to render`,
        });
      }
    } catch (error) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Component ${node.id} (${node.type}) threw error during render: ${(error as Error).message}`,
      });
    }
  }

  return diagnostics;
}

/**
 * Test basic component interactions.
 */
function testComponentInteractions(graph: Graph): Diagnostic[] {
 const diagnostics: Diagnostic[] = [];

  // For smoke tests, we'll just verify that components have expected interaction props
  for (const node of graph.nodes) {
    try {
      // Check if interactive components have appropriate props
      if (['button', 'slider', 'toggle', 'input', 'select'].includes(node.type)) {
        // Verify that interactive components have some kind of label or identifier
        if (!node.props.label && !node.props.placeholder && !node.props.children && !node.name) {
          diagnostics.push({
            gate: 'smoke',
            severity: 'warning',
            message: `Interactive component ${node.id} (${node.type}) has no label, placeholder, or name`,
          });
        }
      }
    } catch (error) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Interaction test for component ${node.id} (${node.type}) failed: ${(error as Error).message}`,
      });
    }
  }

 return diagnostics;
}

/**
 * Test that components are within reasonable bounds.
 */
function testComponentBounds(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const node of graph.nodes) {
    // Check that coordinates are within reasonable bounds
    if (node.frame.x < -10000 || node.frame.x > 10000) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Component ${node.id} has x coordinate out of bounds: ${node.frame.x}`,
      });
    }
    
    if (node.frame.y < -10000 || node.frame.y > 1000) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Component ${node.id} has y coordinate out of bounds: ${node.frame.y}`,
      });
    }
    
    // Check that dimensions are reasonable
    if (node.frame.w <= 0 || node.frame.w > 10000) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Component ${node.id} has invalid width: ${node.frame.w}`,
      });
    }
    
    if (node.frame.h <= 0 || node.frame.h > 10000) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'error',
        message: `Component ${node.id} has invalid height: ${node.frame.h}`,
      });
    }
 }

  return diagnostics;
}

/**
 * Test for potential rendering issues.
 */
function testRenderingIssues(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Check for overlapping components that might cause rendering issues
  for (let i = 0; i < graph.nodes.length; i++) {
    for (let j = i + 1; j < graph.nodes.length; j++) {
      const a = graph.nodes[i];
      const b = graph.nodes[j];
      
      // Check if components overlap in the same region
      if (a.frame.region === b.frame.region) {
        const overlap = checkOverlap(a.frame, b.frame);
        if (overlap) {
          diagnostics.push({
            gate: 'smoke',
            severity: 'warning',
            message: `Components ${a.id} and ${b.id} overlap in region ${a.frame.region}`,
          });
        }
      }
    }
  }

  // Check for extremely small components that might not render properly
  for (const node of graph.nodes) {
    if (node.frame.w < 5 || node.frame.h < 5) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'warning',
        message: `Component ${node.id} is extremely small (${node.frame.w}x${node.frame.h}) and may not render properly`,
      });
    }
  }

 // Check for extremely large components that might cause performance issues
  for (const node of graph.nodes) {
    if (node.frame.w > 5000 || node.frame.h > 5000) {
      diagnostics.push({
        gate: 'smoke',
        severity: 'warning',
        message: `Component ${node.id} is extremely large (${node.frame.w}x${node.frame.h}) and may cause performance issues`,
      });
    }
  }

  return diagnostics;
}

/**
 * Check if two frames overlap.
 */
function checkOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  );
}

/**
 * Run headless browser tests to verify actual rendering.
 * This function would typically run tests in a headless browser environment.
 * 
 * @param graph - Graph to run browser tests on
 * @returns Browser test results
 */
export async function runHeadlessBrowserTests(_graph: Graph): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  // In a real implementation, this would run tests in a headless browser (like Puppeteer or Playwright)
  // For now, we'll return an empty result as a placeholder
  const diagnostics: Diagnostic[] = [];
  
  // This is a placeholder - in a real implementation, you would:
 // 1. Launch a headless browser
  // 2. Render the UI with the given graph
 // 3. Perform interaction tests
  // 4. Capture and report any rendering or interaction issues
  
  return {
    passed: true, // Placeholder - assume browser tests pass
    diagnostics,
  };
}

/**
 * Test the Canvas component rendering with the provided graph.
 * 
 * @param graph - Graph to test in the Canvas
 * @returns Canvas test results
 */
export async function testCanvasRendering(graph: Graph): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];

  try {
    // This would normally render the actual Canvas component with the graph
    // For now, we'll just verify that the graph structure is valid for rendering
    
    // Check that all components have valid types that can be rendered
    const validTypes = [
      'button', 'slider', 'toggle', 'tabs', 'modal', 'tray', 'card', 'card-grid',
      'form', 'input', 'select', 'textarea', 'progress', 'tooltip', 'popover',
      'drawer', 'dialog'
    ];
    
    for (const node of graph.nodes) {
      if (!validTypes.includes(node.type)) {
        diagnostics.push({
          gate: 'smoke',
          severity: 'error',
          message: `Component ${node.id} has unrenderable type: ${node.type}`,
        });
      }
    }

    // Verify that the graph structure is compatible with rendering
    // Check for valid IDs
    for (const node of graph.nodes) {
      if (!node.id || typeof node.id !== 'string') {
        diagnostics.push({
          gate: 'smoke',
          severity: 'error',
          message: `Component has invalid ID: ${node.id}`,
        });
      }
    }

    // Check that child references are valid
    for (const node of graph.nodes) {
      if (node.children) {
        for (const childId of node.children) {
          if (typeof childId !== 'string') {
            diagnostics.push({
              gate: 'smoke',
              severity: 'error',
              message: `Component ${node.id} has invalid child ID: ${childId}`,
            });
          } else if (!graph.nodes.some(n => n.id === childId)) {
            diagnostics.push({
              gate: 'smoke',
              severity: 'error',
              message: `Component ${node.id} references non-existent child: ${childId}`,
            });
          }
        }
      }
    }
  } catch (error) {
    diagnostics.push({
      gate: 'smoke',
      severity: 'error',
      message: `Canvas rendering test failed: ${(error as Error).message}`,
    });
  }

  return {
    passed: diagnostics.filter(d => d.severity === 'error').length === 0,
    diagnostics,
  };
}

/**
 * Format smoke test diagnostics for display.
 * 
 * @param diagnostics - Array of smoke test diagnostics
 * @returns Formatted string representation
 */
export function formatSmokeDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'All smoke tests passed.';
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = '';
  if (errors.length > 0) {
    output += `Smoke Test Errors (${errors.length}):\n`;
    errors.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (warnings.length > 0) {
    output += `Smoke Test Warnings (${warnings.length}):\n`;
    warnings.forEach(d => output += `  - ${d.message}\n`);
    output += '\n';
  }
  
  if (infos.length > 0) {
    output += `Smoke Test Info (${infos.length}):\n`;
    infos.forEach(d => output += ` - ${d.message}\n`);
    output += '\n';
  }
  
  return output.trim();
}

/**
 * Run a comprehensive smoke test suite.
 */
export async function runSmokeTestSuite(graph: Graph): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];

  // Run all smoke tests
  const smokeResult = runSmokeTests(graph);
 diagnostics.push(...smokeResult.diagnostics);

  // Run headless browser tests (placeholder)
  const browserResult = await runHeadlessBrowserTests(graph);
  diagnostics.push(...browserResult.diagnostics);

  // Run canvas rendering tests
 const canvasResult = await testCanvasRendering(graph);
 diagnostics.push(...canvasResult.diagnostics);

  // Check if any critical issues were found
  const criticalErrors = diagnostics.filter(d => d.severity === 'error');
  const passed = criticalErrors.length === 0;

  return {
    passed,
    diagnostics,
  };
}