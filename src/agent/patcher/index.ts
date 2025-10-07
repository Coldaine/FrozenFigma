import { Graph, EditPlan, Command, isAddCommand, isUpdateCommand, isRemoveCommand, isMoveCommand, isSetTokensCommand } from '../../schema';

/**
 * Result of applying a patch to the graph.
 */
export interface PatchResult {
  success: boolean;
  graph: Graph;
  errors: string[];
  appliedCommands: number;
}

/**
 * Applies graph-level mutations from an EditPlan.
 * This uses the store's applyCommand method to ensure proper state management.
 * 
 * Note: In a real implementation, this would receive the store instance
 * and call actions directly. For now, we return a modified graph.
 * 
 * @param graph - Current graph state
 * @param plan - EditPlan containing commands to execute
 * @returns PatchResult with success status and modified graph
 * 
 * @example
 * const result = applyPatch(currentGraph, editPlan);
 * if (result.success) {
 *   // All commands applied successfully
 *   console.log(`Applied ${result.appliedCommands} commands`);
 * }
 */
export function applyPatch(graph: Graph, plan: EditPlan): PatchResult {
  const errors: string[] = [];
  let modifiedGraph = { ...graph };
  let appliedCommands = 0;

  console.log(`[Patcher] Applying EditPlan: ${plan.description}`);
  console.log(`[Patcher] ${plan.operations.length} operations to execute`);

  // Execute each command in sequence
  for (const command of plan.operations) {
    try {
      const result = applyCommand(modifiedGraph, command);
      
      if (result.success) {
        modifiedGraph = result.graph;
        appliedCommands++;
      } else {
        errors.push(...result.errors);
        // Stop execution on first error to maintain atomicity
        break;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to apply command ${command.id}: ${errorMsg}`);
      break;
    }
  }

  const success = errors.length === 0 && appliedCommands === plan.operations.length;

  console.log(`[Patcher] Result: ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`[Patcher] Applied ${appliedCommands}/${plan.operations.length} commands`);
  
  if (errors.length > 0) {
    console.error(`[Patcher] Errors:`, errors);
  }

  return {
    success,
    graph: success ? modifiedGraph : graph, // Return original graph on failure
    errors,
    appliedCommands,
  };
}

/**
 * Apply a single command to the graph.
 * 
 * @param graph - Current graph state
 * @param command - Command to execute
 * @returns PatchResult with success status
 */
function applyCommand(graph: Graph, command: Command): PatchResult {
  const errors: string[] = [];
  let modifiedGraph = { ...graph, nodes: [...graph.nodes] };

  try {
    if (isAddCommand(command)) {
      // Add new component
      modifiedGraph.nodes.push(command.component);
      console.log(`[Patcher] ADD: Added component ${command.component.id} (${command.component.type})`);
    } 
    else if (isUpdateCommand(command)) {
      // Update existing component
      const index = modifiedGraph.nodes.findIndex(node => node.id === command.targetId);
      
      if (index === -1) {
        errors.push(`Component not found: ${command.targetId}`);
      } else {
        const existingNode = modifiedGraph.nodes[index];
        
        // Merge updates
        modifiedGraph.nodes[index] = {
          ...existingNode,
          ...(command.updates.name ? { name: command.updates.name } : {}),
          ...(command.updates.props ? { 
            props: { ...existingNode.props, ...command.updates.props } 
          } : {}),
          ...(command.updates.frame ? { 
            frame: { ...existingNode.frame, ...command.updates.frame } 
          } : {}),
        };
        
        console.log(`[Patcher] UPDATE: Updated component ${command.targetId}`);
      }
    } 
    else if (isRemoveCommand(command)) {
      // Remove component (and children if cascade is true)
      const toRemove = new Set<string>([command.targetId]);
      
      if (command.cascade) {
        // Recursively find all children
        let changed = true;
        while (changed) {
          changed = false;
          for (const node of modifiedGraph.nodes) {
            if (node.children && toRemove.has(node.id)) {
              for (const childId of node.children) {
                if (!toRemove.has(childId)) {
                  toRemove.add(childId);
                  changed = true;
                }
              }
            }
          }
        }
      }
      
      modifiedGraph.nodes = modifiedGraph.nodes.filter(node => !toRemove.has(node.id));
      console.log(`[Patcher] REMOVE: Removed ${toRemove.size} component(s) (cascade: ${command.cascade})`);
    } 
    else if (isMoveCommand(command)) {
      // Move component to new position
      const index = modifiedGraph.nodes.findIndex(node => node.id === command.targetId);
      
      if (index === -1) {
        errors.push(`Component not found: ${command.targetId}`);
      } else {
        modifiedGraph.nodes[index] = {
          ...modifiedGraph.nodes[index],
          frame: {
            ...modifiedGraph.nodes[index].frame,
            x: command.position.x,
            y: command.position.y,
            ...(command.region ? { region: command.region } : {}),
          },
        };
        
        console.log(`[Patcher] MOVE: Moved component ${command.targetId} to (${command.position.x}, ${command.position.y})`);
      }
    } 
    else if (isSetTokensCommand(command)) {
      // Replace entire token set
      modifiedGraph.tokens = command.tokens;
      console.log(`[Patcher] SET_TOKENS: Applied new token set`);
    }

    // Update metadata
    if (modifiedGraph.meta) {
      modifiedGraph.meta = {
        ...modifiedGraph.meta,
        modified: new Date().toISOString(),
      };
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Command execution error: ${errorMsg}`);
  }

  return {
    success: errors.length === 0,
    graph: modifiedGraph,
    errors,
    appliedCommands: errors.length === 0 ? 1 : 0,
  };
}

/**
 * Create a checkpoint of the current graph state.
 * This should be called before applying patches to enable rollback.
 * 
 * @param graph - Current graph state
 * @param description - Description of the checkpoint
 * @returns Checkpoint object with graph snapshot
 */
export function createCheckpoint(graph: Graph, description: string) {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    description,
    graph: JSON.parse(JSON.stringify(graph)), // Deep clone
  };
}

/**
 * Rollback to a previous checkpoint.
 * 
 * @param checkpoint - Checkpoint to restore
 * @returns Restored graph state
 */
export function rollback(checkpoint: { graph: Graph; description: string }) {
  console.log(`[Patcher] Rolling back to checkpoint: ${checkpoint.description}`);
  return JSON.parse(JSON.stringify(checkpoint.graph)); // Deep clone
}