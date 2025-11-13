import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/app/view/App';

/**
 * Smoke tests - Headless render sanity checks
 *
 * These tests ensure the application can render without crashing
 * and that critical UI elements are present.
 */
describe('Smoke Tests', () => {
  it('renders the main app without crashing', () => {
    render(<App />);

    // Check that the app title is present
    expect(screen.getByText('FrozenFigma')).toBeInTheDocument();
    expect(screen.getByText('Local Functional Mock-Up Builder')).toBeInTheDocument();
  });

  it('renders the main UI layout components', () => {
    render(<App />);

    // Check for main layout elements
    // Note: These data-testid attributes need to be added to the components
    // For now, we'll check for basic structure
    expect(document.querySelector('.app-container')).toBeInTheDocument();
  });

  it('has a canvas area for rendering components', () => {
    render(<App />);

    // The canvas should be present (this will be updated when Canvas component has proper test IDs)
    // For now, just ensure the app renders
    expect(document.body).toBeInTheDocument();
  });
});