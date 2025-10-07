import { describe, it, expect } from 'vitest';
import {
  ComponentSpecSchema,
  GraphSchema,
  CommandSchema,
  EditPlanSchema,
  TokenSetSchema,
  validate,
  createEmptyGraph,
  createComponent,
  createAddCommand,
  createUpdateCommand,
  createRemoveCommand,
  createMoveCommand,
  createSetTokensCommand,
  createEditPlan,
  findComponentById,
  generateId,
  isAddCommand,
  isUpdateCommand,
} from '../schema';

describe('Schema Validation', () => {
  it('should validate a valid ComponentSpec', () => {
    const component = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const result = validate(ComponentSpecSchema, component);
    expect(result.success).toBe(true);
  });

  it('should create an empty graph', () => {
    const graph = createEmptyGraph();
    expect(graph.version).toBe('1.0.0');
    expect(graph.nodes).toHaveLength(0);
    expect(graph.meta).toBeDefined();
  });

  it('should validate commands', () => {
    const component = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const addCmd = createAddCommand(component);
    
    const result = validate(CommandSchema, addCmd);
    expect(result.success).toBe(true);
    expect(isAddCommand(addCmd)).toBe(true);
  });

  it('should create and validate an EditPlan', () => {
    const component = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const commands = [
      createAddCommand(component),
      createUpdateCommand(component.id, { props: { label: 'Click me' } }),
    ];
    
    const plan = createEditPlan(commands, 'Add a button and set its label');
    const result = validate(EditPlanSchema, plan);
    
    expect(result.success).toBe(true);
    expect(plan.operations).toHaveLength(2);
  });

  it('should find components by ID', () => {
    const component1 = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const component2 = createComponent('slider', { x: 0, y: 50, w: 200, h: 30, region: 'main' });
    
    const graph = createEmptyGraph();
    graph.nodes.push(component1, component2);
    
    const found = findComponentById(graph, component1.id);
    expect(found).toBeDefined();
    expect(found?.type).toBe('button');
  });

  it('should generate valid UUIDs', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should validate TokenSet', () => {
    const tokens = {
      colors: { primary: '#007bff', background: '#ffffff' },
      spacing: { xs: 4, sm: 8, md: 16 },
      typography: {
        fontFamily: 'Inter, sans-serif',
        sizes: { sm: 14, md: 16, lg: 18 },
        weights: { normal: 400, bold: 700 },
      },
      radius: { sm: 4, md: 8, lg: 16 },
    };
    
    const result = validate(TokenSetSchema, tokens);
    expect(result.success).toBe(true);
  });

  it('should handle type guards correctly', () => {
    const component = createComponent('button', { x: 0, y: 0, w: 100, h: 40, region: 'main' });
    const addCmd = createAddCommand(component);
    const updateCmd = createUpdateCommand(component.id, { props: { label: 'Test' } });
    
    expect(isAddCommand(addCmd)).toBe(true);
    expect(isAddCommand(updateCmd)).toBe(false);
    expect(isUpdateCommand(updateCmd)).toBe(true);
    expect(isUpdateCommand(addCmd)).toBe(false);
  });
});