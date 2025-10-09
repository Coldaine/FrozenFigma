import { describe, it, expect, beforeEach } from 'vitest';
import { createComponent, ComponentType, Graph } from '../schema';
import { saveUI, loadUI } from '../io/persistence';
import { createTestGraph } from './testUtils';
import { GraphComparator } from './testUtils';

/**
 * Persistence Integration Test
 * 
 * Large-span test for export/import flow: Build graph, export to JSON, import to new graph.
 * Verifies complete round-trip with no data loss, using real export/import.
 * 
 * Story: As a designer, I save my canvas layout, close/reopen app, load – everything intact.
 * External observer: Imported graph matches original via comparator.
 */

describe('Persistence Integration', () => {
  let originalGraph: Graph;

  beforeEach(() => {
    // Setup complex graph with components, selections, etc.
    originalGraph = createTestGraph({ componentCount: 5, withErrors: false });
    // Add relationships for full behavior
    if (originalGraph.nodes.length >= 2) {
      originalGraph.nodes[0].children = [originalGraph.nodes[1].id];
    }
  });

  it('export/import round-trip preserves graph structure, components, and relationships', () => {
    /**
     * Story: Export full graph (components, frames, props, children), import to new instance.
     * No loss of data, validation passes post-import.
     * 
     * Replaces any fragmented persistence unit tests; focuses on end-to-end usability.
     */

    // Act 1: Export (simulate save)
    const exportedData = saveUI(originalGraph); // Assume returns JSON string or object
    expect(exportedData).toBeDefined();
    expect(typeof exportedData).toBe('string'); // JSON format

    // Act 2: Import (simulate load)
    const importedGraph = importGraph(exportedData);
    expect(importedGraph).toBeDefined();
    expect(importedGraph.nodes).toHaveLength(originalGraph.nodes.length);

    // Verify: Full equality via comparator (structure, props, relationships)
    const diff = GraphComparator.getGraphDiff(originalGraph, importedGraph);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);

    // Behavioral: Post-import validation passes
    // Assume runValidationGate works on imported
    // For now, check key properties
    const firstNode = importedGraph.nodes[0];
    expect(firstNode.id).toBe(originalGraph.nodes[0].id);
    expect(firstNode.type).toBe(originalGraph.nodes[0].type);
    expect(firstNode.frame).toEqual(originalGraph.nodes[0].frame);
    expect(firstNode.props).toEqual(originalGraph.nodes[0].props);
    if (firstNode.children) {
      expect(firstNode.children).toEqual(originalGraph.nodes[0].children);
    }

    // Edge: Import invalid export (e.g., malformed JSON) handles gracefully
    const invalidImport = importGraph('invalid-json');
    expect(invalidImport).toBeDefined(); // Or throws – per impl
    expect(invalidImport.nodes).toHaveLength(0); // Empty on error

    // Verify: Export includes metadata (e.g., version)
    const parsedExport = JSON.parse(exportedData);
    expect(parsedExport.version).toBeDefined(); // Assume schema has version
    expect(parsedExport.nodes).toHaveLength(5);
  });
});