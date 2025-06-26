import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyboardGrid from '../KeyboardGrid';

describe('KeyboardGrid', () => {
  const mockLayout = [
    ['Q', 'W', 'E', 'R'],
    ['A', 'S', 'D', 'F'],
    [null, 'Z', 'X', 'C'],
  ];

  const mockOnCellClick = vi.fn();

  beforeEach(() => {
    mockOnCellClick.mockClear();
  });

  it('renders all keys correctly', () => {
    render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    // Check standard keys
    expect(screen.getByText('Q')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<KeyboardGrid layout={mockLayout} onCellClick={mockOnCellClick} />);
    
    // Check for skipped key class
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
