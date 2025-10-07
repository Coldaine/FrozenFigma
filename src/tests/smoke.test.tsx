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
    const canvasElement = screen.getByTestId('canvas');
    expect(canvasElement).toBeInTheDocument();
  });
});