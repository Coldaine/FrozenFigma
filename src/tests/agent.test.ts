import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyGraph, createComponent } from '../schema';
import { parseIntent } from '../agent/planner';
import { applyPatch } from '../agent/patcher';
import { runValidationGate } from '../agent/validator';
import { attemptRepair } from '../agent/repair';
import { AgentOrchestrator } from '../agent';
import { generateSettingsPanel, generateTabs, generateModal } from '../agent/skeletons';

describe('Agent System', () => {
  describe('Planner Module', () => {
    it('should parse a simple add button command', () => {
      const plan = parseIntent('Add a button');
      
      expect(plan).toBeDefined();
      expect(plan.operations).toHaveLength(1);
      expect(plan.operations[0].type).toBe('ADD');
      expect(plan.description).toContain('button');
    });

    it('should parse multiple component creation', () => {
      const plan = parseIntent('Create 3 sliders');
      
      expect(plan.operations).toHaveLength(3);
      expect(plan.operations.every(op => op.type === 'ADD')).toBe(true);
    });

    it('should parse commands with labels', () => {
      const plan = parseIntent('Add a button labeled "Submit"');
      
      expect(plan.operations).toHaveLength(1);
      const command = plan.operations[0];
      if (command.type === 'ADD') {
        expect(command.component.props.label).toBe('Submit');
      }
    });

    it('should parse region placement', () => {
      const plan = parseIntent('Add a button in the sidebar');
      
      expect(plan.operations).toHaveLength(1);
      const command = plan.operations[0];
      if (command.type === 'ADD') {
        expect(command.component.frame.region).toBe('sidebar');
      }
    });
  });

  describe('Skeletonizer Module', () => {
    it('should generate a settings panel', () => {
      const components = generateSettingsPanel({ sliderCount: 3, toggleCount: 2 });
      
      expect(components).toHaveLength(5); // 3 sliders + 2 toggles
      expect(components.filter(c => c.type === 'slider')).toHaveLength(3);
      expect(components.filter(c => c.type === 'toggle')).toHaveLength(2);
    });

    it('should generate tabs', () => {
      const components = generateTabs({ labels: ['Home', 'Profile', 'Settings'] });
      
      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('tabs');
      expect(components[0].props.tabs).toHaveLength(3);
    });

    it('should generate a modal', () => {
      const components = generateModal({ title: 'Confirm Action' });
      
      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('modal');
      expect(components[0].props.title).toBe('Confirm Action');
    });
  });

  describe('Patcher Module', () => {
    let graph: ReturnType<typeof createEmptyGraph>;

    beforeEach(() => {
      graph = createEmptyGraph();
    });

    it('should apply ADD commands', () => {
      const plan = parseIntent('Add a button');
      const result = applyPatch(graph, plan);
      
      expect(result.success).toBe(true);
      expect(result.graph.nodes).toHaveLength(1);
      expect(result.graph.nodes[0].type).toBe('button');
    });

    it('should apply multiple commands in sequence', () => {
      const plan = parseIntent('Create 3 buttons');
      const result = applyPatch(graph, plan);
      
      expect(result.success).toBe(true);
      expect(result.graph.nodes).toHaveLength(3);
      expect(result.appliedCommands).toBe(3);
    });

    it('should handle errors gracefully', () => {
      const plan = parseIntent('Add a button');
      // Corrupt the plan to cause an error
      plan.operations[0] = { ...plan.operations[0], id: '' } as any;
      
      const result = applyPatch(graph, plan);
      
      // Should fail but not crash
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validator Module', () => {
    it('should validate an empty graph', async () => {
      const graph = createEmptyGraph();
      const result = await runValidationGate(graph);
      
      expect(result.passed).toBe(true);
      expect(result.gateResults.schema).toBe(true);
    });

    it('should validate a graph with components', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      
      const result = await runValidationGate(graph);
      
      expect(result.passed).toBe(true);
    });

    it('should detect duplicate IDs', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      graph.nodes.push({ ...button }); // Duplicate
      
      const result = await runValidationGate(graph);
      
      expect(result.passed).toBe(false);
      expect(result.diagnostics.some((d: any) => d.message.includes('Duplicate'))).toBe(true);
    });

    it('should detect out of bounds components', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 99999, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      
      const result = await runValidationGate(graph);
      
      expect(result.passed).toBe(false);
      expect(result.diagnostics.some((d: any) => d.message.includes('out of bounds'))).toBe(true);
    });
  });

  describe('Repairer Module', () => {
    it('should fix out of bounds components', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 9999, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      
      const validationResult = await runValidationGate(graph);
      const repairResult = attemptRepair(graph, validationResult.diagnostics);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.fixes.length).toBeGreaterThan(0);
    });

    it('should fix duplicate IDs', async () => {
      const graph = createEmptyGraph();
      const button = createComponent('button', { x: 100, y: 100, w: 120, h: 40, region: 'main' });
      graph.nodes.push(button);
      graph.nodes.push({ ...button }); // Duplicate
      
      const validationResult = await runValidationGate(graph);
      const repairResult = attemptRepair(graph, validationResult.diagnostics);
      
      expect(repairResult.success).toBe(true);
      expect(repairResult.graph.nodes[0].id).not.toBe(repairResult.graph.nodes[1].id);
    });
  });

  describe('Agent Orchestrator', () => {
    let agent: AgentOrchestrator;
    let graph: ReturnType<typeof createEmptyGraph>;

    beforeEach(() => {
      agent = new AgentOrchestrator({ verbose: false });
      graph = createEmptyGraph();
    });

    it('should execute a successful turn', async () => {
      const result = await agent.executeTurn('Add a button', graph);
      
      expect(result.success).toBe(true);
      expect(result.graph.nodes).toHaveLength(1);
      expect(result.summary).toBeDefined();
    });

    it('should handle multiple commands', async () => {
      const result = await agent.executeTurn('Create 3 sliders', graph);
      
      expect(result.success).toBe(true);
      expect(result.graph.nodes).toHaveLength(3);
      expect(result.summary.changes.added).toBe(3);
    });

    it('should increment turn counter', async () => {
      expect(agent.getTurnCounter()).toBe(0);
      
      await agent.executeTurn('Add a button', graph);
      expect(agent.getTurnCounter()).toBe(1);
      
      await agent.executeTurn('Add a slider', graph);
      expect(agent.getTurnCounter()).toBe(2);
    });

    it('should rollback on validation failure', async () => {
      // This would require creating a scenario that fails validation
      // For now, we just test that the mechanism exists
      const result = await agent.executeTurn('', graph);
      
      expect(result.graph).toBe(graph); // Should return original graph on failure
    });
  });

  describe('End-to-End Integration', () => {
    it('should handle a complete workflow', async () => {
      const agent = new AgentOrchestrator({ verbose: false });
      let graph = createEmptyGraph();
      
      // Step 1: Add a button
      const result1 = await agent.executeTurn('Add a button labeled "Click Me"', graph);
      expect(result1.success).toBe(true);
      graph = result1.graph;
      
      // Step 2: Add sliders
      const result2 = await agent.executeTurn('Create 2 sliders in the sidebar', graph);
      expect(result2.success).toBe(true);
      graph = result2.graph;
      
      // Verify final state
      expect(graph.nodes).toHaveLength(3);
      expect(graph.nodes.filter(n => n.type === 'button')).toHaveLength(1);
      expect(graph.nodes.filter(n => n.type === 'slider')).toHaveLength(2);
      expect(graph.nodes.filter(n => n.frame.region === 'sidebar')).toHaveLength(2);
    });

    it('should maintain graph integrity across multiple turns', async () => {
      const agent = new AgentOrchestrator({ verbose: false });
      let graph = createEmptyGraph();
      
      // Execute multiple turns
      for (let i = 0; i < 5; i++) {
        const result = await agent.executeTurn(`Add a button`, graph);
        expect(result.success).toBe(true);
        graph = result.graph;
        
        // Validate after each turn
        const validation = await runValidationGate(graph);
        expect(validation.passed).toBe(true);
      }
      
      expect(graph.nodes).toHaveLength(5);
    });
  });
});