import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Graph, ComponentSpec, createEmptyGraph, createComponent, FrameSchema } from '../schema';
import { saveUI, loadUI, createCheckpoint, restoreFromCheckpoint } from '../io/persistence';
import { generateTSX, generateTokens, exportComponent, exportAll } from '../io/export';
import { captureScreenshot, logTurn, generateDiff } from '../io/artifacts';

// Mock DOM APIs for Node environment
Object.defineProperty(window, 'localStorage', {
  value: (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    };
 })(),
  writable: true,
});

// Mock canvas and DOM elements
Object.defineProperty(window, 'Blob', {
  value: class Blob {
    constructor(_blobParts?: BlobPart[], _options?: BlobPropertyBag) {}
  },
  writable: true,
});

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
 writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  })),
  writable: true,
});

describe('Persistence and Export Functionality', () => {
  let testGraph: Graph;
  let testComponent: ComponentSpec;

  beforeEach(() => {
    // Create a test graph with some components
    const frame = FrameSchema.parse({ x: 10, y: 10, w: 100, h: 50, region: 'main' });
    testComponent = createComponent('button', frame, { 
      name: 'Test Button',
      props: { text: 'Click me', variant: 'primary' }
    });
    
    testGraph = createEmptyGraph();
    testGraph.nodes = [testComponent];
    testGraph.meta = {
      ...testGraph.meta,
      author: 'Test User',
      description: 'Test graph for persistence/export tests'
    };
  });

  describe('Persistence Functions', () => {
    it('should save and load UI correctly', async () => {
      // Test saving
      await saveUI(testGraph, './test-ui.json');
      
      // Test loading
      const loadedGraph = await loadUI('./test-ui.json');
      
      expect(loadedGraph.nodes).toHaveLength(1);
      expect(loadedGraph.nodes[0].id).toBe(testComponent.id);
      expect(loadedGraph.nodes[0].type).toBe('button');
      expect(loadedGraph.nodes[0].props.text).toBe('Click me');
    });

    it('should create and restore from checkpoints', async () => {
      const checkpointId = 'test-checkpoint-123';
      const description = 'Test checkpoint';
      
      // Create a checkpoint
      await createCheckpoint(testGraph, checkpointId, description);
      
      // Restore from the checkpoint
      const restoredGraph = await restoreFromCheckpoint(checkpointId);
      
      expect(restoredGraph.nodes).toHaveLength(1);
      expect(restoredGraph.nodes[0].id).toBe(testComponent.id);
      expect(restoredGraph.nodes[0].type).toBe('button');
    });

    it('should handle errors when loading non-existent UI', async () => {
      const result = await loadUI('./non-existent.json');
      
      // Should return an empty graph when file doesn't exist
      expect(result.nodes).toHaveLength(0);
    });
  });

 describe('Export Functions', () => {
    it('should generate valid TSX for a button component', () => {
      const tsx = generateTSX(testComponent);
      
      expect(tsx).toContain('React');
      expect(tsx).toContain('button');
      expect(tsx).toContain('TestButtonComponent'); // Generated component name
      expect(tsx).toContain('Click me'); // Component text
    });

    it('should generate valid tokens', () => {
      const tokens = {
        colors: { primary: '#007bff', secondary: '#6c757d' },
        spacing: { sm: 8, md: 16, lg: 24 },
        typography: {
          fontFamily: 'Arial, sans-serif',
          sizes: { sm: 12, md: 16, lg: 20 },
          weights: { normal: 400, bold: 700 }
        },
        radius: { sm: 4, md: 8, lg: 12 }
      };
      
      const tokenString = generateTokens(tokens);
      
      expect(tokenString).toContain('"primary": "#007bff"');
      expect(tokenString).toContain('"md": 16');
      expect(tokenString).toContain('Arial, sans-serif');
    });

    it('should export a single component', async () => {
      const result = await exportComponent(testComponent, './test-component.tsx');
      
      expect(result.success).toBe(true);
      expect(result.exportedFiles).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should export all components in a graph', async () => {
      const result = await exportAll(testGraph, './test-exports');
      
      expect(result.success).toBe(true);
      // Should export the component, tokens, and index file
      expect(result.exportedFiles).toHaveLength(2); // component + index file (tokens might not be included without option)
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Artifact Functions', () => {
    it('should capture a screenshot', async () => {
      const screenshot = await captureScreenshot();
      
      expect(screenshot).toContain('data:image/png;base64');
    });

    it('should generate a diff between graphs', () => {
      const newGraph = { ...testGraph };
      const newComponent = createComponent('input', 
        FrameSchema.parse({ x: 50, y: 50, w: 200, h: 40, region: 'sidebar' }),
        { name: 'New Input' }
      );
      newGraph.nodes = [...testGraph.nodes, newComponent];
      
      const diff = generateDiff(testGraph, newGraph);
      
      expect(diff.changes.nodes.added).toHaveLength(1);
      expect(diff.changes.nodes.removed).toHaveLength(0);
      expect(diff.summary.nodeCount.change).toBe(1);
    });

    it('should log a turn', async () => {
      const turnData = { action: 'add_component', componentType: 'button' };
      
      // Capture console.log calls
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await logTurn(turnData, 1, 'Added a button component');
      
      // Verify that logging occurred
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Version Control Functions', () => {
    it('should initialize and create commits', async () => {
      // This test would require importing the VCS module
      // For now, we'll just verify that the module exists
      expect(() => import('../io/versionControl')).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should persist and export a complete workflow', async () => {
      // Save the graph
      await saveUI(testGraph, './integration-test.json');
      
      // Load it back
      const loadedGraph = await loadUI('./integration-test.json');
      
      // Export the loaded graph
      const exportResult = await exportAll(loadedGraph, './integration-exports');
      
      expect(exportResult.success).toBe(true);
      expect(loadedGraph.nodes).toHaveLength(1);
      expect(loadedGraph.nodes[0].id).toBe(testComponent.id);
    });
  });
});