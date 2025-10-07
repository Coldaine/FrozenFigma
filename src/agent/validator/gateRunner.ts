import { Graph } from '../../schema';
import { Diagnostic, ValidationGateResult } from '.';
import { runLint } from './lint';
import { runTypeCheck } from './types';
import { runUnitTests } from './unit';
import { runSmokeTests } from './smoke';

/**
 * Options for running validation gates.
 */
export interface GateRunnerOptions {
  /** Run only specific gates */
  gates?: ('schema' | 'lint' | 'types' | 'unit' | 'smoke')[];
  /** Whether to continue running gates after a failure */
  continueOnError?: boolean;
  /** Whether to run in verbose mode */
  verbose?: boolean;
}

/**
 * Run all validation gates in sequence and aggregate results.
 * 
 * @param graph - Graph to validate
 * @param options - Gate runner options
 * @returns Aggregated validation results
 */
export async function runValidationGates(graph: Graph, options: GateRunnerOptions = {}): Promise<ValidationGateResult> {
  const startTime = Date.now();
  const diagnostics: Diagnostic[] = [];
  
  const gateResults = {
    schema: false,
    lint: false,
    types: false,
    unit: false,
    smoke: false,
  };

  const { gates, continueOnError = false, verbose = false } = options;
  
  if (verbose) console.log('[GateRunner] Starting validation gates...');

  // Define the gates to run
  const allGates = [
    { name: 'schema' as const, run: () => runSchemaValidation(graph) },
    { name: 'lint' as const, run: () => runLint(graph) },
    { name: 'types' as const, run: () => runTypeCheck(graph) },
    { name: 'unit' as const, run: () => runUnitTests(graph) },
    { name: 'smoke' as const, run: () => runSmokeTests(graph) },
  ];

  // Filter gates based on options
  const gatesToRun = gates 
    ? allGates.filter(g => gates.includes(g.name))
    : allGates;

  // Run each gate in sequence
  for (const gate of gatesToRun) {
    if (verbose) console.log(`[GateRunner] Running ${gate.name} gate...`);
    
    try {
      const result = await gate.run();
      
      // Update gate result
      gateResults[gate.name] = result.passed;
      
      // Add diagnostics
      diagnostics.push(...result.diagnostics);
      
      if (verbose) {
        const status = result.passed ? 'PASSED' : 'FAILED';
        console.log(`[GateRunner] ${gate.name} gate ${status} (${result.diagnostics.length} diagnostics)`);
      }
      
      // If gate failed and continueOnError is false, stop execution
      if (!result.passed && !continueOnError) {
        if (verbose) console.log(`[GateRunner] ${gate.name} gate failed, stopping execution`);
        break;
      }
    } catch (error) {
      const errorMessage = `Gate ${gate.name} failed with error: ${(error as Error).message}`;
      diagnostics.push({
        gate: gate.name,
        severity: 'error',
        message: errorMessage,
      });
      
      gateResults[gate.name] = false;
      
      if (verbose) console.log(`[GateRunner] ${errorMessage}`);
      
      // If gate failed and continueOnError is false, stop execution
      if (!continueOnError) {
        if (verbose) console.log(`[GateRunner] ${gate.name} gate failed with exception, stopping execution`);
        break;
      }
    }
  }

  const executionTime = Date.now() - startTime;
  
  // Overall result passes only if all enabled gates pass
  const enabledGateResults = gates ? 
    Object.entries(gateResults).filter(([name]) => gates.includes(name as any)) :
    Object.entries(gateResults);
    
  const passed = enabledGateResults.every(([, result]) => result);

  if (verbose) {
    console.log(`[GateRunner] All gates completed in ${executionTime}ms`);
    console.log(`[GateRunner] Overall result: ${passed ? 'PASSED' : 'FAILED'}`);
  }

 return {
    passed,
    diagnostics,
    gateResults,
    executionTime,
  };
}

/**
 * Run only the schema validation gate.
 * This is a special case since it's done in the main validator file.
 */
function runSchemaValidation(graph: Graph): { passed: boolean; diagnostics: Diagnostic[] } {
  // This is a simplified version - in the actual implementation, 
  // schema validation would be done in the main validator
  const diagnostics: Diagnostic[] = [];
  
  // Basic schema validation - check if nodes array exists
  if (!Array.isArray(graph.nodes)) {
    diagnostics.push({
      gate: 'schema',
      severity: 'error',
      message: 'Graph nodes must be an array',
    });
 }
  
  // Check that all nodes are valid components
  for (const node of graph.nodes) {
    if (!node.id || !node.type || !node.frame) {
      diagnostics.push({
        gate: 'schema',
        severity: 'error',
        message: `Invalid component in graph: ${JSON.stringify(node)}`,
      });
    }
 }

  return {
    passed: diagnostics.filter(d => d.severity === 'error').length === 0,
    diagnostics,
  };
}

/**
 * Run a single validation gate by name.
 * 
 * @param gateName - Name of the gate to run
 * @param graph - Graph to validate
 * @returns Gate result
 */
export async function runSingleGate(
  gateName: 'schema' | 'lint' | 'types' | 'unit' | 'smoke',
  graph: Graph
): Promise<{ passed: boolean; diagnostics: Diagnostic[] }> {
  switch (gateName) {
    case 'schema':
      return runSchemaValidation(graph);
    case 'lint':
      return runLint(graph);
    case 'types':
      return runTypeCheck(graph);
    case 'unit':
      return runUnitTests(graph);
    case 'smoke':
      return runSmokeTests(graph);
    default:
      throw new Error(`Unknown gate: ${gateName}`);
  }
}

/**
 * Get a summary of validation gate results.
 * 
 * @param result - Validation gate result
 * @returns Summary string
 */
export function getGateSummary(result: ValidationGateResult): string {
  const { gateResults, diagnostics, executionTime } = result;
  
  let summary = `Validation Summary:\n`;
  summary += `  Schema: ${gateResults.schema ? 'PASS' : 'FAIL'}\n`;
  summary += `  Lint: ${gateResults.lint ? 'PASS' : 'FAIL'}\n`;
  summary += `  Types: ${gateResults.types ? 'PASS' : 'FAIL'}\n`;
  summary += `  Unit: ${gateResults.unit ? 'PASS' : 'FAIL'}\n`;
  summary += `  Smoke: ${gateResults.smoke ? 'PASS' : 'FAIL'}\n`;
  summary += `  Total Diagnostics: ${diagnostics.length}\n`;
  summary += `  Execution Time: ${executionTime}ms\n`;
  summary += `  Overall: ${result.passed ? 'PASS' : 'FAIL'}`;
  
  return summary;
}

/**
 * Format validation gate results for display.
 * 
 * @param result - Validation gate result
 * @returns Formatted string
 */
export function formatGateResults(result: ValidationGateResult): string {
  const { diagnostics, executionTime } = result;
  
  if (diagnostics.length === 0) {
    return `All validation gates passed in ${executionTime}ms!`;
  }
  
  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos = diagnostics.filter(d => d.severity === 'info');
  
  let output = `Validation completed in ${executionTime}ms\n\n`;
  
  if (errors.length > 0) {
    output += `Errors (${errors.length}):\n`;
    errors.forEach(d => output += ` [${d.gate}] ${d.message}\n`);
    output += '\n';
  }
  
  if (warnings.length > 0) {
    output += `Warnings (${warnings.length}):\n`;
    warnings.forEach(d => output += ` [${d.gate}] ${d.message}\n`);
    output += '\n';
  }
  
  if (infos.length > 0) {
    output += `Info (${infos.length}):\n`;
    infos.forEach(d => output += ` [${d.gate}] ${d.message}\n`);
    output += '\n';
  }
  
  output += getGateSummary(result);
  
  return output;
}

/**
 * Run validation gates with detailed reporting.
 * 
 * @param graph - Graph to validate
 * @param options - Gate runner options
 * @returns Detailed validation report
 */
export async function runValidationWithReport(graph: Graph, options: GateRunnerOptions = {}): Promise<{
  result: ValidationGateResult;
  report: string;
}> {
  const result = await runValidationGates(graph, options);
  const report = formatGateResults(result);
  
  return { result, report };
}

/**
 * Run validation gates and return only pass/fail status.
 * 
 * @param graph - Graph to validate
 * @param gates - Optional list of gates to run (runs all if not specified)
 * @returns True if all gates pass, false otherwise
 */
export async function validateGraph(graph: Graph, gates?: ('schema' | 'lint' | 'types' | 'unit' | 'smoke')[]): Promise<boolean> {
  const result = await runValidationGates(graph, { gates });
  return result.passed;
}