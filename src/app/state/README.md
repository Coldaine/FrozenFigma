# FrozenFigma State Management

This directory contains the complete Zustand-based state management implementation for FrozenFigma.

## Overview

The store is implemented using Zustand with the following features:
- **Graph Management**: Complete control over the UI component graph
- **Selection Management**: Multi-select, hover, and locking functionality
- **Session Management**: History tracking, undo/redo, and checkpoints
- **Persistence**: Automatic localStorage persistence
- **DevTools**: Redux DevTools integration for debugging

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FrozenFigmaStore                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Graph     │  │  Selection   │  │    Session      │  │
│  │   Slice     │  │    Slice     │  │     Slice       │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                 Actions API                         │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  • Graph Operations (add, update, remove, move)     │  │
│  │  • Selection Operations (select, lock, hover)       │  │
│  │  • Session Operations (undo, redo, checkpoints)     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Selectors API                          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  • Query by ID, type, name, region                  │  │
│  │  • Get selected/locked components                   │  │
│  │  • Access history and checkpoints                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────┐              ┌──────────────────────┐
│   localStorage   │              │   Redux DevTools     │
│   Persistence    │              │      Debugging       │
└──────────────────┘              └──────────────────────┘
```

## Usage Examples

### Basic Component Management

```typescript
import { useStore } from './app/state/store';
import { createComponent } from './schema';

// Get store instance
const { actions, selectors } = useStore();

// Add a component
const button = createComponent('button', {
  x: 100,
  y: 100,
  w: 120,
  h: 40,
  region: 'main',
}, {
  props: { label: 'Click me' },
});

actions.addComponent(button);

// Update a component
actions.updateComponent(button.id, {
  props: { label: 'Updated', disabled: false },
});

// Move a component
actions.moveComponent(button.id, 200, 150, 'sidebar');

// Remove a component
actions.removeComponent(button.id, true); // true = cascade delete children
```

### Selection Management

```typescript
// Select a component
actions.selectComponent(componentId);

// Select multiple components
actions.selectMultiple([id1, id2, id3]);

// Toggle selection
actions.toggleSelection(componentId);

// Clear all selections
actions.clearSelection();

// Lock/unlock components
actions.lockComponent(componentId);
actions.unlockComponent(componentId);
actions.toggleLock(componentId);

// Set hovered component (for UI feedback)
actions.setHoveredId(componentId);
```

### Querying Components

```typescript
// Get component by ID
const component = selectors.getComponentById(id);

// Get all components of a specific type
const buttons = selectors.getComponentsByType('button');

// Get components by name
const navButtons = selectors.getComponentsByName('nav-button');

// Get components in a region
const sidebarComponents = selectors.getComponentsByRegion('sidebar');

// Get all selected components
const selected = selectors.getSelectedComponents();

// Check if component is selected or locked
if (selectors.isSelected(id)) {
  // Component is selected
}

if (selectors.isLocked(id)) {
  // Component is locked
}
```

### Session Management

```typescript
// Create a checkpoint
actions.createCheckpoint('Initial layout complete');

// Undo/redo
if (actions.canUndo()) {
  actions.undo();
}

if (actions.canRedo()) {
  actions.redo();
}

// Restore a checkpoint
const checkpoint = selectors.getCurrentCheckpoint();
if (checkpoint) {
  actions.restoreCheckpoint(checkpoint.id);
}

// Clear history
actions.clearHistory();

// Increment turn counter (for AI agent tracking)
actions.incrementTurn();
```

### Command Execution

```typescript
import { createAddCommand, createUpdateCommand } from './schema';

// Execute a single command
const addCommand = createAddCommand(newComponent);
actions.applyCommand(addCommand);

// Execute an edit plan (multiple commands)
const editPlan = {
  id: generateId(),
  description: 'Add header components',
  operations: [
    createAddCommand(logo),
    createAddCommand(navBar),
    createAddCommand(searchBox),
  ],
};

actions.applyEditPlan(editPlan);
```

### React Hook Usage

```typescript
import { useStore } from './app/state/store';

function ComponentPanel() {
  // Subscribe to specific state
  const components = useStore((state) => state.graph.nodes);
  const selectedIds = useStore((state) => state.selection.selectedIds);
  
  // Access actions
  const { actions } = useStore();
  
  return (
    <div>
      {components.map((component) => (
        <ComponentItem
          key={component.id}
          component={component}
          isSelected={selectedIds.includes(component.id)}
          onSelect={() => actions.selectComponent(component.id)}
        />
      ))}
    </div>
  );
}
```

## State Structure

### Graph Slice
```typescript
{
  version: string;          // Schema version
  nodes: ComponentSpec[];   // All components
  tokens?: TokenSet;        // Design tokens (theme)
  meta?: {
    created: string;        // ISO timestamp
    modified: string;       // ISO timestamp
    author?: string;
    description?: string;
  };
}
```

### Selection Slice
```typescript
{
  selectedIds: string[];    // Currently selected component IDs
  hoveredId: string | null; // Currently hovered component
  lockedIds: string[];      // Locked component IDs (can't be edited)
}
```

### Session Slice
```typescript
{
  currentTurn: number;      // Current AI agent turn
  history: HistoryEntry[];  // Command history for undo/redo
  checkpoints: Checkpoint[]; // Saved states
  historyIndex: number;     // Current position in history
  maxHistorySize: number;   // Maximum history entries (default: 100)
}
```

## Middleware

### Persistence Middleware
Automatically saves the following to localStorage:
- Graph state (nodes, tokens, meta)
- Session checkpoints
- Session metadata

**Key:** `frozenfigma-store`

### DevTools Middleware
Enables Redux DevTools integration for debugging:
- Time-travel debugging
- Action inspection
- State diffs
- Action replay

## Performance Considerations

### Immutability
The store uses Immer for immutable updates, ensuring:
- No accidental mutations
- Efficient change detection
- Predictable state updates

### Selective Subscriptions
Use Zustand's selector pattern to subscribe only to needed state:

```typescript
// ❌ Re-renders on any state change
const state = useStore();

// ✅ Only re-renders when selectedIds changes
const selectedIds = useStore((state) => state.selection.selectedIds);
```

### History Management
- History is capped at 100 entries by default
- Use checkpoints for long-term state preservation
- Clear history after checkpoint restoration

## Testing

Tests are located in `src/tests/store.test.ts` and cover:
- ✅ Component CRUD operations
- ✅ Selection management
- ✅ Session history and checkpoints
- ✅ Selectors and queries
- ✅ Command execution

Run tests:
```bash
npm test src/tests/store.test.ts
```

## Extending the Store

### Adding New Actions

```typescript
// In store.ts, add to actions object:
actions: {
  // ... existing actions
  
  myNewAction: (param: string) => {
    set(
      produce((state: FrozenFigmaStore) => {
        // Mutate state using Immer
        state.graph.meta = { ...state.graph.meta, customField: param };
      }),
      false,
      'graph/myNewAction' // Action name for DevTools
    );
  },
}
```

### Adding New Selectors

```typescript
// In store.ts, add to selectors object:
selectors: {
  // ... existing selectors
  
  getCustomData: () => {
    const { graph } = get();
    return graph.meta?.customField;
  },
}
```

## Best Practices

1. **Use Actions**: Always modify state through actions, never directly
2. **Use Selectors**: Query state through selectors for consistency
3. **Batch Updates**: Combine multiple state changes in a single action
4. **Create Checkpoints**: Save important states before major changes
5. **Clear History**: Periodically clear history to prevent memory issues
6. **Type Safety**: Leverage TypeScript types for compile-time safety

## Troubleshooting

### localStorage Warnings in Tests
Expected behavior - Node test environment doesn't have localStorage. Tests use in-memory storage.

### State Not Updating
- Ensure you're using `useStore.getState()` for fresh state in tests
- In React, use the hook properly: `useStore((state) => state.graph)`

### Performance Issues
- Use selective subscriptions
- Clear old history entries
- Avoid large component graphs (>1000 nodes)

## API Reference

See TypeScript interfaces in `store.ts` for complete API documentation:
- `FrozenFigmaStore` - Main store interface
- `GraphActions` - Graph manipulation methods
- `SelectionActions` - Selection management methods
- `SessionActions` - Session and history methods
- `StoreSelectors` - Query methods
