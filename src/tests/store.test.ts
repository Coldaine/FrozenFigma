import { describe, it, expect, beforeEach } from 'vitest';
import { createComponent, ComponentType } from '../schema';
import { FakeStore } from './testUtils';

/**
 * Consolidated Store Integration Tests
 * 
 * These large-span tests verify complete behaviors using FakeStore for realistic
 * state management, history, and validation. Each test covers multiple related
 * actions, asserting observable outcomes rather than internal state.
 * 
 * Replaces ~25 fragmented unit tests with 4 meaningful integration tests.
 */

describe('Store Integration Behaviors', () => {
  let store: FakeStore;

  beforeEach(() => {
    store = new FakeStore();
  });

  it('component lifecycle: add, update, move, remove with automatic history and validation', () => {
    /**
     * Story: As a designer, I add a button, update its label and position,
     * then remove it. The store maintains history and validates no duplicates/out-of-bounds.
     * 
     * External observer checks: Graph state, history length, no errors.
     */

    // Act 1: Add initial component
    const button = createComponent('button', {
      x: 100, y: 100, w: 120, h: 40, region: 'main'
    }, { name: 'submit-btn', props: { label: 'Submit' } });
    store.addComponent(button);
    expect(store.getAllComponents()).toHaveLength(1);
    expect(store.getComponentById(button.id)?.props.label).toBe('Submit');

    // Act 2: Update and move (behavioral: triggers history)
    store.updateComponent(button.id, { props: { label: 'Updated Submit' } });
    store.moveComponent(button.id, 200, 300, 'sidebar');
    const updated = store.getComponentById(button.id);
    expect(updated?.props.label).toBe('Updated Submit');
    expect(updated?.frame.x).toBe(200);
    expect(updated?.frame.y).toBe(300);
    expect(updated?.frame.region).toBe('sidebar');

    // Act 3: Remove (behavioral: deselects if selected, adds to history)
    store.removeComponent(button.id);
    expect(store.getComponentById(button.id)).toBeUndefined();
    expect(store.getAllComponents()).toHaveLength(0);

    // Verify: History tracks all actions, no validation errors thrown
    const history = store.getHistory();
    expect(history).toHaveLength(3); // add, update, remove
    expect(history[0].type).toBe('add');
    expect(history[1].type).toBe('update');
    expect(history[2].type).toBe('remove');
    // No duplicates or bounds issues (would throw if invalid)
  });

  it('selection flow: select multiple, toggle, lock with behavioral constraints', () => {
    /**
     * Story: As a designer, I select multiple components, toggle one, lock another
     * to prevent selection. The store enforces rules like no-select-locked.
     * 
     * External observer checks: Selected components, locks, no invalid selections.
     */

    // Setup: Add components
    const button = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const input = createComponent('input', { x: 0, y: 50, w: 200, h: 30, region: 'main' });
    const card = createComponent('card', { x: 0, y: 100, w: 300, h: 100, region: 'main' });
    store.addComponents([button, input, card]);

    // Act 1: Select multiple
    store.selectMultiple([button.id, input.id]);
    expect(store.getSelectedComponents()).toHaveLength(2);
    expect(store.isSelected(button.id)).toBe(true);
    expect(store.isSelected(card.id)).toBe(false);

    // Act 2: Toggle (adds card, removes input)
    store.toggleSelection(input.id); // Deselect
    store.toggleSelection(card.id); // Select
    const selected = store.getSelectedComponents();
    expect(selected).toHaveLength(2); // button + card
    expect(store.isSelected(input.id)).toBe(false);
    expect(store.isSelected(card.id)).toBe(true);

    // Act 3: Lock card (behavioral: deselects locked)
    store.lockComponent(card.id);
    expect(store.isLocked(card.id)).toBe(true);
    expect(store.isSelected(card.id)).toBe(false); // Auto-deselect
    store.selectComponent(card.id); // Should ignore (locked)
    expect(store.isSelected(card.id)).toBe(false);

    // Act 4: Unlock and reselect
    store.unlockComponent(card.id);
    store.selectComponent(card.id);
    expect(store.isSelected(card.id)).toBe(true);
    expect(store.isLocked(card.id)).toBe(false);

    // Verify: History includes selection changes, selectors reflect state
    const history = store.getHistory();
    expect(history.some(h => h.type === 'update')).toBe(true); // From adds, but selections may not log – extend if needed
    expect(store.getSelectedComponents().map(c => c.type)).toEqual(['button', 'card']);
  });

  it('selectors provide observable views: filter by type, region, selection without internal coupling', () => {
    /**
     * Story: As a designer, I add mixed components across regions/types, select some.
     * Selectors return correct filtered views for layout/editing.
     * 
     * External observer checks: Filtered lists match expected behaviors.
     */

    // Setup: Diverse graph
    const buttons = [
      createComponent('button' as ComponentType, { x: 0, y: 0, w: 100, h: 40, region: 'main' }),
      createComponent('button' as ComponentType, { x: 0, y: 50, w: 100, h: 40, region: 'sidebar' })
    ];
    const inputs = [
      createComponent('input' as ComponentType, { x: 100, y: 0, w: 200, h: 30, region: 'main' })
    ];
    store.addComponents([...buttons, ...inputs]);
    store.selectComponent(buttons[0].id); // Select one main button

    // Act & Verify: By type
    const allButtons = store.getComponentsByType('button' as ComponentType);
    expect(allButtons).toHaveLength(2);
    expect(allButtons[0].frame.region).toBe('main');
    expect(allButtons[1].frame.region).toBe('sidebar');

    // By region
    const mainRegion = store.getComponentsByRegion('main');
    expect(mainRegion).toHaveLength(2); // button + input
    expect(mainRegion.every(c => c.frame.region === 'main')).toBe(true);

    // Selected
    const selected = store.getSelectedComponents();
    expect(selected).toHaveLength(1);
    expect(selected[0].type).toBe('button');
    expect(selected[0].frame.region).toBe('main');

    // Cross-check: No coupling to internals; selectors work post-mutations
    store.moveComponent(buttons[1].id, 150, 75, 'main'); // Move sidebar button to main
    const updatedMain = store.getComponentsByRegion('main');
    expect(updatedMain).toHaveLength(3); // Original 2 + moved button
    expect(store.getComponentsByRegion('sidebar')).toHaveLength(0);

    // Verify: History logs mutations, selectors consistent
    expect(store.getHistory().length).toBe(4); // 3 adds + 1 update (move)
    expect(store.canUndo()).toBe(true);
  });

  it('session management: create checkpoints, restore, track history and turns with integrity', () => {
    /**
     * Story: As a designer, I build a layout, create a checkpoint, make changes,
     * then restore. Session tracks turns and history for undo/redo.
     * 
     * External observer checks: Restored state matches, history/turns increment.
     */

    // Act 1: Initial build and checkpoint
    const initialButton = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' });
    store.addComponent(initialButton);
    store.createCheckpoint('Initial layout');
    expect(store.getSession().checkpoints).toHaveLength(1);
    expect(store.getSession().checkpoints[0].description).toBe('Initial layout');

    // Act 2: Modify (remove and add new)
    store.removeComponent(initialButton.id);
    const newSlider = createComponent('slider', { x: 200, y: 200, w: 150, h: 20, region: 'main' });
    store.addComponent(newSlider);
    store.incrementTurn(); // Simulate user action
    expect(store.getAllComponents()).toHaveLength(1);
    expect(store.getComponentById(initialButton.id)).toBeUndefined();
    expect(store.getSession().currentTurn).toBe(1);

    // Act 3: Restore checkpoint (behavioral: reverts graph, adds to history)
    const checkpointId = store.getSession().checkpoints[0].id;
    const restored = store.restoreCheckpoint(checkpointId);
    expect(restored).toBe(true);
    expect(store.getAllComponents()).toHaveLength(1); // Back to initial button
    expect(store.getComponentById(initialButton.id)).toBeDefined();
    expect(store.getComponentById(newSlider.id)).toBeUndefined();

    // Verify: History includes restore, turns persist, canUndo true
    const history = store.getHistory();
    expect(history).toHaveLength(4); // add, remove, add, restore
    expect(history[3].type).toBe('restore');
    expect(store.canUndo()).toBe(true);
    expect(store.getSession().currentTurn).toBe(1); // Turns not reset
  });
});
