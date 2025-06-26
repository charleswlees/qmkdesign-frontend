import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomPrompt from '../CustomPrompt';

describe('CustomPrompt', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentValue: 'A',
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(<CustomPrompt {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Edit Cell')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<CustomPrompt {...mockProps} />);
    
    expect(screen.getByText('Edit Cell')).toBeInTheDocument();
  });

  it('displays current value in input', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const input = screen.getByPlaceholderText('Type a character');
    expect(input).toHaveValue('A');
  });

  it('handles typing new character', async () => {
    const user = userEvent.setup();
    render(<CustomPrompt {...mockProps} currentValue="" />);
    
    const input = screen.getByPlaceholderText('Type a character');
    await user.type(input, 'b');
    
    expect(input).toHaveValue('B'); // Should be uppercase
  });

  it('saves typed character on Confirm button click', async () => {
    const user = userEvent.setup();
    render(<CustomPrompt {...mockProps} currentValue="" />);
    
    const input = screen.getByPlaceholderText('Type a character');
    await user.type(input, 'x');
    
    // Click the Confirm button
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith('X');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles Clear button', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith('\u00A0'.repeat(9));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles Skip button', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith(null);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles non-standard key selection - Esc', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const escButton = screen.getByText('Esc');
    fireEvent.click(escButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith('Esc');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles non-standard key selection - Enter key', () => {
    render(<CustomPrompt {...mockProps} />);
    
    // Get the Enter key from the non-standard keys section
    const nonStandardSection = screen.getByText('Non-Standard Keys').closest('.non-standard-keys-section');
    if (nonStandardSection) {
      const enterKey = within(nonStandardSection as HTMLElement).getByText('Enter');
      fireEvent.click(enterKey);
      
      expect(mockProps.onSave).toHaveBeenCalledWith('Enter');
      expect(mockProps.onClose).toHaveBeenCalled();
    }
  });

  it('closes on overlay click', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const overlay = screen.getByText('Edit Cell').closest('.prompt-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockProps.onClose).toHaveBeenCalled();
    }
  });

  it('does not close on content click', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const content = screen.getByText('Edit Cell').closest('.prompt-content');
    if (content) {
      fireEvent.click(content);
      expect(mockProps.onClose).not.toHaveBeenCalled();
    }
  });

  it('closes on X button click', () => {
    render(<CustomPrompt {...mockProps} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('clears selected key when typing', async () => {
    const user = userEvent.setup();
    // Start with a non-standard key selected
    render(<CustomPrompt {...mockProps} currentValue="Enter" />);
    
    const input = screen.getByPlaceholderText('Type a character');
    expect(input).toHaveValue(''); // Should be empty when non-standard key is selected
    
    // Type a character
    await user.type(input, 'a');
    
    expect(input).toHaveValue('A');
    
    // The Enter button in non-standard keys should no longer be selected
    const nonStandardSection = screen.getByText('Non-Standard Keys').closest('.non-standard-keys-section');
    if (nonStandardSection) {
      const enterKey = within(nonStandardSection as HTMLElement).getByText('Enter');
      expect(enterKey).not.toHaveClass('selected');
    }
  });

  it('handles null current value', () => {
    render(<CustomPrompt {...mockProps} currentValue={null} />);
    
    const input = screen.getByPlaceholderText('Type a character');
    expect(input).toHaveValue('');
  });

  it('handles blank key (spaces) as current value', () => {
    const blankValue = '\u00A0'.repeat(9);
    render(<CustomPrompt {...mockProps} currentValue={blankValue} />);
    
    const input = screen.getByPlaceholderText('Type a character');
    expect(input).toHaveValue('');
  });

  it('limits input to single character', async () => {
    const user = userEvent.setup();
    render(<CustomPrompt {...mockProps} currentValue="" />);
    
    const input = screen.getByPlaceholderText('Type a character') as HTMLInputElement;
    await user.type(input, 'abc');
    
    // Should only have the first character (uppercased)
    expect(input.value.length).toBe(1);
  });

  it('does not save when both value and selectedKey are empty', () => {
    render(<CustomPrompt {...mockProps} currentValue="" />);
    
    // Click Confirm without typing anything
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Should not save or close
    expect(mockProps.onSave).not.toHaveBeenCalled();
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
});
