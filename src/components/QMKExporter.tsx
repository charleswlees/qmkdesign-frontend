import React from 'react';
import type { KeyboardLayout } from '../types/KeyboardLayout';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface QMKExporterProps {
  layout: KeyboardLayout;
}

interface LayoutKey {
  label: string;
  x: number;
  y: number;
}

interface InfoJson {
  keyboard_name: string;
  url: string;
  maintainer: string;
  layouts: {
    LAYOUT: {
      layout: LayoutKey[];
    };
  };
}

const QMKExporter: React.FC<QMKExporterProps> = ({ layout }) => {
  // Map special keys to QMK keycodes
  const keyToQMKCode = (key: string | null): string => {
    if (!key || key === '\u00A0'.repeat(9)) return 'KC_NO';
    
    // Handle single character keys
    if (key.length === 1) {
      return `KC_${key.toUpperCase()}`;
    }
    
    // Map non-standard keys to QMK codes
    const nonstandardKeyMap: { [key: string]: string } = {
      'Esc': 'KC_ESC',
      'Enter': 'KC_ENT',
      'Meta': 'KC_LGUI',
      ' ': 'KC_LGUI',
      ' ': 'KC_LWIN',
      '󰘳 Command': 'KC_LCMD',
      'Fn': 'MO(1)', 
      ' Fn': 'MO(1)',
      'Shift': 'KC_LSFT',
      'Caps Lock': 'KC_CAPS',
      'Left Ctrl': 'KC_LCTL',
      'Right Ctrl': 'KC_RCTL',
      '󰘴 Ctrl': 'KC_LCTL',
      'Left Alt': 'KC_LALT',
      'Right Alt': 'KC_RALT',
      '󰘵 Left Option': 'KC_LOPT',
      '󰘵 Right Option': 'KC_ROPT',
      'Tab': 'KC_TAB',
      '󰁮  BackSp': 'KC_BSPC',
      'Delete': 'KC_DEL',
      'Space': 'KC_SPC',
      'Up': 'KC_UP',
      'Down': 'KC_DOWN',
      'Left': 'KC_LEFT',
      'Right': 'KC_RGHT',
      'Home': 'KC_HOME',
      'End': 'KC_END',
      'PgUp': 'KC_PGUP',
      'PgDn': 'KC_PGDN',
      'F1': 'KC_F1',
      'F2': 'KC_F2',
      'F3': 'KC_F3',
      'F4': 'KC_F4',
      'F5': 'KC_F5',
      'F6': 'KC_F6',
      'F7': 'KC_F7',
      'F8': 'KC_F8',
      'F9': 'KC_F9',
      'F10': 'KC_F10',
      'F11': 'KC_F11',
      'F12': 'KC_F12',
      ' ': 'KC_SPC',
    };
    
    return nonstandardKeyMap[key] || 'KC_NO';
  };

  const generateKeymap = (): string => {
    const { layers } = layout;
    
    let keymap = `#include QMK_KEYBOARD_H

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
`;

    layers.forEach((layer, layerIndex) => {
      keymap += `    [${layerIndex}] = LAYOUT(\n`;
      
      layer.forEach((row, rowIndex) => {
        keymap += '        ';
        row.forEach((key, colIndex) => {
          const qmkCode = keyToQMKCode(key);
          keymap += qmkCode.padEnd(8);
          if (colIndex < row.length - 1) keymap += ', ';
        });
        if (rowIndex < layer.length - 1) keymap += ',';
        keymap += '\n';
      });
      
      keymap += '    )';
      if (layerIndex < layers.length - 1) keymap += ',';
      keymap += '\n';
    });
    
    keymap += '};\n';
    
    return keymap;
  };

  const generateConfig = (): string => {
    const { dimensions } = layout;
    
    return `#pragma once

// Matrix size
#define MATRIX_ROWS ${dimensions.rows}
#define MATRIX_COLS ${dimensions.columns}

// Matrix pins - UPDATE ME BEFORE FLASHING
#define MATRIX_ROW_PINS { B1, B3, B2, B6 } // Example pins
#define MATRIX_COL_PINS { D3, D2, D1, D0, D4, C6, D7, E6, B4, B5, F4, F5 } 

// COL2ROW or ROW2COL
#define DIODE_DIRECTION COL2ROW

// Debounce
#define DEBOUNCE 5

// USB Device descriptor parameters
#define VENDOR_ID       0xFEED
#define PRODUCT_ID      0x0000
#define DEVICE_VER      0x0001
#define MANUFACTURER    "Custom"
#define PRODUCT         "custom_keyboard"
`;
  };

  const generateRules = (): string => {
    return `# MCU name - UPDATE ME BEFORE FLASHING
MCU = atmega32u4

# Bootloader selection
BOOTLOADER = atmel-dfu

# Build Options
BOOTMAGIC_ENABLE = yes      # Enable Bootmagic Lite
MOUSEKEY_ENABLE = yes       # Mouse keys
EXTRAKEY_ENABLE = yes       # Audio control and System control
CONSOLE_ENABLE = no         # Console for debug
COMMAND_ENABLE = no         # Commands for debug and configuration
NKRO_ENABLE = yes           # Enable N-Key Rollover
BACKLIGHT_ENABLE = no       # Enable keyboard backlight functionality
RGBLIGHT_ENABLE = no        # Enable keyboard RGB underglow
AUDIO_ENABLE = no           # Audio output
`;
  };

  const generateInfoJson = (): string => {
    const { dimensions } = layout;
    
    const info: InfoJson = {
      keyboard_name: 'custom_keyboard',
      url: "",
      maintainer: "qmk",
      layouts: {
        LAYOUT: {
          layout: []
        }
      }
    };
    
    // Generate layout positions
    for (let row = 0; row < dimensions.rows; row++) {
      for (let col = 0; col < dimensions.columns; col++) {
        info.layouts.LAYOUT.layout.push({
          label: `${row},${col}`,
          x: col,
          y: row
        });
      }
    }
    
    return JSON.stringify(info, null, 2);
  };

  const generateReadme = (): string => {
    return `# custom_keyboard

This keyboard was generated using QMK Design tool.

## Important Configuration Steps

Before compiling this firmware, you MUST:

1. **Configure the MCU type** in \`rules.mk\`
   - Common options: atmega32u4, STM32F303, RP2040, etc.

2. **Set the correct matrix pins** in \`config.h\`
   - MATRIX_ROW_PINS: The GPIO pins connected to your keyboard rows
   - MATRIX_COL_PINS: The GPIO pins connected to your keyboard columns

3. **Verify the diode direction** in \`config.h\`
   - COL2ROW: Diodes point from columns to rows
   - ROW2COL: Diodes point from rows to columns

4. **Update USB identifiers** in \`config.h\` if desired
   - VENDOR_ID, PRODUCT_ID, MANUFACTURER, PRODUCT

## Compiling

Place this folder in \`qmk_firmware/keyboards/custom_keyboard}\` and run:

\`\`\`
qmk compile -kb custom_keyboard -km default
\`\`\`

## Layout Information

- Rows: ${layout.dimensions.rows}
- Columns: ${layout.dimensions.columns}
- Layers: ${layout.layers.length}
`;
  };

  const handleExport = async () => {
    const zip = new JSZip();
    
    // Create folder structure
    const keymapFolder = zip.folder(`custom_keyboard/keymaps/default`);
    
    if (!keymapFolder) {
      console.error('Failed to create keymap folder');
      return;
    }
    
    // Add files
    keymapFolder.file('keymap.c', generateKeymap());
    zip.file(`custom_keyboard/config.h`, generateConfig());
    zip.file(`custom_keyboard/rules.mk`, generateRules());
    zip.file(`custom_keyboard/info.json`, generateInfoJson());
    zip.file(`custom_keyboard/readme.md`, generateReadme());
    
    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `custom_keyboard_qmk_firmware.zip`);
  };

  return (
    <button 
      onClick={handleExport}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
    >
      Export QMK Firmware
    </button>
  );
};

export default QMKExporter;
