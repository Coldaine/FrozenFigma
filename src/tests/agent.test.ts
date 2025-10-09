import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyGraph, createComponent } from '../schema';
import { parseIntent } from '../agent/planner';
import { applyPatch } from '../agent/patcher';
import { runValidationGate } from '../agent/validator';
import { attemptRepair } from '../agent/repair';
import { AgentOrchestrator } from '../agent';
import { generateSettingsPanel, generateTabs, generateModal } from '../agent/skeletons';

/**
 * Consolidated Agent Integration Tests
 * 
 * These large-span tests verify complete agent behaviors: intent parsing through
 * execution, validation, repair, and multi-turn workflows. Uses real graph and
 * modules for observable outcomes, replacing ~20 fragmented units with 3 meaningful
 * integration tests.
 * 
 * Focus: User stories like "voice command adds component to canvas" with full flow.
 */

describe('Agent Integration Behaviors', () => {
  let agent: AgentOrchestrator;
  let graph: ReturnType<typeof createEmptyGraph>;

  beforeEach(() => {
    agent = new AgentOrchestrator({ verbose: false });
    graph = createEmptyGraph();
  });

  it('single turn: parse intent, generate skeleton, patch, validate success', async () => {
    /**
     * Story: As a designer, I say "Add a button labeled Submit in sidebar".
     * Agent parses, generates component, applies to graph, validates no issues.
     * 
     * External observer checks: Graph has button with props/position, validation passes,
     * summary reports success. Replaces isolated planner/patcher/skeleton/validator tests.
     */

    // Act: Full single turn
    const result = await agent.executeTurn('Add a button labeled "Submit" in the sidebar', graph);

    // Verify: Success and observable state
    expect(result.success).toBe(true);
    expect(result.graph.nodes).toHaveLength(1);
    const added = result.graph.nodes[0];
    expect(added.type).toBe('button');
    expect(added.props.label).toBe('Submit');
    expect(added.frame.region).toBe('sidebar');
    expect(added.frame.x).toBeGreaterThan(0); // Reasonable position

    // Validation integrated (no errors)
    const validation = await runValidationGate(result.graph);
    expect(validation.passed).toBe(true);
    expect(validation.diagnostics).toHaveLength(0);

    // Summary tells story
    expect(result.summary.changes.added).toBe(1);
    expect(result.summary.description).toContain('Added button');

    // Behavioral: Turn increments
    expect(agent.getTurnCounter()).toBe(1);
  });

  it('multi-turn workflow: sequential commands maintain graph integrity and history', async () => {
    /**
     * Story: As a designer, I build UI over turns: "Add button", then "Add 2 sliders in main",
     * then "Generate settings panel". Graph accumulates, validates each turn, history tracks.
     * 
     * External observer checks: Final graph has all components, no overlaps/duplicates,
     * each turn succeeds. Replaces separate orchestrator/E2E tests.
     */

    // Act 1: First turn - add button
    let result = await agent.executeTurn('Add a button labeled "Click Me"', graph);
    expect(result.success).toBe(true);
    expect(result.graph.nodes).toHaveLength(1);
    graph = result.graph; // Chain state

    // Act 2: Second turn - add sliders
    result = await agent.executeTurn('Create 2 sliders in the main region', graph);
    expect(result.success).toBe(true);
    expect(result.graph.nodes).toHaveLength(3); // +2 sliders
    const sliders = result.graph.nodes.filter(n => n.type === 'slider');
    expect(sliders).toHaveLength(2);
    expect(sliders.every(s => s.frame.region === 'main')).toBe(true);
    graph = result.graph;

    // Act 3: Third turn - generate panel (skeleton integration)
    result = await agent.executeTurn('Generate a settings panel with 2 sliders and 1 toggle', graph);
    expect(result.success).toBe(true);
    expect(result.graph.nodes).toHaveLength(6); // +3 from panel
    const panelComponents = result.graph.nodes.slice(3); // Last 3
    expect(panelComponents.filter(c => c.type === 'slider')).toHaveLength(2);
    expect(panelComponents.filter(c => c.type === 'toggle')).toHaveLength(1);
    graph = result.graph;

    // Verify: Cumulative validation, history across turns
    const finalValidation = await runValidationGate(graph);
    expect(finalValidation.passed).toBe(true);
    expect(finalValidation.diagnostics).toHaveLength(0); // No duplicates/overlaps

    // Turn counter and summaries
    expect(agent.getTurnCounter()).toBe(3);
    expect(result.summary.changes.added).toBe(3); // Last turn
    expect(graph.nodes.every(n => n.frame.x < 1920 && n.frame.y < 1080)).toBe(true); // Bounds

    // Cross-module: Patch applied correctly
    const patchCheck = applyPatch(graph, parseIntent('Add a button')); // Extra check
    expect(patchCheck.success).toBe(true); // Would fail if integrity broken
  });

  it('error and repair flow: invalid intent triggers validation failure, repair restores usability', async () => {
    /**
     * Story: As a designer, I say "Add overlapping buttons" causing validation error.
     * Agent detects, attempts repair (reposition), graph becomes valid again.
     * 
     * External observer checks: Initial failure, repair success, fixed graph.
     * Replaces isolated validator/repairer tests.
     */

    // Act 1: Intent that causes error (e.g., duplicate or overlap via close positions)
    const badIntent = 'Add two buttons at the same position'; // Assume parser creates overlapping
    let result = await agent.executeTurn(badIntent, graph);
    expect(result.success).toBe(false); // Validation fails

    // Verify failure: Diagnostics show issue
    const validation = await runValidationGate(result.graph);
    expect(validation.passed).toBe(false);
    expect(validation.diagnostics.some(d => d.message.includes('overlap') || d.message.includes('duplicate'))).toBe(true);

    // Act 2: Attempt repair (integrates repairer)
    const repairResult = attemptRepair(result.graph, validation.diagnostics);
    expect(repairResult.success).toBe(true);
    expect(repairResult.fixes).toHaveLength(1); // At least one fix (e.g., reposition)

    // Verify repair: Graph now valid, components adjusted
    const repairedGraph = repairResult.graph;
    const postRepairValidation = await runValidationGate(repairedGraph);
    expect(postRepairValidation.passed).toBe(true);

    // Behavioral: Original intent partially succeeds post-repair
    // e.g., Two buttons exist, but positions differ (no overlap)
    expect(repairedGraph.nodes).toHaveLength(2);
    expect(repairedGraph.nodes.every(n => n.type === 'button')).toBe(true);
    const positions = repairedGraph.nodes.map(n => `${n.frame.x},${n.frame.y}`);
    expect(new Set(positions).size).toBe(2); // Different positions after repair

    // Act 3: Continue with repaired graph (resilience)
    const continueResult = await agent.executeTurn('Move the second button to sidebar', repairedGraph);
    expect(continueResult.success).toBe(true);
    expect(continueResult.graph.nodes[1].frame.region).toBe('sidebar');

    // Turn counter (failed turn doesn't increment)
    expect(agent.getTurnCounter()).toBe(0); // Adjust based on impl
  });
});