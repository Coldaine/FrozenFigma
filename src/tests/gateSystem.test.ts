import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyGraph, createComponent, ComponentType } from '../schema';
import { runValidationGate } from '../agent/validator';
import { runLint } from '../agent/validator/lint';
import { runTypeCheck } from '../agent/validator/types';
import { runUnitTests } from '../agent/validator/unit';
import { runSmokeTests } from '../agent/validator/smoke';
import { runValidationGates } from '../agent/validator/gateRunner';
import { createTestGraph } from './testUtils';

describe('Gate System Tests', () => {
  describe('Individual Gates', () => {
    let validGraph: ReturnType<typeof createEmptyGraph>;
    
    beforeEach(() => {
      validGraph = createEmptyGraph();
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' }, {
        name: 'test-button',
        props: { label: 'Test Button' }
      });
      validGraph.nodes.push(button);
    });

    it('should pass lint gate with valid graph', async () => {
      const result = runLint(validGraph);
      expect(result.passed).toBe(true);
    });

    it('should pass type check gate with valid graph', async () => {
      const result = runTypeCheck(validGraph);
      expect(result.passed).toBe(true);
    });

    it('should pass unit test gate with valid graph', async () => {
      const result = await runUnitTests(validGraph);
      expect(result.passed).toBe(true);
    });

    it('should pass smoke test gate with valid graph', async () => {
      const result = runSmokeTests(validGraph);
      expect(result.passed).toBe(true);
    });
  });

  describe('Gate Integration', () => {
    it('should run all gates successfully with valid graph', async () => {
      const graph = createTestGraph({ componentCount: 3 });
      const result = await runValidationGates(graph);
      
      expect(result.passed).toBe(true);
      expect(result.gateResults.schema).toBe(true);
      expect(result.gateResults.lint).toBe(true);
      expect(result.gateResults.types).toBe(true);
      expect(result.gateResults.unit).toBe(true);
      expect(result.gateResults.smoke).toBe(true);
    });

    it('should fail when one gate fails', async () => {
      // Create a graph with errors
      const graph = createTestGraph({ componentCount: 2, withErrors: true });
      const result = await runValidationGates(graph);
      
      expect(result.passed).toBe(false);
      // At least one gate should have failed
      const failedGates = Object.values(result.gateResults).filter(r => !r);
      expect(failedGates.length).toBeGreaterThan(0);
    });

    it('should run specific gates when specified', async () => {
      const graph = createTestGraph({ componentCount: 2 });
      const result = await runValidationGates(graph, { gates: ['lint', 'types'] });
      
      // Only the specified gates should have run
      expect(result.gateResults.schema).toBe(false); // Not run
      expect(result.gateResults.lint).toBe(true);    // Run and passed
      expect(result.gateResults.types).toBe(true);   // Run and passed
      expect(result.gateResults.unit).toBe(false);   // Not run
      expect(result.gateResults.smoke).toBe(false);  // Not run
    });
  });

  describe('Validator Integration', () => {
    it('should validate a simple graph successfully', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' }, {
        name: 'test-button',
        props: { label: 'Test Button' }
      });
      graph.nodes.push(button);
      
      const result = await runValidationGate(graph);
      expect(result.passed).toBe(true);
      expect(result.gateResults.schema).toBe(true);
      expect(result.gateResults.lint).toBe(true);
      expect(result.gateResults.types).toBe(true);
      expect(result.gateResults.unit).toBe(true);
      expect(result.gateResults.smoke).toBe(true);
    });

    it('should fail validation when graph has duplicate IDs', async () => {
      const graph = createEmptyGraph();
      const button1 = createComponent('button', { x: 10, y: 100, w: 120, h: 40, region: 'main' }, {
        name: 'test-button',
        props: { label: 'Test Button' }
      });
      const button2 = { ...button1 }; // Duplicate ID
      graph.nodes.push(button1, button2);
      
      const result = await runValidationGate(graph);
      expect(result.passed).toBe(false);
      // Schema gate should fail due to duplicate IDs
      expect(result.gateResults.schema).toBe(false);
    });

    it('should fail validation when graph has out-of-bounds components', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 99999, y: 100, w: 120, h: 40, region: 'main' }, {
        name: 'out-of-bounds-button',
        props: { label: 'Out of Bounds' }
      });
      graph.nodes.push(button);
      
      const result = await runValidationGate(graph);
      expect(result.passed).toBe(false);
      // Smoke gate should fail due to out-of-bounds coordinates
      expect(result.gateResults.smoke).toBe(false);
    });
  });

  describe('Gate Diagnostics', () => {
    it('should generate appropriate diagnostics for lint issues', () => {
      const graph = createEmptyGraph();
      // Component with no props should generate a lint warning
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      
      const result = runLint(graph);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics.some((d: any) => d.gate === 'lint')).toBe(true);
      expect(result.diagnostics.some((d: any) => d.severity === 'warning')).toBe(true);
    });

    it('should generate appropriate diagnostics for type issues', () => {
      const graph = createEmptyGraph();
      // Create a component with invalid structure to trigger type validation
      const invalidComponent = {
        id: 'test-id',
        type: 'button',
        frame: { x: 10, y: 100, w: 120, h: 40, region: 'main' },
        props: 'invalid-props' // Should be an object, not a string
      };
      // @ts-ignore - intentionally invalid structure for testing
      graph.nodes.push(invalidComponent);
      
      const result = runTypeCheck(graph);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics.some((d: any) => d.gate === 'types')).toBe(true);
      expect(result.diagnostics.some((d: any) => d.severity === 'error')).toBe(true);
    });

    it('should aggregate diagnostics from all gates', async () => {
      const graph = createTestGraph({ componentCount: 2, withErrors: true, withWarnings: true });
      const result = await runValidationGate(graph);
      
      // Should have diagnostics from multiple gates
      const gateTypes = [...new Set(result.diagnostics.map((d: any) => d.gate))];
      expect(gateTypes.length).toBeGreaterThan(1);
      
      // Should have both errors and warnings
      const severities = [...new Set(result.diagnostics.map((d: any) => d.severity))];
      expect(severities).toContain('error');
      expect(severities).toContain('warning');
    });
  });

  describe('Gate Runner Options', () => {
    it('should continue on error when continueOnError is true', async () => {
      const graph = createTestGraph({ componentCount: 1, withErrors: true });
      const result = await runValidationGates(graph, { continueOnError: true });
      
      // Should run all gates even if some fail
      expect(result.gateResults.schema).toBe(false);
      // Other gates may or may not run depending on the failure point
    });

    it('should run gates in correct sequence', async () => {
      const graph = createTestGraph({ componentCount: 1 });
      const result = await runValidationGates(graph);
      
      // All gates should pass in sequence
      expect(result.gateResults.schema).toBe(true);
      expect(result.gateResults.lint).toBe(true);
      expect(result.gateResults.types).toBe(true);
      expect(result.gateResults.unit).toBe(true);
      expect(result.gateResults.smoke).toBe(true);
      expect(result.passed).toBe(true);
    });
  });
});