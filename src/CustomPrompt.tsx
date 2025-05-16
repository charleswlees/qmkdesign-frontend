import React, { useEffect, useState } from "react";
import './CustomPrompt.css'

interface CustomPromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

const nonStandardKeys = [
  'Esc', 'Enter', 'Meta', 'Fn', 'Shift', 'Caps Lock', 'Ctrl', 'Alt', 'Tab', '󰁮  BackSp', 'Delete', 'Space',
  'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PgUp', 'PgDn', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

const nonStandardKeys_LINUX = [
  'Esc', 'Enter', ' ', 'Fn', 'Shift', 'Caps Lock', 'Ctrl', 'Alt', 'Tab', '󰁮  BackSp', 'Delete', 'Space',
  'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PgUp', 'PgDn', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

const nonStandardKeys_WIN = [
  'Esc', 'Enter', ' ', 'Fn', 'Shift', 'Caps Lock', 'Ctrl', 'Alt', 'Tab', '󰁮  BackSp', 'Delete', 'Space',
  'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PgUp', 'PgDn', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

const nonStandardKeys_MAC = [
  'Esc', 'Enter', '󰘳 Command', ' Fn', 'Shift', 'Caps Lock', '󰘴 Ctrl', '󰘵 Option', 'Tab', '󰁮  BackSp', 'Delete', 'Space',
  'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PgUp', 'PgDn', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

let selectedKeyLayout: string[] = nonStandardKeys;

const userAgent: string = navigator.userAgent;

if (userAgent.includes('Win')) {
  selectedKeyLayout = nonStandardKeys_WIN
} else if (userAgent.includes('Mac')) {
  selectedKeyLayout = nonStandardKeys_MAC
} else if (userAgent.includes('Linux')) {
  selectedKeyLayout = nonStandardKeys_LINUX
}



const CustomPrompt: React.FC<CustomPromptProps> = ({ isOpen, onClose, currentValue, onSave }) => {
  const [value, setValue] = useState<string>(currentValue);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);


  //Sets values to what is stored in selected key
  useEffect(() => {
    if (isOpen) {
      if (selectedKeyLayout.includes(currentValue)) {
        // If currentValue is a non-standard key
        setSelectedKey(currentValue);
        setValue(''); // Clear the typed value
      } else {
        // If currentValue is a standard character
        setValue(currentValue);
        setSelectedKey(null); // Clear the selected non-standard key
      }
    }
  }, [isOpen, currentValue, selectedKeyLayout]);


  // Don't render anything if the prompt is closed
  if (!isOpen) {
    return null;
  }


  //Event Handlers

  //Clear out the alternate selection 
  const handleTypedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (input.length <= 1) { // Limit to one character
      setValue(input.toUpperCase());
      setSelectedKey(null); // Clear selected non-standard key if typing
    }
  };

  const handleNonStandardKeyClick = (key: string) => {
    setSelectedKey(key);
    setValue(''); // Clear typed value if a non-standard key is selected
  };

  const handleSave = () => {
    if (selectedKey !== null || value.length > 0) {
      const valueToSave = selectedKey !== null ? selectedKey : value;
      onSave(valueToSave);
      setValue('');
      setSelectedKey(null);
      onClose(); // Close the prompt after saving
    }
  };

  const handleClear = () => {
    onSave('\u00A0'.repeat(9));
    setValue('');
    setSelectedKey(null);
    onClose(); // Close the prompt after saving
  };


  return (
    <div className="prompt-overlay" onClick={onClose}>
      <div className="prompt-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
        <div className="prompt-header">
          <h2>Edit Cell</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="prompt-body">
          <div className="input-section">
            <input
              type="text"
              value={value}
              onChange={handleTypedInputChange}
              maxLength={1}
              placeholder="Type a character"
            />
            <button onClick={handleSave}>Enter</button>
            <button onClick={handleClear}>Clear</button>
          </div>
          <div className="non-standard-keys-section">
            <h3>Non-Standard Keys</h3>
            <div className="non-standard-keys-list">
              {selectedKeyLayout.map(key => (
                <button
                  key={key}
                  className={selectedKey === key ? 'selected' : ''}
                  onClick={() => handleNonStandardKeyClick(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomPrompt;

