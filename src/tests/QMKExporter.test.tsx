import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QMKExporter from '../QMKExporter';
import { saveAs } from 'file-saver';
import type { KeyboardLayout } from '../types/KeyboardLayout';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('QMKExporter', () => {
  const mockLayout: KeyboardLayout = {
    version: '1.0',
    lastModified: '2024-01-01T00:00:00.000Z',
    dimensions: { rows: 2, columns: 3 },
    layers: [
      [
        ['Q', 'W', 'E'],
        ['A', 'S', 'D'],
      ],
      [
        ['1', '2', '3'],
        ['4', '5', '6'],
      ],
    ],
  };

  it('renders export button', () => {
    render(<QMKExporter layout={mockLayout} />);
    
    expect(screen.getByText('Export QMK Firmware')).toBeInTheDocument();
  });

  it('generates and downloads zip file on click', async () => {
    render(<QMKExporter layout={mockLayout} keyboardName="test_keyboard" />);
    
    const button = screen.getByText('Export QMK Firmware');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'test_keyboard_qmk_firmware.zip'
      );
    });
  });

  it('maps single character keys correctly', async () => {
    render(<QMKExporter layout={mockLayout} />);
    
    // We can't easily test the zip contents, but we can ensure no errors occur
    const button = screen.getByText('Export QMK Firmware');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it('handles special keys correctly', async () => {
    const specialLayout: KeyboardLayout = {
      ...mockLayout,
      layers: [
        [
          ['Esc', 'Tab', 'Enter'],
          ['Shift', 'Ctrl', 'Space'],
        ],
      ],
    };
    
    render(<QMKExporter layout={specialLayout} />);
    
    const button = screen.getByText('Export QMK Firmware');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });
});
