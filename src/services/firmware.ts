import type { KeyInfo } from "../types/KeyboardLayout";
import axios from "axios";

interface QMKLayout {
  keyboard: string,
  keymap: string,
  layout: string,
  layers: string[][]
}

//Converts keys in GUI to QMK key values
const mapKeys = (key: string | null): string => {
  if (!key || key === '\u00A0'.repeat(9)) return 'KC_NO';

  // Handle single character letters and numbers
  if (key.length === 1 && /^[a-zA-Z0-9]$/.test(key)){
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
    //Special Characters
    ';': 'KC_SCLN',
    ':': 'KC_SCLN',
    "'": 'KC_QUOTE',
    '"': 'KC_QUOTE',
    '`': 'KC_GRAVE',
    '~': 'KC_GRAVE',
    ',': 'KC_COMMA',
    '<': 'KC_COMMA',
    '.': 'KC_DOT',
    '>': 'KC_DOT',
    '/': 'KC_SLASH',
    '?': 'KC_SLASH',
    '\\': 'KC_BACKSLASH',
    '|': 'KC_BACKSLASH',
    '-': 'KC_MINUS',
    '_': 'KC_MINUS',
    '=': 'KC_EQUAL',
    '+': 'KC_EQUAL',
    '[': 'KC_LEFT_BRACKET',
    '{': 'KC_LEFT_BRACKET',
    ']': 'KC_RIGHT_BRACKET',
    '}': 'KC_RIGHT_BRACKET',
  };

  return nonstandardKeyMap[key];
};


//Geneates JSON that we'll send to the backend with our keymap
function GenerateQMKLayout(layout: (KeyInfo | null)[][][], keyboardName: string): QMKLayout {

  const finalLayout: QMKLayout = { keyboard: keyboardName, keymap: "default", layout: "LAYOUT_all", layers: [] }
  const currentLayout = structuredClone(layout)
  finalLayout.layers[0] = [];

  //Iterate through layout and generate our QMK compatible key layout
  for (let j = 0; j < currentLayout[0].length; j++) {
    for (let k = 0; k < currentLayout[0][j].length; k++) {
      finalLayout.layers[0].push(mapKeys(currentLayout[0][j][k]?.value ?? null))
    }
  }

  return finalLayout

}


class FirmwareDataService {
  getFirmware(layout: (KeyInfo | null)[][][], keyboardName: string){
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
    const data : QMKLayout= GenerateQMKLayout(layout, keyboardName)
    return axios.put(`${baseURL}/firmware/${keyboardName}`, data, {
        responseType: 'blob'
    }).then((response) => {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        //Creates a temp-link for the bin file and triggers the download
        link.href = url;
        link.setAttribute('download', 'firmware.bin'); 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link); 
        window.URL.revokeObjectURL(url); 
    });
  }
}

export default new FirmwareDataService();
