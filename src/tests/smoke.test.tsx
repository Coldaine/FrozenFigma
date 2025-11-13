import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/view/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('FrozenFigma')).toBeInTheDocument();
  });

  it('renders the canvas element', () => {
    render(<App />);
    // For now, just check that the app renders - we'll add data-testid later
    expect(document.querySelector('.canvas-container')).toBeInTheDocument();
  });
});