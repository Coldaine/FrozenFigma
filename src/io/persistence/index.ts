import { Graph, createEmptyGraph, validate, GraphSchema } from '../../schema';
import { captureScreenshot, logTurn, generateDiff, saveArtifact } from '../artifacts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Represents a checkpoint with metadata and the graph state.
 */
export interface Checkpoint {
  id: string;
  timestamp: string;
  description: string;
 graph: Graph;
}

/**
 * Represents a session log entry in JSONL format.
 */
export interface SessionLogEntry {
  timestamp: string;
  type: 'prompt' | 'plan' | 'result' | 'checkpoint' | 'error';
  data: any;
  turn?: number;
}

// ============================================================================
// PERSISTENCE UTILITIES
// ============================================================================

/**
 * Saves the current UI graph to a JSON file.
 * 
 * @param graph - The graph to save
 * @param path - Path to save the file (default: './ui.json')
 * @returns Promise that resolves when the file is saved
 */
export async function saveUI(graph: Graph, path: string = './ui.json'): Promise<void> {
 try {
    // Validate the graph before saving
    const validationResult = validate(GraphSchema, graph);
    if (!validationResult.success) {
      throw new Error(`Invalid graph: ${validationResult.errors?.map(e => e.message).join(', ')}`);
    }

    // Update the modified timestamp before saving
    const graphToSave = {
      ...graph,
      meta: {
        ...graph.meta,
        modified: new Date().toISOString(),
      }
    };

    // Convert to JSON with proper formatting
    const jsonContent = JSON.stringify(graphToSave, null, 2);
    
    // In a browser environment, we'll need to use a different approach for file saving
    // For now, we'll simulate saving by logging and using localStorage for demo purposes
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
      // Browser environment - create a downloadable file
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'ui.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Node.js environment or fallback - this would need fs module in actual implementation
      console.log(`Saving UI to ${path}:`, jsonContent.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error(`Error saving UI to ${path}:`, error);
    throw error;
 }
}

/**
 * Loads a UI graph from a JSON file.
 * 
 * @param path - Path to load the file from (default: './ui.json')
 * @returns Promise that resolves to the loaded graph
 */
export async function loadUI(path: string = './ui.json'): Promise<Graph> {
  try {
    let graphData: any;
    
    if (typeof window !== 'undefined') {
      // Browser environment - try to load from localStorage first, or fetch from path
      if (path === './ui.json') {
        // Try to load from localStorage (the current state)
        const savedState = localStorage.getItem('frozenfigma-store');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.graph) {
            graphData = parsedState.graph;
          }
        }
      }
      
      if (!graphData) {
        // For browser, we need to simulate file loading
        // In a real implementation, this would handle file input or fetch
        console.warn(`File loading from ${path} not implemented in browser environment`);
        return createEmptyGraph();
      }
    } else {
      // Node.js environment - would use fs module in actual implementation
      console.log(`Loading UI from ${path}`);
      // Simulate loading by returning an empty graph for now
      graphData = createEmptyGraph();
    }

    // Validate the loaded graph
    const validationResult = validate(GraphSchema, graphData);
    if (!validationResult.success) {
      throw new Error(`Invalid graph loaded: ${validationResult.errors?.map(e => e.message).join(', ')}`);
    }

    return graphData as Graph;
 } catch (error) {
    console.error(`Error loading UI from ${path}:`, error);
    // Return an empty graph if loading fails
    return createEmptyGraph();
  }
}

/**
 * Creates a checkpoint of the current graph state.
 * 
 * @param graph - The graph to checkpoint
 * @param checkpointId - Unique identifier for the checkpoint
 * @param description - Description of the checkpoint
 * @returns Promise that resolves when the checkpoint is created
 */
export async function createCheckpoint(graph: Graph, checkpointId: string, description: string = 'Auto-checkpoint'): Promise<void> {
  try {
    const checkpoint: Checkpoint = {
      id: checkpointId,
      timestamp: new Date().toISOString(),
      description,
      graph: JSON.parse(JSON.stringify(graph)), // Deep clone the graph
    };

    // Save checkpoint to localStorage (in a real implementation, this might go to a file or database)
    const checkpoints = JSON.parse(localStorage.getItem('frozenfigma-checkpoints') || '[]');
    checkpoints.push(checkpoint);
    localStorage.setItem('frozenfigma-checkpoints', JSON.stringify(checkpoints));
    
    // Also save to a checkpoint file
    await saveArtifact(checkpoint, `checkpoints/checkpoint-${checkpointId}.json`);
    
    console.log(`Checkpoint created: ${checkpointId} - ${description}`);
  } catch (error) {
    console.error(`Error creating checkpoint ${checkpointId}:`, error);
    throw error;
 }
}

/**
 * Restores the graph state from a specific checkpoint.
 * 
 * @param checkpointId - The ID of the checkpoint to restore
 * @returns Promise that resolves to the restored graph
 */
export async function restoreFromCheckpoint(checkpointId: string): Promise<Graph> {
  try {
    // Load checkpoints from localStorage
    const checkpoints: Checkpoint[] = JSON.parse(localStorage.getItem('frozenfigma-checkpoints') || '[]');
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    
    if (!checkpoint) {
      throw new Error(`Checkpoint with ID ${checkpointId} not found`);
    }

    // Validate the checkpoint graph before returning
    const validationResult = validate(GraphSchema, checkpoint.graph);
    if (!validationResult.success) {
      throw new Error(`Invalid graph in checkpoint: ${validationResult.errors?.map(e => e.message).join(', ')}`);
    }

    console.log(`Restored from checkpoint: ${checkpointId} - ${checkpoint.description}`);
    return checkpoint.graph;
  } catch (error) {
    console.error(`Error restoring from checkpoint ${checkpointId}:`, error);
    // Return an empty graph if restoration fails
    return createEmptyGraph();
  }
}

/**
 * Gets all available checkpoints.
 * 
 * @returns Promise that resolves to an array of checkpoints
 */
export async function getCheckpoints(): Promise<Checkpoint[]> {
  try {
    const checkpoints: Checkpoint[] = JSON.parse(localStorage.getItem('frozenfigma-checkpoints') || '[]');
    return checkpoints;
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    return [];
  }
}

/**
 * Deletes a specific checkpoint.
 * 
 * @param checkpointId - The ID of the checkpoint to delete
 * @returns Promise that resolves when the checkpoint is deleted
 */
export async function deleteCheckpoint(checkpointId: string): Promise<void> {
  try {
    let checkpoints: Checkpoint[] = JSON.parse(localStorage.getItem('frozenfigma-checkpoints') || '[]');
    checkpoints = checkpoints.filter(cp => cp.id !== checkpointId);
    localStorage.setItem('frozenfigma-checkpoints', JSON.stringify(checkpoints));
  } catch (error) {
    console.error(`Error deleting checkpoint ${checkpointId}:`, error);
    throw error;
  }
}

// ============================================================================
// SESSION LOGGING
// ============================================================================

/**
 * Logs a session entry in JSONL format.
 * 
 * @param entry - The session log entry to record
 * @param path - Path to the log file (default: './session.jsonl')
 * @returns Promise that resolves when the entry is logged
 */
export async function logSessionEntry(entry: SessionLogEntry, path: string = './session.jsonl'): Promise<void> {
  try {
    // Format as JSONL (JSON Lines) - each entry on its own line
    const logLine = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString()
    }) + '\n';
    
    // In browser environment, append to localStorage
    if (typeof window !== 'undefined') {
      const logKey = `frozenfigma-session-log-${path}`;
      const currentLog = localStorage.getItem(logKey) || '';
      localStorage.setItem(logKey, currentLog + logLine);
    } else {
      // In Node.js environment, would append to file
      console.log(`Logging to ${path}:`, logLine.trim());
    }
  } catch (error) {
    console.error(`Error logging session entry:`, error);
    throw error;
  }
}

/**
 * Gets the session log entries.
 * 
 * @param path - Path to the log file (default: './session.jsonl')
 * @returns Promise that resolves to an array of log entries
 */
export async function getSessionLog(path: string = './session.jsonl'): Promise<SessionLogEntry[]> {
  try {
    if (typeof window !== 'undefined') {
      const logKey = `frozenfigma-session-log-${path}`;
      const logContent = localStorage.getItem(logKey) || '';
      
      // Parse each line as a separate JSON object
      return logContent
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
    } else {
      // In Node.js environment, would read from file
      console.log(`Getting session log from ${path}`);
      return [];
    }
  } catch (error) {
    console.error(`Error getting session log:`, error);
    return [];
  }
}

/**
 * Clears the session log.
 * 
 * @param path - Path to the log file (default: './session.jsonl')
 * @returns Promise that resolves when the log is cleared
 */
export async function clearSessionLog(path: string = './session.jsonl'): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const logKey = `frozenfigma-session-log-${path}`;
      localStorage.removeItem(logKey);
    } else {
      console.log(`Clearing session log at ${path}`);
    }
  } catch (error) {
    console.error(`Error clearing session log:`, error);
    throw error;
 }
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

/**
 * Creates a new project directory structure.
 * 
 * @param projectName - Name of the project
 * @returns Promise that resolves when the project structure is created
 */
export async function createProject(projectName: string): Promise<void> {
  try {
    // In a real implementation, this would create the project directory structure
    // For now, we'll simulate by creating entries in localStorage
    const projectKey = `frozenfigma-project-${projectName}`;
    const projectStructure = {
      name: projectName,
      created: new Date().toISOString(),
      paths: {
        ui: `./projects/${projectName}/ui.json`,
        checkpoints: `./projects/${projectName}/checkpoints/`,
        exports: `./projects/${projectName}/exports/`,
        logs: `./projects/${projectName}/logs/`,
        artifacts: `./projects/${projectName}/artifacts/`,
      }
    };
    
    localStorage.setItem(projectKey, JSON.stringify(projectStructure));
    console.log(`Project created: ${projectName}`);
  } catch (error) {
    console.error(`Error creating project ${projectName}:`, error);
    throw error;
 }
}

/**
 * Gets the project structure.
 * 
 * @param projectName - Name of the project
 * @returns Promise that resolves to the project structure
 */
export async function getProject(projectName: string): Promise<any> {
  try {
    const projectKey = `frozenfigma-project-${projectName}`;
    const projectStructure = localStorage.getItem(projectKey);
    
    if (!projectStructure) {
      throw new Error(`Project ${projectName} not found`);
    }
    
    return JSON.parse(projectStructure);
  } catch (error) {
    console.error(`Error getting project ${projectName}:`, error);
    return null;
  }
}