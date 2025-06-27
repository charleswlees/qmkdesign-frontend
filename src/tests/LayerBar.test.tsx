import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LayerBar from '../LayerBar';

describe('LayerBar', () => {
  const mockProps = {
    LayerCount: 3,
    CurrentLayer: 0,
    LayerChange: vi.fn(),
    LayerAdd: vi.fn(),
    LayerRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of layer tabs', () => {
    render(<LayerBar {...mockProps} />);
    
    expect(screen.getByText('Layer 1')).toBeInTheDocument();
    expect(screen.getByText('Layer 2')).toBeInTheDocument();
    expect(screen.getByText('Layer 3')).toBeInTheDocument();
  });

  it('highlights current layer', () => {
    render(<LayerBar {...mockProps} />);
    
    const layer1 = screen.getByText('Layer 1');
    expect(layer1).toHaveClass('current');
  });

  it('handles layer switching', () => {
    render(<LayerBar {...mockProps} />);
    
    const layer2 = screen.getByText('Layer 2');
    fireEvent.click(layer2);
    
    expect(mockProps.LayerChange).toHaveBeenCalledWith(1);
  });

  it('disables add button at max layers', () => {
    render(<LayerBar {...mockProps} LayerCount={10} />);
    
    const addButton = screen.getByTitle('Add Layer');
    expect(addButton).toBeDisabled();
  });

  it('disables remove button with single layer', () => {
    render(<LayerBar {...mockProps} LayerCount={1} />);
    
    const removeButton = screen.getByTitle('Remove Last Layer');
    expect(removeButton).toBeDisabled();
  });

  it('enables add button when under max layers', () => {
    render(<LayerBar {...mockProps} LayerCount={5} />);
    
    const addButton = screen.getByTitle('Add Layer');
    expect(addButton).not.toBeDisabled();
  });

  it('enables remove button with multiple layers', () => {
    render(<LayerBar {...mockProps} LayerCount={3} />);
    
    const removeButton = screen.getByTitle('Remove Last Layer');
    expect(removeButton).not.toBeDisabled();
  });

  it('calls LayerAdd when add button is clicked', () => {
    render(<LayerBar {...mockProps} />);
    
    const addButton = screen.getByTitle('Add Layer');
    fireEvent.click(addButton);
    
    expect(mockProps.LayerAdd).toHaveBeenCalled();
  });

  it('calls LayerRemove when remove button is clicked', () => {
    render(<LayerBar {...mockProps} />);
    
    const removeButton = screen.getByTitle('Remove Last Layer');
    fireEvent.click(removeButton);
    
    expect(mockProps.LayerRemove).toHaveBeenCalled();
  });

  it('updates current layer class when CurrentLayer prop changes', () => {
    const { rerender } = render(<LayerBar {...mockProps} />);
    
    // Initially Layer 1 is current
    let layer1 = screen.getByText('Layer 1');
    let layer2 = screen.getByText('Layer 2');
    expect(layer1).toHaveClass('current');
    expect(layer2).not.toHaveClass('current');
    
    // Change current layer to Layer 2
    rerender(<LayerBar {...mockProps} CurrentLayer={1} />);
    
    layer1 = screen.getByText('Layer 1');
    layer2 = screen.getByText('Layer 2');
    expect(layer1).not.toHaveClass('current');
    expect(layer2).toHaveClass('current');
  });
});
