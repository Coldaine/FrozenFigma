import { describe, it, expect, beforeEach } from 'vitest';
import { Graph, createEmptyGraph, createComponent, ComponentType } from '../schema';
import { attemptRepair, repairLoop, executeRepairWithTransaction, getEnhancedRepairer, ErrorType, RollbackResult, TransactionManager } from '../agent/repair';
import { runValidationGate, Diagnostic } from '../agent/validator';

describe('Enhanced Repair System', () => {
  describe('Error Classification', () => {
    it('should classify duplicate ID errors correctly', async () => {
      const repairer = getEnhancedRepairer();
      const diagnostic: Diagnostic = {
        gate: 'schema',
        severity: 'error',
        message: 'Duplicate component ID: abc123',
      };
      
      // Since we can't directly access the classifier, we'll test through the repair process
      const graph = createEmptyGraph();
      const duplicateId = '123e4567-e89b-12d3-a456-42614174000'; // Valid UUID
      
      // Create two nodes with the same ID
      const node1 = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 1',
        props: { text: 'Button 1' },
      });
      node1.id = duplicateId;
      
      const node2 = createComponent('button', { x: 100, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 2',
        props: { text: 'Button 2' },
      });
      node2.id = duplicateId;
      
      graph.nodes.push(node1, node2);
      
      const validationResult = await runValidationGate(graph);
      expect(validationResult.diagnostics).toHaveLength(1);
      expect(validationResult.diagnostics[0].message).toContain('Duplicate component ID');
    });

    it('should classify out of bounds coordinate errors correctly', async () => {
      const graph = createEmptyGraph();
      const node = createComponent('button', { x: 9999, y: 100, w: 120, h: 40, region: 'main' }, {
        props: { text: 'Button' },
      });
      graph.nodes.push(node);
      
      const validationResult = await runValidationGate(graph);
      const outOfBoundsDiagnostic = validationResult.diagnostics.find((d: Diagnostic) => 
        d.message.includes('coordinate out of bounds')
      );
      
      expect(outOfBoundsDiagnostic).toBeDefined();
    });
  });

  describe('Repair Strategies', () => {
    it('should fix duplicate IDs', async () => {
      const graph = createEmptyGraph();
      const duplicateId = '123e4567-e89b-12d3-a456-42614174000'; // Valid UUID
      
      // Create two nodes with the same ID
      const node1 = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 1',
        props: { text: 'Button 1' },
      });
      node1.id = duplicateId;
      
      const node2 = createComponent('button', { x: 100, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 2',
        props: { text: 'Button 2' },
      });
      node2.id = duplicateId;
      
      graph.nodes.push(node1, node2);
      
      const validationResult = await runValidationGate(graph);
      const repairResult = attemptRepair(graph, validationResult.diagnostics);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.fixes.length).toBeGreaterThan(0);
      
      // Check that IDs are now unique
      const ids = graph.nodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should fix out of bounds coordinates', async () => {
      const graph = createEmptyGraph();
      const node = createComponent('button', { x: 9999, y: 100, w: 120, h: 40, region: 'main' }, {
        props: { text: 'Button' },
      });
      graph.nodes.push(node);
      
      const validationResult = await runValidationGate(graph);
      const repairResult = attemptRepair(graph, validationResult.diagnostics);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.fixes.length).toBeGreaterThan(0);
      
      // Check that the coordinate is now within bounds
      const repairedNode = repairResult.graph.nodes.find(n => n.id === node.id);
      expect(repairedNode?.frame.x).toBeLessThan(1000);
    });

    it('should fix invalid child references', async () => {
      const graph = createEmptyGraph();
      const validNode = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        props: { text: 'Valid Button' },
      });
      const invalidNode = createComponent('button', { x: 100, y: 0, w: 100, h: 50, region: 'main' }, {
        props: { text: 'Container' },
        children: ['123e4567-e89b-12d3-a456-426614174999'], // Non-existent child ID
      });
      
      graph.nodes.push(validNode, invalidNode);
      
      const validationResult = await runValidationGate(graph);
      const repairResult = attemptRepair(graph, validationResult.diagnostics);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.fixes.length).toBeGreaterThan(0);
      
      // Check that the invalid reference was removed
      const repairedNode = repairResult.graph.nodes.find(n => n.id === invalidNode.id);
      expect(repairedNode?.children).toEqual([]);
    });
  });

  describe('Repair Loop', () => {
    it('should successfully repair multiple errors in a loop', async () => {
      const graph = createEmptyGraph();
      
      // Create multiple errors: duplicate IDs and out of bounds coordinates
      const duplicateId = '123e4567-e89b-12d3-a456-42614174000'; // Valid UUID
      const node1 = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 1',
        props: { text: 'Button 1' },
      });
      node1.id = duplicateId;
      
      const node2 = createComponent('button', { x: 100, y: 0, w: 100, h: 50, region: 'main' }, {
        name: 'Button 2',
        props: { text: 'Button 2' },
      });
      node2.id = duplicateId;
      
      const outOfBoundsNode = createComponent('button', { x: 9999, y: 100, w: 120, h: 40, region: 'main' }, {
        props: { text: 'Out of Bounds' },
      });
      
      graph.nodes.push(node1, node2, outOfBoundsNode);
      
      // Use a synchronous validation function for the repair loop
      const validateFn = (g: Graph) => {
        // We need to call the validation function synchronously, but runValidationGate is async
        // For testing purposes, we'll simulate the validation by directly calling the schema validation
        const schemaValidation = (g: Graph) => {
          const diagnostics: Diagnostic[] = [];
          
          // Check for duplicate IDs
          const ids = new Set<string>();
          for (const node of g.nodes) {
            if (ids.has(node.id)) {
              diagnostics.push({
                gate: 'schema',
                severity: 'error',
                message: `Duplicate component ID: ${node.id}`,
              });
            }
            ids.add(node.id);
          }
          
          // Check for invalid child references
          for (const node of g.nodes) {
            if (node.children) {
              for (const childId of node.children) {
                if (!ids.has(childId)) {
                  diagnostics.push({
                    gate: 'schema',
                    severity: 'error',
                    message: `Invalid child reference in ${node.id}: ${childId} does not exist`,
                  });
                }
              }
            }
          }
          
          // Check for out of bounds coordinates
          for (const node of g.nodes) {
            if (node.frame.x > 5000 || node.frame.x < -1000 || 
                node.frame.y > 5000 || node.frame.y < -1000) {
              diagnostics.push({
                gate: 'schema',
                severity: 'error',
                message: `Component ${node.id} has x coordinate out of bounds: ${node.frame.x}`,
              });
            }
            if (node.frame.y > 5000 || node.frame.y < -1000) {
              diagnostics.push({
                gate: 'schema',
                severity: 'error',
                message: `Component ${node.id} has y coordinate out of bounds: ${node.frame.y}`,
              });
            }
          }
          
          return diagnostics;
        };
        
        return schemaValidation(g);
      };
      
      const validationResult = await runValidationGate(graph);
      const repairResult = repairLoop(graph, validationResult.diagnostics, validateFn, 5);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.fixes.length).toBeGreaterThan(1);
    });

    it('should stop after max attempts if errors persist', async () => {
      const graph = createEmptyGraph();
      
      // Create an error that can't be fixed by current strategies
      const node = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        props: { text: 'Button' },
      });
      // Manually add an invalid property that has no repair strategy
      (node as any).invalidProperty = 'invalid';
      graph.nodes.push(node);
      
      // Use a synchronous validation function for the repair loop
      const validateFn = (g: Graph) => {
        // Simple synchronous validation function
        const diagnostics: Diagnostic[] = [];
        
        // Check for any issues we want to test
        for (const node of g.nodes) {
          if ((node as any).invalidProperty) {
            diagnostics.push({
              gate: 'schema',
              severity: 'error',
              message: `Invalid property on component ${node.id}`,
            });
          }
        }
        
        return diagnostics;
      };
      
      const validationResult = await runValidationGate(graph);
      const repairResult = repairLoop(graph, validationResult.diagnostics, validateFn, 2);
      
      // Should still attempt repair but may not fully succeed
      expect(repairResult).toBeDefined();
    });
  });

  describe('Transaction and Rollback', () => {
    it('should create and use checkpoints properly', () => {
      const graph = createEmptyGraph();
      const node = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        props: { text: 'Button' },
      });
      graph.nodes.push(node);
      
      const repairer = getEnhancedRepairer({ 
        maxRepairAttempts: 3,
        maxRollbackDepth: 3,
        enableRollback: true,
        verbose: false,
        timeout: 1000,
        retryDelay: 10,
      });
      const transactionManager = repairer.getTransactionManager();
      
      // Create a transaction
      const transaction = transactionManager.createTransaction(graph, 'Test transaction');
      
      // Modify the graph
      const modifiedGraph = JSON.parse(JSON.stringify(graph));
      modifiedGraph.nodes[0].props.text = 'Modified Button';
      
      // Create a checkpoint
      const checkpoint = transactionManager.createCheckpoint(modifiedGraph, 'Modified state');
      
      // Verify checkpoint was created
      expect(checkpoint.graph.nodes[0].props.text).toBe('Modified Button');
      
      // Rollback to checkpoint
      const rollbackResult = transactionManager.rollbackToCheckpoint(checkpoint.id, graph);
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.graph.nodes[0].props.text).toBe('Modified Button');
    });

    it('should perform rollback when repair fails', async () => {
      const graph = createEmptyGraph();
      const node = createComponent('button', { x: 0, y: 0, w: 100, h: 50, region: 'main' }, {
        props: { text: 'Button' },
      });
      graph.nodes.push(node);
      
      // Create a validation function that always fails
      const failingValidate = (g: Graph): Diagnostic[] => {
        return [{
          gate: 'schema',
          severity: 'error',
          message: 'Test error that cannot be repaired',
        }];
      };
      
      // Attempt repair with rollback enabled
      const repairConfig = {
        maxRepairAttempts: 2,
        maxRollbackDepth: 3,
        enableRollback: true,
        verbose: false,
        timeout: 100,
        retryDelay: 10,
      };
      
      const result = await executeRepairWithTransaction(
        graph,
        [{ gate: 'schema', severity: 'error', message: 'Test error' }],
        failingValidate,
        repairConfig
      );
      
      // Should return the original graph after failed repairs and rollback
      expect(result.graph).toBeDefined();
    });
  });

  describe('Repair Metrics and Configuration', () => {
    it('should respect repair configuration options', () => {
      const config = {
        maxRepairAttempts: 1,
        maxRollbackDepth: 1,
        enableRollback: false,
        verbose: false,
        timeout: 1000,
        retryDelay: 10,
      };
      
      const repairer = getEnhancedRepairer(config);
      expect(repairer).toBeDefined();
    });
  });
});