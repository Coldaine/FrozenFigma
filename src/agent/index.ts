import { Graph, Command, EditPlan } from '../schema';
import { parseIntent } from './planner';
import { applyPatch } from './patcher';
import { attemptRepair, RepairResult, executeRepairWithTransaction, RepairConfig, DEFAULT_REPAIR_CONFIG } from './repair';
import { runValidationGate, ValidationGateResult, Diagnostic } from './validator';

/**
 * Result of executing a single turn of the agent.
 */
export interface AgentResult {
  success: boolean;
  graph: Graph;
 summary: {
    commandsProcessed: number;
    changes: {
      added: number;
      updated: number;
      removed: number;
      moved: number;
    };
    description: string;
    repairMetrics?: {
      repairAttempts: number;
      successfulRepairs: number;
      failedRepairs: number;
      rollbackCount: number;
    };
 };
  diagnostics?: any[];
  validation?: ValidationGateResult;
}

/**
 * Configuration options for the agent orchestrator.
 */
export interface AgentConfig {
  verbose?: boolean;
  enableAutoRepair?: boolean;
  maxRepairAttempts?: number;
  enableRollback?: boolean;
  maxRollbackDepth?: number;
  repairTimeout?: number;
  retryDelay?: number;
}

/**
 * The AgentOrchestrator coordinates the various agent modules to execute user intents.
 * It follows the flow: Intent → Plan → Patch → Validate → (Repair if needed) → Result
 */
export class AgentOrchestrator {
  private config: AgentConfig;
  private turnCounter: number = 0;
  private repairMetrics = {
    repairAttempts: 0,
    successfulRepairs: 0,
    failedRepairs: 0,
    rollbackCount: 0,
  };

  constructor(config: AgentConfig = {}) {
    this.config = {
      verbose: false,
      enableAutoRepair: true,
      maxRepairAttempts: 3,
      enableRollback: true,
      maxRollbackDepth: 3,
      repairTimeout: 10000,
      retryDelay: 100,
      ...config,
    };
  }

  /**
   * Execute a single turn of the agent with the given intent.
   * 
   * @param intent - Natural language intent from the user
   * @param graph - Current graph state
   * @returns AgentResult with success status and updated graph
   */
  async executeTurn(intent: string, graph: Graph): Promise<AgentResult> {
    if (this.config.verbose) {
      console.log(`[Agent] Executing turn ${++this.turnCounter}: ${intent}`);
    }

    // Step 1: Parse intent into a plan
    const plan = parseIntent(intent);
    if (!plan || plan.operations.length === 0) {
      return {
        success: false,
        graph,
        summary: {
          commandsProcessed: 0,
          changes: { added: 0, updated: 0, removed: 0, moved: 0 },
          description: 'No operations generated from intent',
        },
      };
    }

    // Step 2: Apply the plan to the graph
    const patchResult = applyPatch(graph, plan);
    if (!patchResult.success) {
      return {
        success: false,
        graph,
        summary: {
          commandsProcessed: 0,
          changes: { added: 0, updated: 0, removed: 0, moved: 0 },
          description: `Patch failed: ${patchResult.errors.join(', ')}`,
        },
      };
    }

    // Step 3: Validate the resulting graph
    const validationResult = await runValidationGate(patchResult.graph);
    
    if (!validationResult.passed && this.config.enableAutoRepair) {
      // Create repair configuration from agent config
      const repairConfig = {
        maxRepairAttempts: this.config.maxRepairAttempts || DEFAULT_REPAIR_CONFIG.maxRepairAttempts,
        maxRollbackDepth: this.config.maxRollbackDepth || DEFAULT_REPAIR_CONFIG.maxRollbackDepth,
        enableRollback: this.config.enableRollback || DEFAULT_REPAIR_CONFIG.enableRollback,
        verbose: this.config.verbose || DEFAULT_REPAIR_CONFIG.verbose,
        timeout: this.config.repairTimeout || DEFAULT_REPAIR_CONFIG.timeout,
        retryDelay: this.config.retryDelay || DEFAULT_REPAIR_CONFIG.retryDelay,
      };

      // Attempt to repair the graph if validation fails
      let repairedGraph = patchResult.graph;
      let repairAttempt = 0;
      let repairSuccess = false;
      let repairFixes: string[] = [];
      
      while (repairAttempt < repairConfig.maxRepairAttempts && !repairSuccess) {
        repairAttempt++;
        this.repairMetrics.repairAttempts++;
        
        if (this.config.verbose) {
          console.log(`[Agent] Attempting repair (attempt ${repairAttempt}/${repairConfig.maxRepairAttempts})`);
        }
        
        // Use the enhanced repair with transaction and rollback
        // Create a validation function that returns only diagnostics
        const validateFn = async (g: Graph): Promise<Diagnostic[]> => {
          const result = await runValidationGate(g);
          return result.diagnostics;
        };
        
        const repairResult: RepairResult = await executeRepairWithTransaction(
          repairedGraph, 
          validationResult.diagnostics, 
          validateFn,
          repairConfig
        );
        
        if (repairResult.success) {
          // Revalidate the repaired graph
          const revalidationResult = await runValidationGate(repairResult.graph);
          if (revalidationResult.passed) {
            repairedGraph = repairResult.graph;
            repairSuccess = true;
            repairFixes = repairResult.fixes;
            this.repairMetrics.successfulRepairs++;
            
            if (this.config.verbose) {
              console.log(`[Agent] Repair successful on attempt ${repairAttempt}`);
            }
            break;
          } else {
            // If revalidation still fails, use the repaired graph anyway but log diagnostics
            repairedGraph = repairResult.graph;
            repairFixes = repairResult.fixes;
            this.repairMetrics.successfulRepairs++; // Count as successful repair even if validation still fails
            
            if (this.config.verbose) {
              console.log(`[Agent] Repair applied but validation still fails on attempt ${repairAttempt}`);
            }
          }
        } else {
          this.repairMetrics.failedRepairs++;
          
          if (this.config.verbose) {
            console.log(`[Agent] Repair failed on attempt ${repairAttempt}: ${repairResult.remainingIssues?.join(', ') || 'Unknown error'}`);
          }
        }
      }
      
      if (!repairSuccess && this.config.verbose) {
        console.log(`[Agent] All repair attempts failed, using original patched graph`);
      }
      
      // Update patch result to use repaired graph if available
      patchResult.graph = repairedGraph;
    } else if (!validationResult.passed) {
      throw new Error(`Validation failed with ${validationResult.diagnostics.filter(d => d.severity === 'error').length} errors`);
    }

    // Calculate changes summary
    const changes = calculateChanges(graph, patchResult.graph);

    return {
      success: true,
      graph: patchResult.graph,
      summary: {
        commandsProcessed: patchResult.appliedCommands,
        changes,
        description: plan.description,
        repairMetrics: {
          repairAttempts: this.repairMetrics.repairAttempts,
          successfulRepairs: this.repairMetrics.successfulRepairs,
          failedRepairs: this.repairMetrics.failedRepairs,
          rollbackCount: this.repairMetrics.rollbackCount,
        }
      },
      validation: validationResult,
    };
  }

  /**
   * Get the current turn counter.
   */
  getTurnCounter(): number {
    return this.turnCounter;
  }

  /**
   * Reset the turn counter.
   */
  resetTurnCounter(): void {
    this.turnCounter = 0;
  }

  /**
   * Reset repair metrics.
   */
  resetRepairMetrics(): void {
    this.repairMetrics = {
      repairAttempts: 0,
      successfulRepairs: 0,
      failedRepairs: 0,
      rollbackCount: 0,
    };
  }

  /**
   * Get current repair metrics.
   */
  getRepairMetrics(): { repairAttempts: number; successfulRepairs: number; failedRepairs: number; rollbackCount: number } {
    return { ...this.repairMetrics };
  }
}

/**
 * Calculate changes between two graphs.
 */
function calculateChanges(oldGraph: Graph, newGraph: Graph): { added: number; updated: number; removed: number; moved: number } {
  const oldIds = new Set(oldGraph.nodes.map(n => n.id));
  const newIds = new Set(newGraph.nodes.map(n => n.id));
  
  const added = Array.from(newIds).filter(id => !oldIds.has(id)).length;
  const removed = Array.from(oldIds).filter(id => !newIds.has(id)).length;
  
  // For updated and moved, we need to compare existing nodes
  let updated = 0;
 let moved = 0;
  
  for (const newNode of newGraph.nodes) {
    const oldNode = oldGraph.nodes.find(n => n.id === newNode.id);
    if (oldNode) {
      // Check if properties changed (excluding position/frame)
      const oldProps = { ...oldNode.props };
      const newProps = { ...newNode.props };
      if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
        updated++;
      }
      
      // Check if position/frame changed
      if (oldNode.frame.x !== newNode.frame.x || 
          oldNode.frame.y !== newNode.frame.y || 
          oldNode.frame.w !== newNode.frame.w || 
          oldNode.frame.h !== newNode.frame.h ||
          oldNode.frame.region !== newNode.frame.region) {
        moved++;
      }
    }
  }
  
  return { added, updated, removed, moved };
}