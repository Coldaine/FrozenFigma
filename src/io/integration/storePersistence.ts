import { createEmptyGraph } from '../../schema';
import { FrozenFigmaStore } from '../../app/state/store';
import { saveUI, loadUI, createCheckpoint, restoreFromCheckpoint, logSessionEntry } from '../persistence';
import { saveArtifact, logTurn } from '../artifacts';
import { createProjectStructure } from '../utils/fileManager';

// ============================================================================
// STORE PERSISTENCE INTEGRATION
// ============================================================================

/**
 * Options for store persistence integration.
 */
export interface StorePersistenceOptions {
  autoSaveInterval?: number; // Interval in milliseconds for auto-save (default: 30000ms = 30s)
  enableCheckpoints?: boolean; // Whether to create checkpoints automatically
  checkpointInterval?: number; // Interval in milliseconds for auto-checkpoints (default: 300000ms = 5min)
  enableRecovery?: boolean; // Whether to enable recovery from corrupted files
  recoveryAttempts?: number; // Number of recovery attempts (default: 3)
  projectPath?: string; // Base path for project files
}

/**
 * Integrates persistence functionality with the Zustand store.
 */
export class StorePersistence {
  private store: FrozenFigmaStore | null = null;
  private options: StorePersistenceOptions;
  private autoSaveTimer: NodeJS.Timeout | null = null;
 private checkpointTimer: NodeJS.Timeout | null = null;
  private isRecovering: boolean = false;

  constructor(options?: StorePersistenceOptions) {
    this.options = {
      autoSaveInterval: 3000, // 30 seconds
      enableCheckpoints: true,
      checkpointInterval: 3000, // 5 minutes
      enableRecovery: true,
      recoveryAttempts: 3,
      projectPath: './projects/default',
      ...options,
    };
  }

  /**
   * Connects the persistence system to the store.
   * @param store - The FrozenFigma store instance
   */
  public connect(store: FrozenFigmaStore): void {
    this.store = store;
    
    // Initialize project structure
    this.initializeProject();
    
    // Start auto-save timer if enabled
    if (this.options.autoSaveInterval && this.options.autoSaveInterval > 0) {
      this.startAutoSave();
    }
    
    // Start checkpoint timer if enabled
    if (this.options.enableCheckpoints && this.options.checkpointInterval && this.options.checkpointInterval > 0) {
      this.startCheckpoints();
    }
    
    console.log('Store persistence connected');
  }

  /**
   * Disconnects the persistence system from the store.
   */
  public disconnect(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }
    
    console.log('Store persistence disconnected');
  }

 /**
   * Saves the current store state to persistent storage.
   * @param path - Optional path to save to (default: './ui.json')
   */
  public async save(path?: string): Promise<void> {
    if (!this.store) {
      throw new Error('Store not connected to persistence system');
    }
    
    try {
      const graph = this.store.graph;
      await saveUI(graph, path);
      
      // Log the save operation
      await logSessionEntry({
        timestamp: new Date().toISOString(),
        type: 'result',
        data: { operation: 'save', path: path || './ui.json' },
        turn: this.store.session.currentTurn,
      });
      
      console.log('Store state saved successfully');
    } catch (error) {
      console.error('Error saving store state:', error);
      await this.handleSaveError(error, path);
      throw error;
    }
  }

  /**
   * Loads store state from persistent storage.
   * @param path - Optional path to load from (default: './ui.json')
   */
 public async load(path?: string): Promise<void> {
    if (!this.store) {
      throw new Error('Store not connected to persistence system');
    }
    
    try {
      this.isRecovering = true;
      const graph = await loadUI(path);
      
      // Update the store with the loaded graph
      this.store.actions.setGraph(graph);
      
      // Log the load operation
      await logSessionEntry({
        timestamp: new Date().toISOString(),
        type: 'result',
        data: { operation: 'load', path: path || './ui.json' },
        turn: this.store.session.currentTurn,
      });
      
      console.log('Store state loaded successfully');
      this.isRecovering = false;
    } catch (error) {
      console.error('Error loading store state:', error);
      await this.handleLoadError(error, path);
      this.isRecovering = false;
      throw error;
    }
  }

  /**
   * Creates a checkpoint of the current store state.
   * @param description - Description of the checkpoint
   */
  public async createCheckpoint(description: string = 'Auto-checkpoint'): Promise<void> {
    if (!this.store) {
      throw new Error('Store not connected to persistence system');
    }
    
    try {
      const graph = this.store.graph;
      const checkpointId = `checkpoint-${Date.now()}`;
      
      await createCheckpoint(graph, checkpointId, description);
      
      // Add checkpoint to store's checkpoints list
      this.store.actions.createCheckpoint(description);
      
      // Log the checkpoint operation
      await logSessionEntry({
        timestamp: new Date().toISOString(),
        type: 'checkpoint',
        data: { checkpointId, description },
        turn: this.store.session.currentTurn,
      });
      
      console.log(`Checkpoint created: ${checkpointId}`);
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw error;
    }
  }

  /**
   * Restores the store state from a checkpoint.
   * @param checkpointId - ID of the checkpoint to restore from
   */
  public async restoreFromCheckpoint(checkpointId: string): Promise<void> {
    if (!this.store) {
      throw new Error('Store not connected to persistence system');
    }
    
    try {
      this.isRecovering = true;
      const graph = await restoreFromCheckpoint(checkpointId);
      
      // Update the store with the checkpointed graph
      this.store.actions.setGraph(graph);
      
      // Log the restore operation
      await logSessionEntry({
        timestamp: new Date().toISOString(),
        type: 'result',
        data: { operation: 'restore', checkpointId },
        turn: this.store.session.currentTurn,
      });
      
      console.log(`Restored from checkpoint: ${checkpointId}`);
      this.isRecovering = false;
    } catch (error) {
      console.error('Error restoring from checkpoint:', error);
      this.isRecovering = false;
      throw error;
    }
 }

  /**
   * Starts the auto-save timer.
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(async () => {
      if (!this.isRecovering && this.store) {
        try {
          await this.save();
          console.log('Auto-save completed');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, this.options.autoSaveInterval);
  }

  /**
   * Starts the checkpoint timer.
   */
 private startCheckpoints(): void {
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
    }
    
    this.checkpointTimer = setInterval(async () => {
      if (!this.isRecovering && this.store && this.options.enableCheckpoints) {
        try {
          await this.createCheckpoint(`Auto-checkpoint at ${new Date().toISOString()}`);
          console.log('Auto-checkpoint completed');
        } catch (error) {
          console.error('Auto-checkpoint failed:', error);
        }
      }
    }, this.options.checkpointInterval);
  }

  /**
   * Initializes the project structure.
   */
  private async initializeProject(): Promise<void> {
    if (this.options.projectPath) {
      try {
        await createProjectStructure(this.options.projectPath.split('/').pop() || 'default');
        console.log(`Project structure initialized at ${this.options.projectPath}`);
      } catch (error) {
        console.error('Error initializing project structure:', error);
      }
    }
 }

  /**
   * Handles save errors, potentially attempting recovery.
   */
  private async handleSaveError(error: unknown, _path?: string): Promise<void> {
    void _path;
    if (this.options.enableRecovery) {
      console.log('Attempting recovery from save error...');
      // In a real implementation, we might try to save to a backup location
      try {
        await saveArtifact(error, `/recovery/backup-${Date.now()}.json`, 'log', 'Save error backup');
      } catch (backupError) {
        console.error('Failed to create backup after save error:', backupError);
      }
    }
  }

  /**
   * Handles load errors, potentially attempting recovery.
   */
 private async handleLoadError(error: unknown, _path?: string): Promise<void> {
   void _path;
    if (this.options.enableRecovery) {
      console.log('Attempting recovery from load error...');
      
      // Try to load from a backup or default state
      try {
        // Attempt to load from the last known good checkpoint
        if (this.store) {
          const checkpoints = this.store.session.checkpoints;
          if (checkpoints.length > 0) {
            const lastCheckpoint = checkpoints[checkpoints.length - 1];
            console.log(`Attempting to load from last checkpoint: ${lastCheckpoint.id}`);
            await this.restoreFromCheckpoint(lastCheckpoint.id);
            return;
          }
        }
        
        // If no checkpoints, load a default empty graph
        if (this.store) {
          this.store.actions.setGraph(createEmptyGraph());
        }
      } catch (recoveryError) {
        console.error('Recovery from load error failed:', recoveryError);
        throw error; // Re-throw the original error if recovery fails
      }
    }
  }

  /**
   * Logs a turn to the session log.
   */
  public async logTurn(turnData: unknown, turnNumber?: number, description?: string): Promise<void> {
    try {
      await logTurn(turnData, turnNumber, description);
    } catch (error) {
      console.error('Error logging turn:', error);
    }
  }

  /**
   * Gets the current store instance.
   */
  public getStore(): FrozenFigmaStore | null {
    return this.store;
  }
}

// ============================================================================
// HIGHER-ORDER FUNCTION FOR EASY INTEGRATION
// ============================================================================

/**
 * Creates a store persistence instance and connects it to the store.
 * @param store - The FrozenFigma store instance
 * @param options - Persistence options
 * @returns The connected StorePersistence instance
 */
export function integratePersistence(store: FrozenFigmaStore, options?: StorePersistenceOptions): StorePersistence {
  const persistence = new StorePersistence(options);
  persistence.connect(store);
  return persistence;
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

// Export a default instance for convenience
export const defaultStorePersistence = new StorePersistence();