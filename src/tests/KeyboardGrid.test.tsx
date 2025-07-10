import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyboardGrid from '../components/KeyboardGrid';

describe('KeyboardGrid', () => {
  const mockLayout = [
    [
      {value: 'Q', span: 1}, 
      {value: 'W', span: 1}, 
      {value: 'E', span: 1}, 
      {value: 'R', span: 1}
    ],
    [
      {value: 'A', span: 1}, 
      {value: 'S', span: 1}, 
      {value: 'D', span: 1}, 
      {value: 'F', span: 1}],
    [
      null,
      {value: 'Z', span: 1}, 
      {value: 'X', span: 1}, 
      {value: 'C', span: 1}
    ],
  ];

  const mockOnCellClick = vi.fn();

  beforeEach(() => {
    mockOnCellClick.mockClear();
  });

  it('renders all keys correctly', () => {
    render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    expect(screen.getByText('Q')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    const skippedKey = container.querySelector('.skipped-key');
    expect(skippedKey).toBeInTheDocument();
  });

  it('handles cell clicks correctly', () => {
    render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    const keyQ = screen.getByText('Q');
    fireEvent.click(keyQ);
    
    expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
    expect(mockOnCellClick).toHaveBeenCalledTimes(1);
  });

  it('sets correct grid columns', () => {
    const { container } = render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    const grid = container.querySelector('.keyboard-grid');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
  });
});
