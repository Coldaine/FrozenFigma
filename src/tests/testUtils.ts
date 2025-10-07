/**
 * Test utilities and helpers for the FrozenFigma validation gates and testing infrastructure.
 */

import { Graph, ComponentSpec, ComponentType, createEmptyGraph, createComponent, generateId } from '../schema';

/**
 * Creates a test graph with various component types for validation testing.
 */
export function createTestGraph(options?: {
  componentCount?: number;
  withErrors?: boolean;
  withWarnings?: boolean;
}): Graph {
  const graph = createEmptyGraph();
  
  const componentCount = options?.componentCount || 5;
  
 for (let i = 0; i < componentCount; i++) {
    const type: ComponentType = ['button', 'slider', 'toggle', 'card', 'input'][i % 5] as ComponentType;
    
    const component = createComponent(type, {
      x: i * 100,
      y: i * 50,
      w: 120,
      h: 40,
      region: 'main'
    }, {
      name: `test-component-${i}`,
      props: {
        label: `Test ${type} ${i}`,
        value: i * 10
      }
    });
    
    graph.nodes.push(component);
  }
  
  // Add error conditions if requested
  if (options?.withErrors) {
    // Add a duplicate ID to create an error
    const duplicateComponent = { ...graph.nodes[0], id: graph.nodes[0].id };
    graph.nodes.push(duplicateComponent);
    
    // Add a component with invalid dimensions
    const invalidComponent = createComponent('button', {
      x: 100000, // Out of bounds
      y: 100,
      w: 0, // Invalid width
      h: 0, // Invalid height
      region: 'main'
    });
    graph.nodes.push(invalidComponent);
  }
  
 // Add warning conditions if requested
  if (options?.withWarnings) {
    // Add a component with no props
    const noPropsComponent = createComponent('button', {
      x: 100,
      y: 100,
      w: 120,
      h: 40,
      region: 'main'
    }, {
      name: 'no-props-component'
    });
    graph.nodes.push(noPropsComponent);
    
    // Add a very small component
    const smallComponent = createComponent('button', {
      x: 200,
      y: 200,
      w: 5, // Very small
      h: 5, // Very small
      region: 'main'
    });
    graph.nodes.push(smallComponent);
  }
  
  return graph;
}

/**
 * Creates a graph with overlapping components for testing overlap detection.
 */
export function createOverlappingGraph(): Graph {
  const graph = createEmptyGraph();
  
  // Create overlapping components
  const comp1 = createComponent('button', {
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    region: 'main'
  }, {
    name: 'overlapping-comp-1'
  });
  
  const comp2 = createComponent('card', {
    x: 150, // Overlaps with comp1
    y: 150, // Overlaps with comp1
    w: 100,
    h: 100,
    region: 'main'
  }, {
    name: 'overlapping-comp-2'
  });
  
  graph.nodes.push(comp1, comp2);
  return graph;
}

/**
 * Creates a graph with valid component relationships (parent-child).
 */
export function createGraphWithRelationships(): Graph {
  const graph = createEmptyGraph();
  
  // Create parent component
  const parent = createComponent('card', {
    x: 100,
    y: 100,
    w: 300,
    h: 200,
    region: 'main'
  }, {
    name: 'parent-card',
    children: []
  });
  
  // Create child components
  const child1 = createComponent('button', {
    x: 120,
    y: 120,
    w: 100,
    h: 40,
    region: 'main'
  }, {
    name: 'child-button-1'
  });
  
  const child2 = createComponent('input', {
    x: 120,
    y: 180,
    w: 100,
    h: 40,
    region: 'main'
  }, {
    name: 'child-input-1'
  });
  
  // Update parent to reference children
  parent.children = [child1.id, child2.id];
  
  graph.nodes.push(parent, child1, child2);
  return graph;
}

/**
 * Simulates user interactions for testing UI components.
 */
export class InteractionSimulator {
  static async simulateClick(element: HTMLElement): Promise<void> {
    element.click();
  }
  
  static async simulateHover(element: HTMLElement): Promise<void> {
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  }
  
  static async simulateInput(element: HTMLInputElement, value: string): Promise<void> {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  static async simulateDrag(element: HTMLElement, fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
    element.dispatchEvent(new MouseEvent('mousedown', { 
      bubbles: true, 
      clientX: fromX, 
      clientY: fromY 
    }));
    
    element.dispatchEvent(new MouseEvent('mousemove', { 
      bubbles: true, 
      clientX: toX, 
      clientY: toY 
    }));
    
    element.dispatchEvent(new MouseEvent('mouseup', { 
      bubbles: true, 
      clientX: toX, 
      clientY: toY 
    }));
  }
}

/**
 * Mock implementation for testing purposes.
 */
export class MockStore {
  private graph: Graph;
  
  constructor(initialGraph?: Graph) {
    this.graph = initialGraph || createEmptyGraph();
  }
  
  getGraph(): Graph {
    return { ...this.graph };
  }
  
  setGraph(graph: Graph): void {
    this.graph = { ...graph };
  }
  
 addComponent(component: ComponentSpec): void {
    this.graph.nodes.push({ ...component });
  }
  
  removeComponent(id: string): boolean {
    const initialLength = this.graph.nodes.length;
    this.graph.nodes = this.graph.nodes.filter(node => node.id !== id);
    return initialLength > this.graph.nodes.length;
  }
  
  updateComponent(id: string, updates: Partial<ComponentSpec>): boolean {
    const index = this.graph.nodes.findIndex(node => node.id === id);
    if (index !== -1) {
      this.graph.nodes[index] = { ...this.graph.nodes[index], ...updates };
      return true;
    }
    return false;
  }
}

/**
 * Utility for creating mock implementations of various system components.
 */
export class MockFactory {
  static createMockComponent(type: ComponentType, overrides?: Partial<ComponentSpec>): ComponentSpec {
    const baseComponent = createComponent(type, {
      x: Math.random() * 100,
      y: Math.random() * 100,
      w: 120,
      h: 40,
      region: 'main'
    });
    
    return { ...baseComponent, ...overrides } as ComponentSpec;
 }
  
  static createMockId(): string {
    return generateId();
  }
  
  static createMockGraph(nodesCount: number = 1): Graph {
    const graph = createEmptyGraph();
    
    for (let i = 0; i < nodesCount; i++) {
      graph.nodes.push(
        this.createMockComponent(
          ['button', 'slider', 'toggle', 'card', 'input'][i % 5] as ComponentType,
          { name: `mock-component-${i}` }
        )
      );
    }
    
    return graph;
  }
}

/**
 * Utility for comparing graphs and components.
 */
export class GraphComparator {
  static graphsEqual(graph1: Graph, graph2: Graph): boolean {
    if (graph1.nodes.length !== graph2.nodes.length) {
      return false;
    }
    
    // Compare nodes by ID
    const ids1 = graph1.nodes.map(n => n.id).sort();
    const ids2 = graph2.nodes.map(n => n.id).sort();
    
    if (JSON.stringify(ids1) !== JSON.stringify(ids2)) {
      return false;
    }
    
    // Compare each node
    for (const node1 of graph1.nodes) {
      const node2 = graph2.nodes.find(n => n.id === node1.id);
      if (!node2 || !this.componentsEqual(node1, node2)) {
        return false;
      }
    }
    
    return true;
  }
  
  static componentsEqual(comp1: ComponentSpec, comp2: ComponentSpec): boolean {
    return JSON.stringify(comp1) === JSON.stringify(comp2);
  }
  
  static getGraphDiff(graph1: Graph, graph2: Graph): { added: ComponentSpec[], removed: ComponentSpec[], modified: ComponentSpec[] } {
    const result = {
      added: [] as ComponentSpec[],
      removed: [] as ComponentSpec[],
      modified: [] as ComponentSpec[]
    };
    
    const ids1 = new Set(graph1.nodes.map(n => n.id));
    const ids2 = new Set(graph2.nodes.map(n => n.id));
    
    // Find added and modified
    for (const node of graph2.nodes) {
      if (!ids1.has(node.id)) {
        result.added.push(node);
      } else {
        const originalNode = graph1.nodes.find(n => n.id === node.id);
        if (originalNode && !this.componentsEqual(originalNode, node)) {
          result.modified.push(node);
        }
      }
    }
    
    // Find removed
    for (const node of graph1.nodes) {
      if (!ids2.has(node.id)) {
        result.removed.push(node);
      }
    }
    
    return result;
  }
}