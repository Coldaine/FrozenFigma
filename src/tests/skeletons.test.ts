import { describe, it, expect } from 'vitest';
import {
  generateSettingsPanel,
  generateTabs,
  generateModal,
  generateTray,
  generateCardGrid,
  generateForm,
  generateLens,
  generateNavigation,
  generateDataDisplay,
  generateInput,
  generateFeedback,
  generateLayout,
  generateSkeleton
} from '../agent/skeletons';

describe('Skeleton Library', () => {
  describe('Settings Panel', () => {
    it('should generate a settings panel with default parameters', () => {
      const components = generateSettingsPanel();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('input'); // Title
      // Check that there are slider components in the output
      const sliderComponents = components.filter(c => c.type === 'slider');
      expect(sliderComponents.length).toBeGreaterThan(0);
    });

    it('should generate a settings panel with custom parameters', () => {
      const components = generateSettingsPanel({
        title: 'Custom Settings',
        sliderCount: 2,
        toggleCount: 3,
        sectionCount: 1,
        includeColorPicker: false,
        includeTextInputs: false,
        includeSelects: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Tabs', () => {
    it('should generate tabs with default parameters', () => {
      const components = generateTabs();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('tabs'); // Main tabs container
    });

    it('should generate tabs with custom labels', () => {
      const components = generateTabs({
        labels: ['Tab A', 'Tab B'],
        includeInputs: false,
        includeButtons: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Modal', () => {
    it('should generate a modal with default parameters', () => {
      const components = generateModal();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('modal'); // Main modal container
    });

    it('should generate a modal with custom parameters', () => {
      const components = generateModal({
        title: 'Custom Modal',
        includeForm: false,
        includeImage: true,
        actionButtons: 1,
        includeCloseButton: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Tray', () => {
    it('should generate a tray with default parameters', () => {
      const components = generateTray();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('tray'); // Main tray container
    });

    it('should generate a tray with custom parameters', () => {
      const components = generateTray({
        title: 'Custom Tray',
        itemCount: 3,
        includeHeaders: false,
        includeActions: false,
        position: 'left'
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Card Grid', () => {
    it('should generate a card grid with default parameters', () => {
      const components = generateCardGrid();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('card-grid'); // Main grid container
    });

    it('should generate a card grid with custom parameters', () => {
      const components = generateCardGrid({
        count: 4,
        columns: 2,
        includeImages: false,
        includeActions: false,
        cardHeight: 150
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Form', () => {
    it('should generate a form with default parameters', () => {
      const components = generateForm();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('input'); // Title
    });

    it('should generate a form with custom parameters', () => {
      const components = generateForm({
        title: 'Custom Form',
        includeValidation: false,
        includeFileUpload: false,
        includeDate: false,
        includeRadio: false,
        includeCheckboxGroup: false,
        includeTextarea: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Lens', () => {
    it('should generate a lens with default parameters', () => {
      const components = generateLens();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('dialog'); // Main dialog container
    });

    it('should generate a lens with custom parameters', () => {
      const components = generateLens({
        title: 'Custom Lens',
        includeDetails: false,
        includeMetadata: false,
        includeActions: false,
        includeRelatedItems: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should generate navigation with default parameters', () => {
      const components = generateNavigation();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate navbar', () => {
      const components = generateNavigation({
        navType: 'navbar',
        items: ['Home', 'About'],
        includeSearch: false,
        includeUserMenu: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate sidebar', () => {
      const components = generateNavigation({
        navType: 'sidebar',
        items: ['Dashboard', 'Settings'],
        includeSearch: false,
        includeUserMenu: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate breadcrumbs', () => {
      const components = generateNavigation({
        navType: 'breadcrumbs',
        items: ['Home', 'Category', 'Item'],
        includeSearch: false,
        includeUserMenu: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Data Display', () => {
    it('should generate data display with default parameters', () => {
      const components = generateDataDisplay();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate table', () => {
      const components = generateDataDisplay({
        displayType: 'table',
        columns: ['Name', 'Value'],
        rows: 3,
        includeFilters: false,
        includePagination: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate chart', () => {
      const components = generateDataDisplay({
        displayType: 'chart',
        columns: [],
        rows: 0
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate list', () => {
      const components = generateDataDisplay({
        displayType: 'list',
        rows: 4
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Input', () => {
    it('should generate input with default parameters', () => {
      const components = generateInput();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate search', () => {
      const components = generateInput({
        inputType: 'search',
        placeholder: 'Search...',
        includeButton: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate filter', () => {
      const components = generateInput({
        inputType: 'filter',
        includeButton: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate date picker', () => {
      const components = generateInput({
        inputType: 'date-picker',
        includeButton: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate autocomplete', () => {
      const components = generateInput({
        inputType: 'autocomplete',
        options: ['Option 1', 'Option 2'],
        includeButton: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback', () => {
    it('should generate feedback with default parameters', () => {
      const components = generateFeedback();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate toast', () => {
      const components = generateFeedback({
        feedbackType: 'toast',
        message: 'Toast message',
        includeActions: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate notification', () => {
      const components = generateFeedback({
        feedbackType: 'notification',
        message: 'Notification message',
        includeActions: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate progress', () => {
      const components = generateFeedback({
        feedbackType: 'progress',
        message: 'Progress message',
        includeActions: false
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Layout', () => {
    it('should generate layout with default parameters', () => {
      const components = generateLayout();
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate container layout', () => {
      const components = generateLayout({
        layoutType: 'container',
        includeHeader: true,
        includeSidebar: true,
        includeFooter: true
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate grid layout', () => {
      const components = generateLayout({
        layoutType: 'grid',
        columns: 2,
        rows: 3
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate flex layout', () => {
      const components = generateLayout({
        layoutType: 'flex'
      });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Generic Skeleton Generator', () => {
    it('should generate settings panel via generic function', () => {
      const components = generateSkeleton('settings-panel', { sliderCount: 2 });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate tabs via generic function', () => {
      const components = generateSkeleton('tabs', { labels: ['Tab 1', 'Tab 2'] });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate modal via generic function', () => {
      const components = generateSkeleton('modal', { title: 'Test Modal' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate tray via generic function', () => {
      const components = generateSkeleton('tray', { title: 'Test Tray' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate card grid via generic function', () => {
      const components = generateSkeleton('card-grid', { count: 4 });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate form via generic function', () => {
      const components = generateSkeleton('form', { title: 'Test Form' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate lens via generic function', () => {
      const components = generateSkeleton('lens', { title: 'Test Lens' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate navigation via generic function', () => {
      const components = generateSkeleton('navigation', { navType: 'navbar' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate data display via generic function', () => {
      const components = generateSkeleton('data-display', { displayType: 'table' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate input via generic function', () => {
      const components = generateSkeleton('input', { inputType: 'search' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate feedback via generic function', () => {
      const components = generateSkeleton('feedback', { feedbackType: 'toast' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should generate layout via generic function', () => {
      const components = generateSkeleton('layout', { layoutType: 'grid' });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBeGreaterThan(0);
    });

    it('should handle unknown skeleton type with fallback using valid component type', () => {
      const components = generateSkeleton('button', { x: 10, y: 10, w: 200, h: 100 });
      expect(components).toBeInstanceOf(Array);
      expect(components.length).toBe(1);
      expect(components[0].type).toBe('button');
    });
  });
});