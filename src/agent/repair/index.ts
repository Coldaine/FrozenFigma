import { Graph, ComponentSpec } from '../../schema';
import { Diagnostic } from '../validator';

/**
 * Repair attempt result.
 * Contains information about the success of a repair operation and any fixes applied.
 */
export interface RepairResult {
  /** Whether the repair was successful in fixing all critical errors */
  success: boolean;
  /** The repaired graph with fixes applied */
  graph: Graph;
 /** List of fixes that were applied during the repair */
  fixes: string[];
 /** Any remaining issues after the repair attempt */
  remainingIssues: Diagnostic[];
}

/**
 * Classification of errors by type for targeted repair strategies.
 * Different error types require different approaches to fix them effectively.
 */
export enum ErrorType {
  /** Duplicate component IDs that need to be regenerated */
  DuplicateId = 'duplicate_id',
  /** Invalid child references pointing to non-existent components */
  InvalidReference = 'invalid_reference',
  /** Coordinates that are outside acceptable bounds */
  OutOfBounds = 'out_of_bounds',
  /** Schema violations that break the graph structure */
  SchemaViolation = 'schema_violation',
  /** Missing dependencies required by components */
  MissingDependency = 'missing_dependency',
 /** Circular references that create infinite loops */
  CircularReference = 'circular_reference',
  /** Type mismatches in component properties */
  TypeMismatch = 'type_mismatch',
  /** Unknown error type that doesn't fit other categories */
  Unknown = 'unknown'
}

/**
 * Enhanced diagnostic with classification.
 * Extends the base Diagnostic interface with additional classification information
 * to enable targeted repair strategies.
 */
export interface ClassifiedDiagnostic extends Diagnostic {
  /** The specific type of error for targeted repair */
  type: ErrorType;
  /** Additional context information for the diagnostic */
  context?: Record<string, unknown>;
}

/**
 * Repair strategy interface for different types of repairs.
 * Defines how to detect and fix specific types of errors in the graph.
 */
export interface RepairStrategy {
  /** Unique name for the repair strategy */
  name: string;
  /** List of error types that this strategy can handle */
  appliesTo: ErrorType[];
  /** Determines if this strategy can repair the given diagnostic */
  canRepair: (diagnostic: ClassifiedDiagnostic) => boolean;
 /** Executes the repair and returns the result */
  execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => { success: boolean; graph: Graph; description: string };
}

/**
 * Transaction interface for atomic operations.
 * Ensures that graph modifications happen as a single unit that can be rolled back if needed.
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Timestamp when the transaction was created */
  timestamp: number;
  /** The original graph state before the transaction */
  originalGraph: Graph;
  /** List of operations performed in this transaction */
  operations: string[];
  /** Checkpoints created during this transaction */
  checkpoints: Checkpoint[];
  /** Whether the transaction has been completed */
  completed: boolean;
 /** Whether a rollback has been applied to this transaction */
  rollbackApplied: boolean;
}

/**
 * Checkpoint for rollback mechanism.
 * Captures the state of the graph at a specific point in time for potential rollback.
 */
export interface Checkpoint {
  /** Unique identifier for the checkpoint */
  id: string;
  /** Timestamp when the checkpoint was created */
  timestamp: number;
  /** The graph state at the time of checkpoint creation */
  graph: Graph;
  /** Description of the state captured in this checkpoint */
  description: string;
  /** Additional metadata associated with this checkpoint */
  metadata: Record<string, unknown>;
}

/**
 * Rollback result.
 * Contains information about the success of a rollback operation.
 */
export interface RollbackResult {
  /** Whether the rollback was successful */
  success: boolean;
  /** The graph state after rollback */
  graph: Graph;
 /** List of fixes applied during the rollback process */
  appliedFixes: string[];
  /** Any remaining issues after the rollback */
  remainingIssues: Diagnostic[];
  /** Number of rollback steps that were applied */
  rollbackSteps: number;
}

/**
 * Enhanced repair configuration.
 * Controls the behavior of the repair system including attempt limits, rollback settings, etc.
 */
export interface RepairConfig {
  /** Maximum number of repair attempts before giving up */
  maxRepairAttempts: number;
  /** Maximum depth of rollback history to maintain */
  maxRollbackDepth: number;
  /** Whether rollback functionality is enabled */
  enableRollback: boolean;
 /** Whether to output verbose logging information */
  verbose: boolean;
  /** Timeout in milliseconds for repair operations */
  timeout: number;
  /** Delay in milliseconds between repair attempts */
  retryDelay: number;
}

/**
 * Default repair configuration.
 * Provides sensible defaults for the repair system settings.
 */
export const DEFAULT_REPAIR_CONFIG: RepairConfig = {
  maxRepairAttempts: 5,
  maxRollbackDepth: 3,
  enableRollback: true,
  verbose: false,
  timeout: 10000,
  retryDelay: 100,
};

/**
 * Repair strategy library with various repair strategies.
 * Manages a collection of repair strategies that can be applied to fix different types of errors.
 * Each strategy knows how to handle specific error types and applies targeted fixes.
 */
class RepairStrategyLibrary {
  private strategies: RepairStrategy[] = [];

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default repair strategies.
   * Sets up the standard set of repair strategies that handle common error types.
   */
  private initializeDefaultStrategies(): void {
    // Duplicate ID repair strategy
    this.addStrategy({
      name: 'duplicate-id-repair',
      appliesTo: [ErrorType.DuplicateId],
      canRepair: (diagnostic: ClassifiedDiagnostic) => 
        diagnostic.type === ErrorType.DuplicateId,
      execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => {
        const modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
        
        const match = diagnostic.message.match(/Duplicate component ID: (.+)/);
        if (match) {
          const duplicateId = match[1];
          
          // Find all nodes with this ID
          const duplicates = modifiedGraph.nodes.filter((n: ComponentSpec) => n.id === duplicateId);
          
          if (duplicates.length > 1) {
            // Keep the first one, regenerate IDs for the rest
            for (let i = 1; i < duplicates.length; i++) {
              const newId = crypto.randomUUID();
              const index = modifiedGraph.nodes.findIndex((n: ComponentSpec) => 
                n === duplicates[i]
              );
              
              if (index !== -1) {
                modifiedGraph.nodes[index].id = newId;
                
                // Update any references to this ID
                for (const node of modifiedGraph.nodes) {
                  if (node.children) {
                    const childIndex = node.children.indexOf(duplicateId);
                    if (childIndex !== -1 && node !== modifiedGraph.nodes[index]) {
                      node.children[childIndex] = newId;
                    }
                  }
                }
              }
            }
            
            return {
              success: true,
              graph: modifiedGraph,
              description: `Fixed duplicate ID: ${duplicateId} (regenerated ${duplicates.length - 1} ID(s))`,
            };
          }
        }
        
        return {
          success: false,
          graph: modifiedGraph,
          description: `Could not fix duplicate ID: ${diagnostic.message}`,
        };
      },
    });

    // Invalid reference repair strategy
    this.addStrategy({
      name: 'invalid-reference-repair',
      appliesTo: [ErrorType.InvalidReference],
      canRepair: (diagnostic: ClassifiedDiagnostic) => 
        diagnostic.type === ErrorType.InvalidReference,
      execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => {
        const modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
        
        const match = diagnostic.message.match(/Invalid child reference in (.+): (.+) does not exist/);
        if (match) {
          const parentId = match[1];
          const childId = match[2];
          
          const parent = modifiedGraph.nodes.find((n: ComponentSpec) => n.id === parentId);
          if (parent && parent.children) {
            // Remove the invalid child reference
            parent.children = parent.children.filter((id: string) => id !== childId);
            
            return {
              success: true,
              graph: modifiedGraph,
              description: `Removed invalid child reference: ${childId} from ${parentId}`,
            };
          }
        }
        
        return {
          success: false,
          graph: modifiedGraph,
          description: `Could not fix invalid reference: ${diagnostic.message}`,
        };
      },
    });

    // Out of bounds coordinate repair strategy
    this.addStrategy({
      name: 'out-of-bounds-repair',
      appliesTo: [ErrorType.OutOfBounds],
      canRepair: (diagnostic: ClassifiedDiagnostic) => 
        diagnostic.type === ErrorType.OutOfBounds,
      execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => {
        const modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
        
        const match = diagnostic.message.match(/Component (.+) has (x|y) coordinate out of bounds: (.+)/);
        if (match) {
          const componentId = match[1];
          const coordinate = match[2];
          const value = parseFloat(match[3]);
          
          const node = modifiedGraph.nodes.find((n: ComponentSpec) => n.id === componentId);
          if (node) {
            // Clamp to reasonable bounds
            const clampedValue = Math.max(-1000, Math.min(1000, value));
            node.frame[coordinate] = clampedValue;
            
            return {
              success: true,
              graph: modifiedGraph,
              description: `Clamped ${coordinate} coordinate of ${componentId} from ${value} to ${clampedValue}`,
            };
          }
        }
        
        return {
          success: false,
          graph: modifiedGraph,
          description: `Could not fix out of bounds coordinate: ${diagnostic.message}`,
        };
      },
    });

    // Schema validation repair strategy
    this.addStrategy({
      name: 'schema-validation-repair',
      appliesTo: [ErrorType.SchemaViolation],
      canRepair: (diagnostic: ClassifiedDiagnostic) => 
        diagnostic.type === ErrorType.SchemaViolation,
      execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => {
        const modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
        
        // If the path points to a specific node, try removing it
        if (diagnostic.message.includes('nodes.')) {
          const path = diagnostic.message.split(':')[0].trim();
          const nodeIndexMatch = path.match(/nodes\\.(\d+)/);
          if (nodeIndexMatch) {
            const nodeIndex = parseInt(nodeIndexMatch[1], 10);
            
            if (nodeIndex >= 0 && nodeIndex < modifiedGraph.nodes.length) {
              const removedNode = modifiedGraph.nodes[nodeIndex];
              modifiedGraph.nodes.splice(nodeIndex, 1);
              
              return {
                success: true,
                graph: modifiedGraph,
                description: `Removed invalid node at index ${nodeIndex} (ID: ${removedNode.id})`,
              };
            }
          }
        }
        
        return {
          success: false,
          graph: modifiedGraph,
          description: `Could not fix schema violation: ${diagnostic.message}`,
        };
      },
    });

    // Missing dependency repair strategy
    this.addStrategy({
      name: 'missing-dependency-repair',
      appliesTo: [ErrorType.MissingDependency],
      canRepair: (diagnostic: ClassifiedDiagnostic) => 
        diagnostic.type === ErrorType.MissingDependency,
      execute: (graph: Graph, diagnostic: ClassifiedDiagnostic) => {
        const modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
        
        // For missing dependencies, try to create a placeholder component
        const match = diagnostic.message.match(/Missing dependency: (.+) for component (.+)/);
        if (match) {
          const dependencyId = match[1];
          
          // Create a placeholder component
          const placeholder = {
            id: dependencyId,
            type: 'placeholder',
            props: { text: 'Missing Component', width: 100, height: 50 },
            frame: { x: 0, y: 0, w: 100, h: 50, region: 'main' },
            children: [],
          };
          
          modifiedGraph.nodes.push(placeholder);
          
          return {
            success: true,
            graph: modifiedGraph,
            description: `Created placeholder for missing dependency: ${dependencyId}`,
          };
        }
        
        return {
          success: false,
          graph: modifiedGraph,
          description: `Could not fix missing dependency: ${diagnostic.message}`,
        };
      },
    });
 }

 /**
   * Add a repair strategy to the library.
   * Allows custom repair strategies to be registered and used by the repair system.
   * 
   * @param strategy - The repair strategy to add
   */
  addStrategy(strategy: RepairStrategy): void {
    this.strategies.push(strategy);
  }

 /**
   * Get a repair strategy by name.
   * Useful for accessing specific strategies for custom operations.
   * 
   * @param name - The name of the strategy to retrieve
   * @returns The repair strategy if found, undefined otherwise
   */
  getStrategy(name: string): RepairStrategy | undefined {
    return this.strategies.find(s => s.name === name);
  }

  /**
   * Get applicable repair strategies for a diagnostic.
   * Finds all strategies that can potentially fix the given diagnostic.
   * 
   * @param diagnostic - The diagnostic to find strategies for
   * @returns Array of applicable repair strategies
   */
  getApplicableStrategies(diagnostic: ClassifiedDiagnostic): RepairStrategy[] {
    return this.strategies.filter(strategy => 
      strategy.canRepair(diagnostic)
    );
  }

 /**
   * Execute a repair using the most appropriate strategy.
   * Tries to apply the best available strategy to fix the given diagnostic.
   * 
   * @param graph - The graph to repair
   * @param diagnostic - The diagnostic to fix
   * @returns The result of the repair attempt
   */
  executeRepair(graph: Graph, diagnostic: ClassifiedDiagnostic): { success: boolean; graph: Graph; description: string } {
    const applicableStrategies = this.getApplicableStrategies(diagnostic);
    
    for (const strategy of applicableStrategies) {
      const result = strategy.execute(graph, diagnostic);
      if (result.success) {
        return result;
      }
    }
    
    // If no strategy worked, return failure
    return {
      success: false,
      graph: JSON.parse(JSON.stringify(graph)), // Deep clone
      description: `No repair strategy could fix: ${diagnostic.message}`,
    };
  }
}

/**
 * Error classifier to categorize diagnostics.
 * Analyzes diagnostic messages and assigns them to appropriate error types
 * to enable targeted repair strategies.
 */
class ErrorClassifier {
  /**
   * Classify a diagnostic based on its message and other properties.
   * Determines the specific type of error to enable appropriate repair strategies.
   * 
   * @param diagnostic - The diagnostic to classify
   * @returns The classified diagnostic with error type information
   */
  classifyDiagnostic(diagnostic: Diagnostic): ClassifiedDiagnostic {
    const classifiedDiagnostic = { ...diagnostic } as ClassifiedDiagnostic;
    
    // Classify by message content
    if (diagnostic.message.includes('Duplicate component ID')) {
      classifiedDiagnostic.type = ErrorType.DuplicateId;
    } else if (diagnostic.message.includes('Invalid child reference')) {
      classifiedDiagnostic.type = ErrorType.InvalidReference;
    } else if (diagnostic.message.includes('coordinate out of bounds')) {
      classifiedDiagnostic.type = ErrorType.OutOfBounds;
    } else if (diagnostic.message.includes('Missing dependency')) {
      classifiedDiagnostic.type = ErrorType.MissingDependency;
    } else if (diagnostic.message.includes('Circular reference')) {
      classifiedDiagnostic.type = ErrorType.CircularReference;
    } else if (diagnostic.message.includes('Type mismatch')) {
      classifiedDiagnostic.type = ErrorType.TypeMismatch;
    } else {
      classifiedDiagnostic.type = ErrorType.Unknown;
    }
    
    return classifiedDiagnostic;
  }

  /**
   * Classify an array of diagnostics.
   * Processes multiple diagnostics and returns them with classification information.
   * 
   * @param diagnostics - Array of diagnostics to classify
   * @returns Array of classified diagnostics
   */
  classifyDiagnostics(diagnostics: Diagnostic[]): ClassifiedDiagnostic[] {
    return diagnostics.map(d => this.classifyDiagnostic(d));
  }
}

/**
 * Transaction manager for atomic operations and rollback.
 * Manages the creation and restoration of checkpoints to enable rollback functionality.
 * Ensures that graph operations can be undone if needed.
 */
export class TransactionManager {
  private transactions: Transaction[] = [];
  private checkpoints: Checkpoint[] = [];
  private config: RepairConfig;

  constructor(config: RepairConfig) {
    this.config = config;
  }

  /**
   * Create a new transaction with initial graph state.
   * Starts a new transaction that can contain multiple operations and checkpoints.
   * 
   * @param graph - The initial graph state for the transaction
   * @param description - Description of the transaction
   * @returns The created transaction object
   */
  createTransaction(graph: Graph, description: string): Transaction {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      originalGraph: JSON.parse(JSON.stringify(graph)),
      operations: [description],
      checkpoints: [],
      completed: false,
      rollbackApplied: false,
    };

    this.transactions.push(transaction);
    
    // Create initial checkpoint
    this.createCheckpoint(graph, `Initial state for transaction ${transaction.id}`, { transactionId: transaction.id });
    
    return transaction;
  }

  /**
   * Create a checkpoint of the current graph state.
   * Captures the current state of the graph for potential rollback.
   * 
   * @param graph - The graph state to capture
   * @param description - Description of this checkpoint
   * @param metadata - Additional metadata to associate with the checkpoint
   * @returns The created checkpoint
   */
  createCheckpoint(graph: Graph, description: string, metadata: Record<string, unknown> = {}): Checkpoint {
    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      graph: JSON.parse(JSON.stringify(graph)),
      description,
      metadata,
    };

    // Add to the most recent transaction if available
    if (this.transactions.length > 0) {
      const lastTransaction = this.transactions[this.transactions.length - 1];
      lastTransaction.checkpoints.push(checkpoint);
      
      // Limit checkpoints to max rollback depth
      if (lastTransaction.checkpoints.length > this.config.maxRollbackDepth) {
        lastTransaction.checkpoints.shift(); // Remove oldest checkpoint
      }
    }
    
    this.checkpoints.push(checkpoint);
    
    // Limit total checkpoints to prevent memory issues
    if (this.checkpoints.length > this.config.maxRollbackDepth * 2) {
      this.checkpoints.shift(); // Remove oldest checkpoint
    }
    
    if (this.config.verbose) {
      console.log(`[TransactionManager] Created checkpoint: ${checkpoint.id} - ${description}`);
    }
    
    return checkpoint;
  }

  /**
   * Perform a rollback to the specified checkpoint.
   * Restores the graph to the state captured in the specified checkpoint.
   * 
   * @param checkpointId - ID of the checkpoint to rollback to
   * @param graph - Current graph state (used as fallback if checkpoint not found)
   * @returns Result of the rollback operation
   */
  rollbackToCheckpoint(checkpointId: string, graph: Graph): RollbackResult {
    const checkpoint = this.checkpoints.find(c => c.id === checkpointId);
    
    if (!checkpoint) {
      return {
        success: false,
        graph,
        appliedFixes: [`Checkpoint ${checkpointId} not found`],
        remainingIssues: [],
        rollbackSteps: 0,
      };
    }
    
    if (this.config.verbose) {
      console.log(`[TransactionManager] Rolling back to checkpoint: ${checkpointId}`);
    }
    
    return {
      success: true,
      graph: JSON.parse(JSON.stringify(checkpoint.graph)),
      appliedFixes: [`Rolled back to checkpoint: ${checkpoint.description}`],
      remainingIssues: [],
      rollbackSteps: 1,
    };
  }

  /**
   * Perform a rollback to the last checkpoint.
   * Restores the graph to the most recently created checkpoint.
   * 
   * @param graph - Current graph state (used as fallback if no checkpoints exist)
   * @returns Result of the rollback operation
   */
  rollbackLast(graph: Graph): RollbackResult {
    if (this.checkpoints.length === 0) {
      return {
        success: false,
        graph,
        appliedFixes: ['No checkpoints available for rollback'],
        remainingIssues: [],
        rollbackSteps: 0,
      };
    }
    
    const lastCheckpoint = this.checkpoints[this.checkpoints.length - 1];
    return this.rollbackToCheckpoint(lastCheckpoint.id, graph);
  }

  /**
   * Complete a transaction.
   * Marks a transaction as completed, indicating that all operations in it are finished.
   * 
   * @param transactionId - ID of the transaction to complete
   * @returns Whether the transaction was successfully completed
   */
  completeTransaction(transactionId: string): boolean {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (transaction) {
      transaction.completed = true;
      return true;
    }
    return false;
  }

  /**
   * Get all active transactions.
   * Returns transactions that have not yet been completed.
   * 
   * @returns Array of active transactions
   */
  getActiveTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.completed);
  }

  /**
   * Get recent checkpoints.
   * Returns the most recently created checkpoints.
   * 
   * @param count - Number of recent checkpoints to return (default: 5)
   * @returns Array of recent checkpoints
   */
  getRecentCheckpoints(count: number = 5): Checkpoint[] {
    return this.checkpoints.slice(-count);
  }
}

/**
 * Enhanced repairer with sophisticated error detection and recovery.
 * The core repair engine that coordinates all repair activities including
 * error classification, strategy selection, and transaction management.
 */
class EnhancedRepairer {
  private strategyLibrary: RepairStrategyLibrary;
  private errorClassifier: ErrorClassifier;
  private transactionManager: TransactionManager;
  private config: RepairConfig;

  constructor(config: RepairConfig = DEFAULT_REPAIR_CONFIG) {
    this.config = config;
    this.strategyLibrary = new RepairStrategyLibrary();
    this.errorClassifier = new ErrorClassifier();
    this.transactionManager = new TransactionManager(this.config);
  }

  /**
   * Register a custom repair strategy.
   * Allows additional repair strategies to be added to the system beyond the defaults.
   * 
   * @param strategy - The repair strategy to register
   */
  registerRepairStrategy(strategy: RepairStrategy): void {
    this.strategyLibrary.addStrategy(strategy);
  }

  /**
   * Attempt to repair a graph based on diagnostics.
   * Performs a single repair attempt to fix errors in the graph.
   * 
   * @param graph - The graph to repair
   * @param diagnostics - Diagnostics identifying issues to fix
   * @returns Result of the repair attempt
   */
  attemptRepair(graph: Graph, diagnostics: Diagnostic[]): RepairResult {
    if (this.config.verbose) {
      console.log(`[EnhancedRepairer] Attempting to repair ${diagnostics.length} diagnostics`);
    }

    // Classify diagnostics
    const classifiedDiagnostics = this.errorClassifier.classifyDiagnostics(diagnostics);
    
    // Create a transaction for this repair operation
    const transaction = this.transactionManager.createTransaction(graph, 'Repair attempt');
    
    let modifiedGraph = JSON.parse(JSON.stringify(graph)); // Deep clone
    const fixes: string[] = [];
    const remainingIssues: Diagnostic[] = [];
    
    // Filter for errors only (warnings don't need fixing)
    const errors = classifiedDiagnostics.filter(d => 
      d.severity === 'error'
    );
    
    if (errors.length === 0) {
      if (this.config.verbose) {
        console.log('[EnhancedRepairer] No errors to fix (only warnings/info)');
      }
      return {
        success: true,
        graph: modifiedGraph,
        fixes: ['No repairs needed'],
        remainingIssues: diagnostics.filter(d => d.severity !== 'error'),
      };
    }
    
    // Sort errors by type for prioritization
    const sortedErrors = [...errors].sort((a, b) => {
      if (a.type === ErrorType.DuplicateId) return -1;
      if (b.type === ErrorType.DuplicateId) return 1;
      if (a.type === ErrorType.InvalidReference) return -1;
      if (b.type === ErrorType.InvalidReference) return 1;
      return 0;
    });
    
    // Attempt to fix each error
    for (const diagnostic of sortedErrors) {
      if (this.config.verbose) {
        console.log(`[EnhancedRepairer] Attempting to fix: ${diagnostic.message} (Type: ${diagnostic.type})`);
      }
      
      const fix = this.strategyLibrary.executeRepair(modifiedGraph, diagnostic);
      
      if (fix.success) {
        modifiedGraph = fix.graph;
        fixes.push(fix.description);
        if (this.config.verbose) {
          console.log(`[EnhancedRepairer] ✅ Fixed: ${fix.description}`);
        }
      } else {
        remainingIssues.push(diagnostic as Diagnostic); // Cast back to original type
        if (this.config.verbose) {
          console.log(`[EnhancedRepairer] ❌ Could not fix: ${diagnostic.message}`);
        }
      }
    }
    
    // Add warnings/info to remaining issues
    remainingIssues.push(...diagnostics.filter(d => d.severity !== 'error'));
    
    const success = errors.every(e => 
      fixes.some(f => f.includes(e.message.substring(0, 30)))
    );
    
    if (this.config.verbose) {
      console.log(`[EnhancedRepairer] Result: ${success ? 'SUCCESS' : 'PARTIAL'}`);
      console.log(`[EnhancedRepairer] Applied ${fixes.length} fixes`);
      console.log(`[EnhancedRepairer] Remaining issues: ${remainingIssues.filter(i => 
        i.severity === 'error'
      ).length} errors`);
    }
    
    // Complete the transaction
    this.transactionManager.completeTransaction(transaction.id);
    
    return {
      success,
      graph: modifiedGraph,
      fixes,
      remainingIssues,
    };
  }

  /**
   * Enhanced repair loop with multiple attempts and validation.
   * Performs multiple repair attempts, revalidating after each attempt until
   * all errors are fixed or max attempts are reached.
   * 
   * @param graph - The graph to repair
   * @param diagnostics - Initial diagnostics identifying issues
   * @param validate - Function to validate the graph after repairs
   * @param maxAttempts - Maximum number of repair attempts (default: config value)
   * @returns Result of the repair loop
   */
  repairLoop(
    graph: Graph,
    diagnostics: Diagnostic[],
    validate: (g: Graph) => Diagnostic[],
    maxAttempts: number = this.config.maxRepairAttempts
  ): RepairResult {
    if (this.config.verbose) {
      console.log(`[EnhancedRepairer] Starting repair loop (max ${maxAttempts} attempts)`);
    }
    
    // Create a transaction for the entire repair loop
    const transaction = this.transactionManager.createTransaction(graph, 'Repair loop');
    
    let currentGraph = graph;
    let currentDiagnostics = diagnostics;
    let attempt = 0;
    const allFixes: string[] = [];
    
    while (attempt < maxAttempts) {
      attempt++;
      if (this.config.verbose) {
        console.log(`[EnhancedRepairer] Repair attempt ${attempt}/${maxAttempts}`);
      }
      
      // Create a checkpoint before each attempt
      this.transactionManager.createCheckpoint(currentGraph, `Before repair attempt ${attempt}`, {
        attempt: attempt,
        transactionId: transaction.id
      });
      
      const result = this.attemptRepair(currentGraph, currentDiagnostics);
      allFixes.push(...result.fixes);
      
      if (result.success) {
        if (this.config.verbose) {
          console.log(`[EnhancedRepairer] All errors fixed after ${attempt} attempt(s)`);
        }
        
        // Complete the transaction
        this.transactionManager.completeTransaction(transaction.id);
        
        return {
          success: true,
          graph: result.graph,
          fixes: allFixes,
          remainingIssues: result.remainingIssues,
        };
      }
      
      // Re-validate to get updated diagnostics
      currentGraph = result.graph;
      currentDiagnostics = validate(currentGraph);
      
      // If no errors remain, we're done
      const errors = currentDiagnostics.filter(d => 
        d.severity === 'error'
      );
      if (errors.length === 0) {
        if (this.config.verbose) {
          console.log(`[EnhancedRepairer] All errors fixed after ${attempt} attempt(s)`);
        }
        
        // Complete the transaction
        this.transactionManager.completeTransaction(transaction.id);
        
        return {
          success: true,
          graph: currentGraph,
          fixes: allFixes,
          remainingIssues: currentDiagnostics,
        };
      }
      
      if (this.config.verbose) {
        console.log(`[EnhancedRepairer] ${errors.length} error(s) remaining after attempt ${attempt}`);
      }
    }
    
    if (this.config.verbose) {
      console.log(`[EnhancedRepairer] Max attempts reached. ${currentDiagnostics.filter(d => 
        d.severity === 'error'
      ).length} error(s) could not be fixed`);
    }
    
    // Complete the transaction
    this.transactionManager.completeTransaction(transaction.id);
    
    return {
      success: false,
      graph: currentGraph,
      fixes: allFixes,
      remainingIssues: currentDiagnostics,
    };
  }

  /**
   * Perform a rollback operation.
   * Restores the graph to a previous state if repairs have failed.
   * 
   * @param graph - Current graph state
   * @param steps - Number of rollback steps to perform (default: 1)
   * @returns Result of the rollback operation
   */
  rollback(graph: Graph, steps: number = 1): RollbackResult {
    if (!this.config.enableRollback) {
      return {
        success: false,
        graph,
        appliedFixes: ['Rollback is disabled'],
        remainingIssues: [],
        rollbackSteps: 0,
      };
    }
    
    if (this.config.verbose) {
      console.log(`[EnhancedRepairer] Performing rollback (${steps} steps)`);
    }
    
    let currentGraph = graph;
    const appliedFixes: string[] = [];
    let rollbackSteps = 0;
    
    for (let i = 0; i < steps; i++) {
      const result = this.transactionManager.rollbackLast(currentGraph);
      if (result.success) {
        currentGraph = result.graph;
        appliedFixes.push(...result.appliedFixes);
        rollbackSteps++;
      } else {
        break; // Stop if rollback failed
      }
    }
    
    return {
      success: rollbackSteps > 0,
      graph: currentGraph,
      appliedFixes,
      remainingIssues: [],
      rollbackSteps,
    };
  }

  /**
   * Get the transaction manager for direct access to transactions.
   * Provides access to transaction management functionality for advanced use cases.
   * 
   * @returns The transaction manager instance
   */
  getTransactionManager(): TransactionManager {
    return this.transactionManager;
  }
}

// Export the enhanced repairer as the main repairer
const enhancedRepairer = new EnhancedRepairer();

/**
 * Enhanced repair function that uses the new repairer.
 * Attempts to repair a graph based on diagnostics with improved strategies.
 * 
 * @param graph - The graph to repair
 * @param diagnostics - Diagnostics identifying issues to fix
 * @param maxAttempts - Maximum number of repair attempts (default: 3)
 * @returns Result of the repair attempt
 * 
 * @example
 * const result = attemptRepair(graph, diagnostics);
 * if (result.success) {
 *   console.log('Repairs applied:', result.fixes);
 * }
 */
export function attemptRepair(
  graph: Graph, 
  diagnostics: Diagnostic[],
  _maxAttempts: number = 3
): RepairResult {
  void _maxAttempts;
  return enhancedRepairer.attemptRepair(graph, diagnostics);
}

/**
 * Enhanced repair loop that uses the new repairer.
 * Performs multiple repair attempts with revalidation until errors are fixed.
 * 
 * @param graph - The graph to repair
 * @param diagnostics - Initial diagnostics identifying issues
 * @param validate - Function to validate the graph after repairs
 * @param maxAttempts - Maximum number of repair attempts (default: 3)
 * @returns Result of the repair loop
 * 
 * @example
 * const validateFn = (g) => runValidationGate(g).diagnostics;
 * const result = repairLoop(graph, diagnostics, validateFn);
 */
export function repairLoop(
  graph: Graph,
  diagnostics: Diagnostic[],
  validate: (g: Graph) => Diagnostic[],
  maxAttempts: number = 3
): RepairResult {
  return enhancedRepairer.repairLoop(graph, diagnostics, validate, maxAttempts);
}

/**
 * Get the enhanced repairer instance.
 * Provides access to the full repairer functionality for advanced use cases.
 * 
 * @param config - Repair configuration (optional)
 * @returns Enhanced repairer instance
 */
export function getEnhancedRepairer(config: RepairConfig = DEFAULT_REPAIR_CONFIG): EnhancedRepairer {
  return new EnhancedRepairer(config);
}

/**
 * Execute a repair with atomic transaction and rollback capability.
 * Performs a repair operation within a transaction that can be rolled back if needed.
 * This implements the atomic turn contract with rollback on failure.
 * 
 * @param graph - The graph to repair
 * @param diagnostics - Diagnostics identifying issues to fix
 * @param validate - Async validation function to check repairs
 * @param config - Repair configuration
 * @returns Promise that resolves to the repair result
 * 
 * @example
 * const result = await executeRepairWithTransaction(
 *   graph, 
 *   diagnostics, 
 *   (g) => runValidationGate(g).diagnostics,
 *   { maxRepairAttempts: 5, enableRollback: true }
 * );
 */
export async function executeRepairWithTransaction(
  graph: Graph,
  diagnostics: Diagnostic[],
  validate: (g: Graph) => Promise<Diagnostic[]> | Diagnostic[],
  config: RepairConfig = DEFAULT_REPAIR_CONFIG
): Promise<RepairResult> {
  const repairer = new EnhancedRepairer(config);
  
  // Create a transaction
  const transaction = repairer.getTransactionManager().createTransaction(graph, 'Atomic repair transaction');
  
  try {
    // Perform the repair
    // If validate function is async, we need to await it
    const result = await new Promise<RepairResult>((resolve, reject) => {
      const runRepair = async () => {
        try {
          // Create a synchronous validation function from the potentially async one
          const syncValidate = (g: Graph): Diagnostic[] => {
            const result = validate(g);
            if (result instanceof Promise) {
              throw new Error('Synchronous validation function expected for repair loop');
            }
            return result;
          };
          
          resolve(repairer.repairLoop(graph, diagnostics, syncValidate));
        } catch (error) {
          reject(error);
        }
      };
      
      runRepair();
    });
    
    // If repair failed and rollback is enabled, perform rollback
    if (!result.success && config.enableRollback) {
      if (config.verbose) {
        console.log('[EnhancedRepairer] Repair failed, performing rollback');
      }
      
      const rollbackResult = repairer.rollback(graph);
      return {
        success: false,
        graph: rollbackResult.graph,
        fixes: [...result.fixes, ...rollbackResult.appliedFixes],
        remainingIssues: diagnostics,
      };
    }
    
    // Complete the transaction
    repairer.getTransactionManager().completeTransaction(transaction.id);
    
    return result;
  } catch (error) {
    // On error, rollback if enabled
    if (config.enableRollback) {
      const rollbackResult = repairer.rollback(graph);
      return {
        success: false,
        graph: rollbackResult.graph,
        fixes: [`Repair failed: ${(error as Error).message}`, ...rollbackResult.appliedFixes],
        remainingIssues: diagnostics,
      };
    }
    
    throw error;
  }
}