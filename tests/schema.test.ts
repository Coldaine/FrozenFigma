import { describe, it, expect } from 'vitest';
import {
  ComponentTypeSchema,
  FrameSchema,
  ComponentSpecSchema,
  GraphSchema,
  CommandSchema,
  createEmptyGraph,
  validate
} from '../src/schema';

/**
 * Schema validation tests
 *
 * Tests that Zod schemas correctly validate data structures
 * and provide helpful error messages for invalid data.
 */
describe('Schema Validation', () => {
  describe('ComponentTypeSchema', () => {
    it('accepts valid component types', () => {
      const validTypes = [
        'button', 'slider', 'toggle', 'tabs', 'modal', 'tray',
        'card', 'card-grid', 'form', 'input', 'select', 'textarea',
        'progress', 'tooltip', 'popover', 'drawer', 'dialog'
      ];

      validTypes.forEach(type => {
        expect(ComponentTypeSchema.safeParse(type).success).toBe(true);
      });
    });

    it('rejects invalid component types', () => {
      expect(ComponentTypeSchema.safeParse('invalid').success).toBe(false);
      expect(ComponentTypeSchema.safeParse('').success).toBe(false);
      expect(ComponentTypeSchema.safeParse(123).success).toBe(false);
    });
  });

  describe('FrameSchema', () => {
    it('accepts valid frame objects', () => {
      const validFrame = {
        x: 10,
        y: 20,
        w: 100,
        h: 50,
        region: 'main'
      };

      const result = FrameSchema.safeParse(validFrame);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validFrame);
      }
    });

    it('rejects frames with invalid dimensions', () => {
      const invalidFrame = {
        x: 10,
        y: 20,
        w: 0, // width must be >= 1
        h: 50,
        region: 'main'
      };

      expect(FrameSchema.safeParse(invalidFrame).success).toBe(false);
    });

    it('requires all required fields', () => {
      const incompleteFrame = {
        x: 10,
        y: 20,
        w: 100
        // missing h and region
      };

      expect(FrameSchema.safeParse(incompleteFrame).success).toBe(false);
    });
  });

  describe('ComponentSpecSchema', () => {
    it('accepts valid component specs', () => {
      const validSpec = {
  id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'button' as const,
        props: { label: 'Click me' },
        frame: {
          x: 10,
          y: 20,
          w: 100,
          h: 30,
          region: 'main'
        }
      };

      const result = ComponentSpecSchema.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it('requires valid UUID for id', () => {
      const invalidSpec = {
        id: 'not-a-uuid',
        type: 'button' as const,
        props: {},
        frame: {
          x: 10,
          y: 20,
          w: 100,
          h: 30,
          region: 'main'
        }
      };

      expect(ComponentSpecSchema.safeParse(invalidSpec).success).toBe(false);
    });
  });

  describe('GraphSchema', () => {
    it('accepts valid graph structures', () => {
      const validGraph = {
        version: '1.0',
        nodes: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: 'button' as const,
            props: { label: 'Test' },
            frame: {
              x: 10,
              y: 20,
              w: 100,
              h: 30,
              region: 'main'
            }
          }
        ],
        connections: [],
        tokens: {
          colors: { primary: '#000000' },
          spacing: { '4': 16 },
          typography: { fontFamily: 'Arial', sizes: { sm: 12, md: 16 }, weights: { normal: 400, bold: 700 } },
          radius: { '4': 4 },
          shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' },
          transitions: { fast: '150ms ease-in-out' }
        },
        meta: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: 'Test User',
          description: 'Test Graph'
        }
      };

      const result = GraphSchema.safeParse(validGraph);
      expect(result.success).toBe(true);
    });

    it('accepts empty graphs', () => {
      const emptyGraph = createEmptyGraph();
      const result = validate(GraphSchema, emptyGraph);
      expect(result.success).toBe(true);
    });
  });

  describe('CommandSchema', () => {
    it('accepts valid ADD commands', () => {
      const validCommand = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        type: 'ADD' as const,
        component: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'button' as const,
          props: { label: 'Test' },
          frame: {
            x: 10,
            y: 20,
            w: 100,
            h: 30,
            region: 'main'
          }
        }
      };

      const result = CommandSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });

    it('accepts valid UPDATE commands', () => {
      const validCommand = {
        id: '123e4567-e89b-12d3-a456-426614174004',
        type: 'UPDATE' as const,
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        updates: {
          props: { label: 'Updated Label' }
        }
      };

      const result = CommandSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });
  });
});