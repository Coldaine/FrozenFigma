import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { produce } from 'immer';
import {
  Graph,
  ComponentSpec,
  ComponentType,
  TokenSet,
  Command,
  EditPlan,
  createEmptyGraph,
  findComponentById,
  findComponentsByName,
  findComponentsByType,
  findComponentsByRegion,
  generateId,
} from '../../schema';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Checkpoint represents a saved state in history that can be restored.
 */
export interface Checkpoint {
  id: string;
  timestamp: string;
  description: string;
  graph: Graph;
}

/**
 * HistoryEntry tracks a single change to the graph for undo/redo.
 */
export interface HistoryEntry {
  id: string;
  timestamp: string;
  command: Command;
  graphBefore: Graph;
  graphAfter: Graph;
}

/**
 * SelectionState manages currently selected components.
 */
export interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  lockedIds: string[];
}

/**
 * SessionState manages session metadata and history.
 */
export interface SessionState {
  currentTurn: number;
  history: HistoryEntry[];
  checkpoints: Checkpoint[];
  historyIndex: number; // Current position in history for undo/redo
  maxHistorySize: number;
}

/**
 * GraphActions define all operations on the graph slice.
 */
export interface GraphActions {
  // Component operations
  addComponent: (component: ComponentSpec) => void;
  updateComponent: (id: string, updates: Partial<ComponentSpec>) => void;
  removeComponent: (id: string, cascade?: boolean) => void;
  moveComponent: (id: string, x: number, y: number, region?: string) => void;
  
  // Batch operations
  addComponents: (components: ComponentSpec[]) => void;
  removeComponents: (ids: string[], cascade?: boolean) => void;
  
  // Token operations
  setTokens: (tokens: TokenSet) => void;
  updateTokens: (updates: Partial<TokenSet>) => void;
  
  // Graph operations
  setGraph: (graph: Graph) => void;
  resetGraph: () => void;
  updateMeta: (meta: Partial<Graph['meta']>) => void;
  
  // Command execution
  applyCommand: (command: Command) => void;
  applyEditPlan: (plan: EditPlan) => void;
}

/**
 * SelectionActions define all operations on the selection slice.
 */
export interface SelectionActions {
  selectComponent: (id: string) => void;
  deselectComponent: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
  setHoveredId: (id: string | null) => void;
  lockComponent: (id: string) => void;
  unlockComponent: (id: string) => void;
  toggleLock: (id: string) => void;
}

/**
 * SessionActions define all operations on the session slice.
 */
export interface SessionActions {
  incrementTurn: () => void;
  addToHistory: (entry: HistoryEntry) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  createCheckpoint: (description: string) => void;
  restoreCheckpoint: (checkpointId: string) => void;
  clearHistory: () => void;
}

/**
 * StoreSelectors provide computed values and queries.
 */
export interface StoreSelectors {
  // Component selectors
  getComponentById: (id: string) => ComponentSpec | undefined;
  getComponentsByType: (type: ComponentType) => ComponentSpec[];
  getComponentsByName: (name: string) => ComponentSpec[];
  getComponentsByRegion: (region: string) => ComponentSpec[];
  getAllComponents: () => ComponentSpec[];
  
  // Selection selectors
  getSelectedComponents: () => ComponentSpec[];
  isSelected: (id: string) => boolean;
  isLocked: (id: string) => boolean;
  
  // Session selectors
  getCurrentCheckpoint: () => Checkpoint | undefined;
  getHistoryAtIndex: (index: number) => HistoryEntry | undefined;
}

/**
 * FrozenFigmaStore combines all slices into a single store interface.
 */
export interface FrozenFigmaStore {
  // State slices
  graph: Graph;
  selection: SelectionState;
  session: SessionState;
  
  // Actions
  actions: GraphActions & SelectionActions & SessionActions;
  
  // Selectors
  selectors: StoreSelectors;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

/**
 * Creates the main FrozenFigma Zustand store with all slices, actions, and middleware.
 * 
 * Architecture:
 * - Graph Slice: Manages the UI component graph (nodes, tokens, metadata)
 * - Selection Slice: Manages selected/hovered/locked components
 * - Session Slice: Manages history, checkpoints, and undo/redo
 * 
 * Middleware:
 * - persist: Saves state to localStorage for session recovery
 * - devtools: Enables Redux DevTools integration for debugging
 * 
 * Usage:
 * ```typescript
 * const { graph, actions, selectors } = useStore();
 * 
 * // Add a component
 * actions.addComponent(newComponent);
 * 
 * // Query components
 * const buttons = selectors.getComponentsByType('button');
 * 
 * // Undo/redo
 * if (actions.canUndo()) {
 *   actions.undo();
 * }
 * ```
 */
export const useStore = create<FrozenFigmaStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ====================================================================
        // INITIAL STATE
        // ====================================================================
        
        graph: createEmptyGraph(),
        
        selection: {
          selectedIds: [],
          hoveredId: null,
          lockedIds: [],
        },
        
        session: {
          currentTurn: 0,
          history: [],
          checkpoints: [],
          historyIndex: -1,
          maxHistorySize: 100,
        },
        
        // ====================================================================
        // ACTIONS
        // ====================================================================
        
        actions: {
          // ----------------------------------------------------------------
          // GRAPH ACTIONS
          // ----------------------------------------------------------------
          
          addComponent: (component: ComponentSpec) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.graph.nodes.push(component);
                if (state.graph.meta) {
                  state.graph.meta.modified = new Date().toISOString();
                }
              }),
              false,
              'graph/addComponent'
            );
          },
          
          updateComponent: (id: string, updates: Partial<ComponentSpec>) => {
            set(
              produce((state: FrozenFigmaStore) => {
                const index = state.graph.nodes.findIndex((node) => node.id === id);
                if (index !== -1) {
                  // Merge updates while preserving required fields
                  state.graph.nodes[index] = {
                    ...state.graph.nodes[index],
                    ...updates,
                    id, // Ensure ID cannot be changed
                  };
                  if (state.graph.meta) {
                    state.graph.meta.modified = new Date().toISOString();
                  }
                }
              }),
              false,
              'graph/updateComponent'
            );
          },
          
          removeComponent: (id: string, cascade = true) => {
            set(
              produce((state: FrozenFigmaStore) => {
                if (cascade) {
                  // Recursively remove children
                  const toRemove = new Set<string>([id]);
                  let changed = true;
                  
                  while (changed) {
                    changed = false;
                    for (const node of state.graph.nodes) {
                      if (node.children) {
                        for (const childId of node.children) {
                          if (toRemove.has(node.id) && !toRemove.has(childId)) {
                            toRemove.add(childId);
                            changed = true;
                          }
                        }
                      }
                    }
                  }
                  
                  state.graph.nodes = state.graph.nodes.filter(
                    (node) => !toRemove.has(node.id)
                  );
                  
                  // Clean up selection
                  state.selection.selectedIds = state.selection.selectedIds.filter(
                    (selectedId) => !toRemove.has(selectedId)
                  );
                } else {
                  state.graph.nodes = state.graph.nodes.filter((node) => node.id !== id);
                  state.selection.selectedIds = state.selection.selectedIds.filter(
                    (selectedId) => selectedId !== id
                  );
                }
                
                if (state.graph.meta) {
                  state.graph.meta.modified = new Date().toISOString();
                }
              }),
              false,
              'graph/removeComponent'
            );
          },
          
          moveComponent: (id: string, x: number, y: number, region?: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                const node = state.graph.nodes.find((n) => n.id === id);
                if (node) {
                  node.frame.x = x;
                  node.frame.y = y;
                  if (region !== undefined) {
                    node.frame.region = region;
                  }
                  if (state.graph.meta) {
                    state.graph.meta.modified = new Date().toISOString();
                  }
                }
              }),
              false,
              'graph/moveComponent'
            );
          },
          
          addComponents: (components: ComponentSpec[]) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.graph.nodes.push(...components);
                if (state.graph.meta) {
                  state.graph.meta.modified = new Date().toISOString();
                }
              }),
              false,
              'graph/addComponents'
            );
          },
          
          removeComponents: (ids: string[], cascade = true) => {
            const { actions } = get();
            ids.forEach((id) => actions.removeComponent(id, cascade));
          },
          
          setTokens: (tokens: TokenSet) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.graph.tokens = tokens;
                if (state.graph.meta) {
                  state.graph.meta.modified = new Date().toISOString();
                }
              }),
              false,
              'graph/setTokens'
            );
          },
          
          updateTokens: (updates: Partial<TokenSet>) => {
            set(
              produce((state: FrozenFigmaStore) => {
                if (state.graph.tokens) {
                  state.graph.tokens = {
                    ...state.graph.tokens,
                    ...updates,
                  };
                  if (state.graph.meta) {
                    state.graph.meta.modified = new Date().toISOString();
                  }
                }
              }),
              false,
              'graph/updateTokens'
            );
          },
          
          setGraph: (graph: Graph) => {
            set(
              { graph },
              false,
              'graph/setGraph'
            );
          },
          
          resetGraph: () => {
            set(
              { graph: createEmptyGraph() },
              false,
              'graph/resetGraph'
            );
          },
          
          updateMeta: (meta: Partial<Graph['meta']>) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.graph.meta = {
                  ...state.graph.meta,
                  ...meta,
                  modified: new Date().toISOString(),
                };
              }),
              false,
              'graph/updateMeta'
            );
          },
          
          applyCommand: (command: Command) => {
            const { actions, graph } = get();
            const graphBefore = JSON.parse(JSON.stringify(graph));
            
            switch (command.type) {
              case 'ADD':
                actions.addComponent(command.component);
                break;
              case 'UPDATE':
                actions.updateComponent(command.targetId, command.updates as Partial<ComponentSpec>);
                break;
              case 'REMOVE':
                actions.removeComponent(command.targetId, command.cascade);
                break;
              case 'MOVE':
                actions.moveComponent(
                  command.targetId,
                  command.position.x,
                  command.position.y,
                  command.region
                );
                break;
              case 'SET_TOKENS':
                actions.setTokens(command.tokens);
                break;
            }
            
            // Add to history
            const graphAfter = get().graph;
            actions.addToHistory({
              id: generateId(),
              timestamp: new Date().toISOString(),
              command,
              graphBefore,
              graphAfter: JSON.parse(JSON.stringify(graphAfter)),
            });
          },
          
          applyEditPlan: (plan: EditPlan) => {
            const { actions } = get();
            
            // Execute all operations in sequence
            for (const operation of plan.operations) {
              actions.applyCommand(operation);
            }
            
            // Create a checkpoint after applying the plan
            actions.createCheckpoint(plan.description);
          },
          
          // ----------------------------------------------------------------
          // SELECTION ACTIONS
          // ----------------------------------------------------------------
          
          selectComponent: (id: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                if (!state.selection.selectedIds.includes(id)) {
                  state.selection.selectedIds.push(id);
                }
              }),
              false,
              'selection/selectComponent'
            );
          },
          
          deselectComponent: (id: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.selection.selectedIds = state.selection.selectedIds.filter(
                  (selectedId) => selectedId !== id
                );
              }),
              false,
              'selection/deselectComponent'
            );
          },
          
          selectMultiple: (ids: string[]) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.selection.selectedIds = [...new Set([...state.selection.selectedIds, ...ids])];
              }),
              false,
              'selection/selectMultiple'
            );
          },
          
          clearSelection: () => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.selection.selectedIds = [];
              }),
              false,
              'selection/clearSelection'
            );
          },
          
          toggleSelection: (id: string) => {
            const { actions, selectors } = get();
            if (selectors.isSelected(id)) {
              actions.deselectComponent(id);
            } else {
              actions.selectComponent(id);
            }
          },
          
          setHoveredId: (id: string | null) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.selection.hoveredId = id;
              }),
              false,
              'selection/setHoveredId'
            );
          },
          
          lockComponent: (id: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                if (!state.selection.lockedIds.includes(id)) {
                  state.selection.lockedIds.push(id);
                }
              }),
              false,
              'selection/lockComponent'
            );
          },
          
          unlockComponent: (id: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.selection.lockedIds = state.selection.lockedIds.filter(
                  (lockedId) => lockedId !== id
                );
              }),
              false,
              'selection/unlockComponent'
            );
          },
          
          toggleLock: (id: string) => {
            const { actions, selectors } = get();
            if (selectors.isLocked(id)) {
              actions.unlockComponent(id);
            } else {
              actions.lockComponent(id);
            }
          },
          
          // ----------------------------------------------------------------
          // SESSION ACTIONS
          // ----------------------------------------------------------------
          
          incrementTurn: () => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.session.currentTurn += 1;
              }),
              false,
              'session/incrementTurn'
            );
          },
          
          addToHistory: (entry: HistoryEntry) => {
            set(
              produce((state: FrozenFigmaStore) => {
                // If we're not at the end of history, truncate future entries
                if (state.session.historyIndex < state.session.history.length - 1) {
                  state.session.history = state.session.history.slice(
                    0,
                    state.session.historyIndex + 1
                  );
                }
                
                // Add new entry
                state.session.history.push(entry);
                state.session.historyIndex = state.session.history.length - 1;
                
                // Enforce max history size
                if (state.session.history.length > state.session.maxHistorySize) {
                  state.session.history.shift();
                  state.session.historyIndex -= 1;
                }
              }),
              false,
              'session/addToHistory'
            );
          },
          
          undo: () => {
            const { session, actions } = get();
            if (actions.canUndo()) {
              const entry = session.history[session.historyIndex];
              if (entry) {
                set(
                  produce((state: FrozenFigmaStore) => {
                    state.graph = JSON.parse(JSON.stringify(entry.graphBefore));
                    state.session.historyIndex -= 1;
                  }),
                  false,
                  'session/undo'
                );
              }
            }
          },
          
          redo: () => {
            const { session, actions } = get();
            if (actions.canRedo()) {
              const entry = session.history[session.historyIndex + 1];
              if (entry) {
                set(
                  produce((state: FrozenFigmaStore) => {
                    state.graph = JSON.parse(JSON.stringify(entry.graphAfter));
                    state.session.historyIndex += 1;
                  }),
                  false,
                  'session/redo'
                );
              }
            }
          },
          
          canUndo: () => {
            const { session } = get();
            return session.historyIndex >= 0;
          },
          
          canRedo: () => {
            const { session } = get();
            return session.historyIndex < session.history.length - 1;
          },
          
          createCheckpoint: (description: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                const checkpoint: Checkpoint = {
                  id: generateId(),
                  timestamp: new Date().toISOString(),
                  description,
                  graph: JSON.parse(JSON.stringify(state.graph)),
                };
                state.session.checkpoints.push(checkpoint);
              }),
              false,
              'session/createCheckpoint'
            );
          },
          
          restoreCheckpoint: (checkpointId: string) => {
            set(
              produce((state: FrozenFigmaStore) => {
                const checkpoint = state.session.checkpoints.find((cp) => cp.id === checkpointId);
                if (checkpoint) {
                  state.graph = JSON.parse(JSON.stringify(checkpoint.graph));
                  // Clear history after restoring checkpoint
                  state.session.history = [];
                  state.session.historyIndex = -1;
                }
              }),
              false,
              'session/restoreCheckpoint'
            );
          },
          
          clearHistory: () => {
            set(
              produce((state: FrozenFigmaStore) => {
                state.session.history = [];
                state.session.historyIndex = -1;
              }),
              false,
              'session/clearHistory'
            );
          },
        },
        
        // ====================================================================
        // SELECTORS
        // ====================================================================
        
        selectors: {
          getComponentById: (id: string) => {
            return findComponentById(get().graph, id);
          },
          
          getComponentsByType: (type: ComponentType) => {
            return findComponentsByType(get().graph, type);
          },
          
          getComponentsByName: (name: string) => {
            return findComponentsByName(get().graph, name);
          },
          
          getComponentsByRegion: (region: string) => {
            return findComponentsByRegion(get().graph, region);
          },
          
          getAllComponents: () => {
            return get().graph.nodes;
          },
          
          getSelectedComponents: () => {
            const { graph, selection } = get();
            return graph.nodes.filter((node) => selection.selectedIds.includes(node.id));
          },
          
          isSelected: (id: string) => {
            return get().selection.selectedIds.includes(id);
          },
          
          isLocked: (id: string) => {
            return get().selection.lockedIds.includes(id);
          },
          
          getCurrentCheckpoint: () => {
            const { session } = get();
            return session.checkpoints[session.checkpoints.length - 1];
          },
          
          getHistoryAtIndex: (index: number) => {
            const { session } = get();
            return session.history[index];
          },
        },
      }),
      {
        name: 'frozenfigma-store',
        partialize: (state) => ({
          graph: state.graph,
          session: {
            currentTurn: state.session.currentTurn,
            checkpoints: state.session.checkpoints,
            maxHistorySize: state.session.maxHistorySize,
          },
        }),
      }
    ),
    { name: 'FrozenFigma' }
  )
);

// ============================================================================
// EXPORTS
// ============================================================================

export default useStore;