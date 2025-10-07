import { Graph } from '../../schema';
import { runLint } from './lint';
import { runTypeCheck } from './types';
import { runUnitTests } from './unit';
import { runSmokeTests } from './smoke';

/**
 * Diagnostic entry from validation gates.
 */
export interface Diagnostic {
  gate: 'schema' | 'lint' | 'types' | 'unit' | 'smoke';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: {
    file?: string;
    line?: number;
    column?: number;
  };
}

/**
 * Result of running all validation gates.
 */
export interface ValidationGateResult {
  passed: boolean;
  diagnostics: Diagnostic[];
  gateResults: {
    schema: boolean;
    lint: boolean;
    types: boolean;
    unit: boolean;
    smoke: boolean;
  };
  executionTime: number;
}

/**
 * Runs the validation "gate" (schema → lint → types → unit → smoke) and aggregates diagnostics.
 * 
 * Each gate must pass for the overall validation to succeed.
 * Gates are run in sequence, and execution stops at the first failure.
 * 
 * @param graph - Graph to validate
 * @returns ValidationGateResult with pass/fail status and diagnostics
 * 
 * @example
 * const result = runValidationGate(graph);
 * if (!result.passed) {
 *   console.error('Validation failed:', result.diagnostics);
 * }
 */
export async function runValidationGate(graph: Graph): Promise<ValidationGateResult> {
  const startTime = Date.now();
  const diagnostics: Diagnostic[] = [];
  
  const gateResults = {
    schema: false,
    lint: false,
    types: false,
    unit: false,
    smoke: false,
  };

  console.log('[Validator] Running validation gates...');

  // Gate 1: Schema validation
  console.log('[Validator] Gate 1/5: Schema validation');
  const schemaResult = runSchemaValidation(graph);
  gateResults.schema = schemaResult.passed;
  diagnostics.push(...schemaResult.diagnostics);

  if (!schemaResult.passed) {
    console.error('[Validator] Schema validation FAILED');
    return {
      passed: false,
      diagnostics,
      gateResults,
      executionTime: Date.now() - startTime,
    };
  }
  console.log('[Validator] Schema validation PASSED');

  // Gate 2: Lint
  console.log('[Validator] Gate 2/5: Lint');
  const lintResult = runLint(graph);
  gateResults.lint = lintResult.passed;
  diagnostics.push(...lintResult.diagnostics);

  if (!lintResult.passed) {
    console.error('[Validator] Lint FAILED');
    return {
      passed: false,
      diagnostics,
      gateResults,
      executionTime: Date.now() - startTime,
    };
  }
  console.log('[Validator] Lint PASSED');

  // Gate 3: Types
  console.log('[Validator] Gate 3/5: Type checking');
  const typesResult = runTypeCheck(graph);
  gateResults.types = typesResult.passed;
  diagnostics.push(...typesResult.diagnostics);

  if (!typesResult.passed) {
    console.error('[Validator] Type checking FAILED');
    return {
      passed: false,
      diagnostics,
      gateResults,
      executionTime: Date.now() - startTime,
    };
  }
  console.log('[Validator] Type checking PASSED');

  // Gate 4: Unit tests
  console.log('[Validator] Gate 4/5: Unit tests');
  const unitResult = await runUnitTests(graph);
  gateResults.unit = unitResult.passed;
  diagnostics.push(...unitResult.diagnostics);

  if (!unitResult.passed) {
    console.error('[Validator] Unit tests FAILED');
    return {
      passed: false,
      diagnostics,
      gateResults,
      executionTime: Date.now() - startTime,
    };
  }
  console.log('[Validator] Unit tests PASSED');

  // Gate 5: Smoke tests
  console.log('[Validator] Gate 5/5: Smoke tests');
  const smokeResult = runSmokeTests(graph);
  gateResults.smoke = smokeResult.passed;
  diagnostics.push(...smokeResult.diagnostics);

  if (!smokeResult.passed) {
    console.error('[Validator] Smoke tests FAILED');
    return {
      passed: false,
      diagnostics,
      gateResults,
      executionTime: Date.now() - startTime,
    };
  }
  console.log('[Validator] Smoke tests PASSED');

  const executionTime = Date.now() - startTime;
  console.log(`[Validator] All gates PASSED (${executionTime}ms)`);

  return {
    passed: true,
    diagnostics,
    gateResults,
    executionTime,
  };
}

/**
 * Gate 1: Validate the graph structure against the schema.
 */
function runSchemaValidation(graph: Graph): { passed: boolean; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  
  // Validate graph structure
  if (!Array.isArray(graph.nodes)) {
    diagnostics.push({
      gate: 'schema',
      severity: 'error',
      message: 'Graph nodes must be an array',
    });
  }

 // Additional semantic validations
  
  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) {
      diagnostics.push({
        gate: 'schema',
        severity: 'error',
        message: `Duplicate component ID: ${node.id}`,
      });
    }
    ids.add(node.id);
  }

  // Check for invalid child references
  for (const node of graph.nodes) {
    if (node.children) {
      for (const childId of node.children) {
        if (!ids.has(childId)) {
          diagnostics.push({
            gate: 'schema',
            severity: 'error',
            message: `Invalid child reference in ${node.id}: ${childId} does not exist`,
          });
        }
      }
    }
  }

  // Check for overlapping components (warning only)
  for (let i = 0; i < graph.nodes.length; i++) {
    for (let j = i + 1; j < graph.nodes.length; j++) {
      const a = graph.nodes[i];
      const b = graph.nodes[j];
      
      if (a.frame.region === b.frame.region) {
        const overlap = checkOverlap(a.frame, b.frame);
        if (overlap) {
          diagnostics.push({
            gate: 'schema',
            severity: 'warning',
            message: `Components ${a.id} and ${b.id} overlap in region ${a.frame.region}`,
          });
        }
      }
    }
  }

  return {
    passed: diagnostics.filter(d => d.severity === 'error').length === 0,
    diagnostics,
  };
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
 * Format diagnostics for display.
 * 
 * @param diagnostics - Array of diagnostics to format
 * @returns Formatted string representation
 */
export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'No diagnostics found.';
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = '';
  if (errors.length > 0) {
    output += `Errors (${errors.length}):\n`;
    errors.forEach(d => output += ` - ${d.message}\n`);
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