import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QMKExporter from '../components/QMKExporter';
import { saveAs } from 'file-saver';
import type { KeyboardLayout } from '../types/KeyboardLayout';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('QMKExporter', () => {
  const mockLayout: KeyboardLayout = {
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

  it('Calls File Save', async () => {
    render(<QMKExporter layout={mockLayout} />);
    
    const button = screen.getByText('Export QMK Firmware');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it('generates and downloads zip file on click', async () => {
    render(<QMKExporter layout={mockLayout} />);
    
    const button = screen.getByText('Export QMK Firmware');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'custom_keyboard_qmk_firmware.zip'
      );
    });
  });


  it('able to export with non-standard keys being used', async () => {
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
