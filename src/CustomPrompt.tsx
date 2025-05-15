import React, { useEffect, useState } from "react";
import './CustomPrompt.css'

interface CustomPromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

const nonStandardKeys = [
  'Esc', 'Enter', 'Shift', 'Ctrl', 'Alt', 'Tab', 'Backspace', 'Delete', 'Space',
  'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PgUp', 'PgDn', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

const CustomPrompt: React.FC<CustomPromptProps> = ({ isOpen, onClose, currentValue, onSave }) => {
  const [value, setValue] = useState<string>(currentValue);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Don't render anything if the prompt is closed
  if (!isOpen) {
    return null;
  }


  //Event Handlers

  //Clear out the alternate selection 
  const handleTypedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 1) { // Limit to one character
      setValue(value);
      setSelectedKey(null); // Clear selected non-standard key if typing
    }
  };

  const handleNonStandardKeyClick = (key: string) => {
    setSelectedKey(key);
    setValue(''); // Clear typed value if a non-standard key is selected
  };

  const handleSave = () => {
    const valueToSave = selectedKey !== null ? selectedKey : value;
    onSave(valueToSave);
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
              maxLength={1} // HTML attribute for clarity, but validation is in onChange
              placeholder="Type a character"
            />
            <button onClick={handleSave}>Enter</button>
          </div>
          <div className="non-standard-keys-section">
            <h3>Non-Standard Keys</h3>
            <div className="non-standard-keys-list">
              {nonStandardKeys.map(key => (
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

