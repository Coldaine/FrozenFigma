import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../app/state/store';
import { createComponent, ComponentType } from '../schema';

describe('FrozenFigma Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useStore.getState();
    store.actions.resetGraph();
    store.actions.clearSelection();
    store.actions.clearHistory();
  });

  describe('Graph Actions', () => {
    it('should add a component to the graph', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);

      const result = useStore.getState().selectors.getComponentById(component.id);
      expect(result).toBeDefined();
      expect(result?.type).toBe('button');
    });

    it('should update a component', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.updateComponent(component.id, {
        props: { label: 'Click me' },
      });

      const result = useStore.getState().selectors.getComponentById(component.id);
      expect(result?.props.label).toBe('Click me');
    });

    it('should remove a component', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      expect(useStore.getState().selectors.getComponentById(component.id)).toBeDefined();

      store.actions.removeComponent(component.id);
      expect(useStore.getState().selectors.getComponentById(component.id)).toBeUndefined();
    });

    it('should move a component', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.moveComponent(component.id, 200, 300, 'sidebar');

      const result = useStore.getState().selectors.getComponentById(component.id);
      expect(result?.frame.x).toBe(200);
      expect(result?.frame.y).toBe(300);
      expect(result?.frame.region).toBe('sidebar');
    });

    it('should add multiple components', () => {
      const store = useStore.getState();
      const components = [
        createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' }),
        createComponent('input', { x: 0, y: 50, w: 200, h: 30, region: 'main' }),
      ];

      store.actions.addComponents(components);

      const allComponents = useStore.getState().selectors.getAllComponents();
      expect(allComponents).toHaveLength(2);
    });
  });

  describe('Selection Actions', () => {
    it('should select a component', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.selectComponent(component.id);

      expect(useStore.getState().selectors.isSelected(component.id)).toBe(true);
    });

    it('should deselect a component', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.selectComponent(component.id);
      store.actions.deselectComponent(component.id);

      expect(useStore.getState().selectors.isSelected(component.id)).toBe(false);
    });

    it('should select multiple components', () => {
      const store = useStore.getState();
      const components = [
        createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' }),
        createComponent('input', { x: 0, y: 50, w: 200, h: 30, region: 'main' }),
      ];

      store.actions.addComponents(components);
      store.actions.selectMultiple(components.map((c) => c.id));

      expect(useStore.getState().selection.selectedIds).toHaveLength(2);
    });

    it('should toggle selection', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.toggleSelection(component.id);
      expect(useStore.getState().selectors.isSelected(component.id)).toBe(true);

      store.actions.toggleSelection(component.id);
      expect(useStore.getState().selectors.isSelected(component.id)).toBe(false);
    });

    it('should lock and unlock components', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.lockComponent(component.id);
      expect(useStore.getState().selectors.isLocked(component.id)).toBe(true);

      store.actions.unlockComponent(component.id);
      expect(useStore.getState().selectors.isLocked(component.id)).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should get components by type', () => {
      const store = useStore.getState();
      const components = [
        createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' }),
        createComponent('button', { x: 0, y: 50, w: 100, h: 40, region: 'main' }),
        createComponent('input', { x: 0, y: 100, w: 200, h: 30, region: 'main' }),
      ];

      store.actions.addComponents(components);

      const buttons = useStore.getState().selectors.getComponentsByType('button' as ComponentType);
      expect(buttons).toHaveLength(2);
    });

    it('should get components by region', () => {
      const store = useStore.getState();
      const components = [
        createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'sidebar' }),
        createComponent('input', { x: 0, y: 50, w: 200, h: 30, region: 'main' }),
      ];

      store.actions.addComponents(components);

      const sidebarComponents = useStore.getState().selectors.getComponentsByRegion('sidebar');
      expect(sidebarComponents).toHaveLength(1);
      expect(sidebarComponents[0].type).toBe('button');
    });

    it('should get selected components', () => {
      const store = useStore.getState();
      const components = [
        createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' }),
        createComponent('input', { x: 0, y: 50, w: 200, h: 30, region: 'main' }),
      ];

      store.actions.addComponents(components);
      store.actions.selectComponent(components[0].id);

      const selected = useStore.getState().selectors.getSelectedComponents();
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe(components[0].id);
    });
  });

  describe('Session Actions', () => {
    it('should create and restore checkpoints', () => {
      const store = useStore.getState();
      const component = createComponent('button', {
        x: 100,
        y: 100,
        w: 120,
        h: 40,
        region: 'main',
      });

      store.actions.addComponent(component);
      store.actions.createCheckpoint('Initial state');

      const checkpoint = useStore.getState().selectors.getCurrentCheckpoint();
      expect(checkpoint).toBeDefined();
      expect(checkpoint?.description).toBe('Initial state');

      // Modify graph
      store.actions.removeComponent(component.id);
      expect(useStore.getState().selectors.getComponentById(component.id)).toBeUndefined();

      // Restore checkpoint
      if (checkpoint) {
        store.actions.restoreCheckpoint(checkpoint.id);
        expect(useStore.getState().selectors.getComponentById(component.id)).toBeDefined();
      }
    });

    it('should track history', () => {
      const initialHistory = useStore.getState().session.history;
      expect(initialHistory).toHaveLength(0);
      expect(useStore.getState().actions.canUndo()).toBe(false);
    });

    it('should increment turn counter', () => {
      const initialTurn = useStore.getState().session.currentTurn;

      useStore.getState().actions.incrementTurn();
      
      expect(useStore.getState().session.currentTurn).toBe(initialTurn + 1);
    });
  });
});
