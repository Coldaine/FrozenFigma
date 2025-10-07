import { Graph, Command } from '../../schema';
import { ValidationGateResult } from '../validator';
import { RepairResult } from '../repair';
import { PatchResult } from '../patcher';

/**
 * Turn summary contains all information about a single agent turn.
 */
export interface TurnSummary {
  turnId: string;
  timestamp: string;
  success: boolean;
  prompt: string;
  description: string;
  
  // Execution phases
  phases: {
    planning: {
      duration: number;
      commandsGenerated: number;
    };
    patching: {
      duration: number;
      commandsApplied: number;
      errors: string[];
    };
    validation: {
      duration: number;
      passed: boolean;
      diagnosticsCount: number;
    };
    repair?: {
      duration: number;
      attempts: number;
      fixesApplied: number;
    };
  };
  
  // Changes made
  changes: {
    added: number;
    updated: number;
    removed: number;
    moved: number;
  };
  
  // Artifacts
  artifacts: {
    screenshot?: string;
    diff?: string;
    checkpoint?: string;
  };
  
  // Total execution time
  totalDuration: number;
}

/**
 * Emits a structured turn summary (success/fail, changes, diffs, artifacts, timings).
 * 
 * This creates a comprehensive report of what happened during a turn,
 * including all operations, validation results, and timing information.
 * 
 * @param turnId - Unique turn identifier
 * @param prompt - Original user prompt
 * @param planDescription - Description of the EditPlan
 * @param patchResult - Result from the Patcher
 * @param validationResult - Result from the Validator
 * @param repairResult - Result from the Repairer (if repairs were attempted)
 * @param graphBefore - Graph state before changes
 * @param graphAfter - Graph state after changes
 * @param timings - Timing information for each phase
 * 
 * @example
 * const summary = reportTurn(
 *   'turn-123',
 *   'Add a button',
 *   'Add a button to the main region',
 *   patchResult,
 *   validationResult
 * );
 * console.log(formatTurnSummary(summary));
 */
export function reportTurn(
  turnId: string,
  prompt: string,
  planDescription: string,
  patchResult: PatchResult,
  validationResult: ValidationGateResult,
  repairResult: RepairResult | null,
  graphBefore: Graph,
  graphAfter: Graph,
  timings: {
    planning: number;
    patching: number;
    validation: number;
    repair?: number;
  }
): TurnSummary {
  console.log(`[Reporter] Generating turn summary for: ${turnId}`);
  
  // Analyze changes between before and after
  const changes = analyzeChanges(graphBefore, graphAfter);
  
  // Build phase information
  const phases = {
    planning: {
      duration: timings.planning,
      commandsGenerated: patchResult.appliedCommands,
    },
    patching: {
      duration: timings.patching,
      commandsApplied: patchResult.appliedCommands,
      errors: patchResult.errors,
    },
    validation: {
      duration: timings.validation,
      passed: validationResult.passed,
      diagnosticsCount: validationResult.diagnostics.length,
    },
    ...(repairResult ? {
      repair: {
        duration: timings.repair || 0,
        attempts: repairResult.fixes.length,
        fixesApplied: repairResult.fixes.length,
      },
    } : {}),
  };
  
  const totalDuration = 
    timings.planning + 
    timings.patching + 
    timings.validation + 
    (timings.repair || 0);
  
  const success = patchResult.success && validationResult.passed;
  
  const summary: TurnSummary = {
    turnId,
    timestamp: new Date().toISOString(),
    success,
    prompt,
    description: planDescription,
    phases,
    changes,
    artifacts: {
      // Artifacts would be generated here in a real implementation
      diff: generateDiff(graphBefore, graphAfter),
    },
    totalDuration,
  };
  
  console.log(`[Reporter] Turn ${success ? 'SUCCEEDED' : 'FAILED'} in ${totalDuration}ms`);
  console.log(`[Reporter] Changes: +${changes.added} ~${changes.updated} -${changes.removed}`);
  
  return summary;
}

/**
 * Analyze changes between two graph states.
 */
function analyzeChanges(
  before: Graph, 
  after: Graph
): TurnSummary['changes'] {
  const beforeIds = new Set(before.nodes.map(n => n.id));
  const afterIds = new Set(after.nodes.map(n => n.id));
  
  let added = 0;
  let removed = 0;
  let updated = 0;
  let moved = 0;
  
  // Count added nodes
  for (const id of afterIds) {
    if (!beforeIds.has(id)) {
      added++;
    }
  }
  
  // Count removed nodes
  for (const id of beforeIds) {
    if (!afterIds.has(id)) {
      removed++;
    }
  }
  
  // Count updated/moved nodes
  for (const afterNode of after.nodes) {
    const beforeNode = before.nodes.find(n => n.id === afterNode.id);
    
    if (beforeNode) {
      // Check if position changed
      if (
        beforeNode.frame.x !== afterNode.frame.x ||
        beforeNode.frame.y !== afterNode.frame.y
      ) {
        moved++;
      }
      
      // Check if props changed
      if (JSON.stringify(beforeNode.props) !== JSON.stringify(afterNode.props)) {
        updated++;
      }
    }
  }
  
  return { added, updated, removed, moved };
}

/**
 * Generate a simple diff between two graph states.
 */
function generateDiff(before: Graph, after: Graph): string {
  const lines: string[] = [];
  
  lines.push('=== Graph Diff ===');
  lines.push('');
  
  const beforeIds = new Set(before.nodes.map(n => n.id));
  const afterIds = new Set(after.nodes.map(n => n.id));
  
  // Added nodes
  for (const node of after.nodes) {
    if (!beforeIds.has(node.id)) {
      lines.push(`+ Added ${node.type} (${node.id})`);
      lines.push(`  Position: (${node.frame.x}, ${node.frame.y})`);
      lines.push(`  Props: ${JSON.stringify(node.props)}`);
    }
  }
  
  // Removed nodes
  for (const node of before.nodes) {
    if (!afterIds.has(node.id)) {
      lines.push(`- Removed ${node.type} (${node.id})`);
    }
  }
  
  // Modified nodes
  for (const afterNode of after.nodes) {
    const beforeNode = before.nodes.find(n => n.id === afterNode.id);
    
    if (beforeNode) {
      const changes: string[] = [];
      
      // Check position
      if (
        beforeNode.frame.x !== afterNode.frame.x ||
        beforeNode.frame.y !== afterNode.frame.y
      ) {
        changes.push(
          `position: (${beforeNode.frame.x}, ${beforeNode.frame.y}) → (${afterNode.frame.x}, ${afterNode.frame.y})`
        );
      }
      
      // Check props
      if (JSON.stringify(beforeNode.props) !== JSON.stringify(afterNode.props)) {
        changes.push(`props: ${JSON.stringify(beforeNode.props)} → ${JSON.stringify(afterNode.props)}`);
      }
      
      if (changes.length > 0) {
        lines.push(`~ Modified ${afterNode.type} (${afterNode.id})`);
        for (const change of changes) {
          lines.push(`  ${change}`);
        }
      }
    }
  }
  
  if (lines.length === 2) {
    lines.push('No changes detected');
  }
  
  return lines.join('\n');
}

/**
 * Format a turn summary for console output.
 */
export function formatTurnSummary(summary: TurnSummary): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═══════════════════════════════════════════');
  lines.push(`TURN SUMMARY: ${summary.turnId}`);
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`Status: ${summary.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  lines.push(`Prompt: "${summary.prompt}"`);
  lines.push(`Description: ${summary.description}`);
  lines.push(`Timestamp: ${summary.timestamp}`);
  lines.push('');
  
  lines.push('───────────────────────────────────────────');
  lines.push('EXECUTION PHASES');
  lines.push('───────────────────────────────────────────');
  lines.push('');
  
  lines.push(`Planning: ${summary.phases.planning.duration}ms`);
  lines.push(`  Commands generated: ${summary.phases.planning.commandsGenerated}`);
  lines.push('');
  
  lines.push(`Patching: ${summary.phases.patching.duration}ms`);
  lines.push(`  Commands applied: ${summary.phases.patching.commandsApplied}`);
  if (summary.phases.patching.errors.length > 0) {
    lines.push(`  Errors: ${summary.phases.patching.errors.length}`);
    for (const error of summary.phases.patching.errors) {
      lines.push(`    - ${error}`);
    }
  }
  lines.push('');
  
  lines.push(`Validation: ${summary.phases.validation.duration}ms`);
  lines.push(`  Passed: ${summary.phases.validation.passed ? '✅' : '❌'}`);
  lines.push(`  Diagnostics: ${summary.phases.validation.diagnosticsCount}`);
  lines.push('');
  
  if (summary.phases.repair) {
    lines.push(`Repair: ${summary.phases.repair.duration}ms`);
    lines.push(`  Attempts: ${summary.phases.repair.attempts}`);
    lines.push(`  Fixes applied: ${summary.phases.repair.fixesApplied}`);
    lines.push('');
  }
  
  lines.push('───────────────────────────────────────────');
  lines.push('CHANGES');
  lines.push('───────────────────────────────────────────');
  lines.push('');
  lines.push(`Added:   ${summary.changes.added}`);
  lines.push(`Updated: ${summary.changes.updated}`);
  lines.push(`Removed: ${summary.changes.removed}`);
  lines.push(`Moved:   ${summary.changes.moved}`);
  lines.push('');
  
  if (summary.artifacts.diff) {
    lines.push('───────────────────────────────────────────');
    lines.push('DIFF');
    lines.push('───────────────────────────────────────────');
    lines.push('');
    lines.push(summary.artifacts.diff);
    lines.push('');
  }
  
  lines.push('───────────────────────────────────────────');
  lines.push(`TOTAL DURATION: ${summary.totalDuration}ms`);
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format a concise summary for inline display.
 */
export function formatCompactSummary(summary: TurnSummary): string {
  const status = summary.success ? '✅' : '❌';
  const changes = `+${summary.changes.added} ~${summary.changes.updated} -${summary.changes.removed}`;
  return `${status} Turn ${summary.turnId}: ${summary.description} (${changes}, ${summary.totalDuration}ms)`;
}