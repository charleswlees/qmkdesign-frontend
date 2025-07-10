import React, { useEffect, useState } from "react";
import "../styles/CustomPrompt.css";

interface CustomPromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string | null; 
  onSave: (newValue: string | null) => void; 
}

//Different Groups of non-standard keys
const nonStandardKeys = [
  "Esc",
  "Enter",
  "Meta",
  "Shift",
  "Caps Lock",
  "Left Ctrl",
  "Right Ctrl",
  "Left Alt",
  "Right Alt",
  "Tab",
  "󰁮  BackSp",
  "Delete",
  "Space",
  "Up",
  "Down",
  "Left",
  "Right",
  "Home",
  "End",
  "PgUp",
  "PgDn",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

const nonStandardKeys_LINUX = [
  "Esc",
  "Enter",
  " ",
  "Shift",
  "Caps Lock",
  "Left Ctrl",
  "Right Ctrl",
  "Left Alt",
  "Right Alt",
  "Tab",
  "󰁮  BackSp",
  "Delete",
  "Space",
  "Up",
  "Down",
  "Left",
  "Right",
  "Home",
  "End",
  "PgUp",
  "PgDn",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

const nonStandardKeys_WIN = [
  "Esc",
  "Enter",
  " ",
  "Shift",
  "Caps Lock",
  "Left Ctrl",
  "Right Ctrl",
  "Left Alt",
  "Right Alt",
  "Tab",
  "󰁮  BackSp",
  "Delete",
  "Space",
  "Up",
  "Down",
  "Left",
  "Right",
  "Home",
  "End",
  "PgUp",
  "PgDn",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

const nonStandardKeys_MAC = [
  "Esc",
  "Enter",
  "󰘳 Command",
  "Shift",
  "Caps Lock",
  "󰘴 Ctrl",
  "󰘵 Left Option",
  "󰘵 Right Option",
  "Tab",
  "󰁮  BackSp",
  "Delete",
  "Space",
  "Up",
  "Down",
  "Left",
  "Right",
  "Home",
  "End",
  "PgUp",
  "PgDn",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

//Determine user OS and choose which non-standard key list to give them

//Default is OS agnostic
let selectedKeyLayout: string[] = nonStandardKeys;

const userAgent: string = navigator.userAgent;
if (userAgent.includes("Win")) {
  selectedKeyLayout = nonStandardKeys_WIN;
} else if (userAgent.includes("Mac")) {
  selectedKeyLayout = nonStandardKeys_MAC;
} else if (userAgent.includes("Linux")) {
  selectedKeyLayout = nonStandardKeys_LINUX;
}

const CustomPrompt: React.FC<CustomPromptProps> = ({
  isOpen,
  onClose,
  currentValue,
  onSave,
}) => {
  const [value, setValue] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  //Populate state based on input
  useEffect(() => {
    if (isOpen) {
      if (currentValue && selectedKeyLayout.includes(currentValue)) {
        setSelectedKey(currentValue);
        setValue("");
      } else if (currentValue && currentValue.length === 1) {
        setValue(currentValue);
        setSelectedKey(null);
      } else {
        // Handles null, blank keys, or any other case by showing an empty prompt
        setValue("");
        setSelectedKey(null);
      }
    }
  }, [isOpen, currentValue]);

  if (!isOpen) {
    return null;
  }

  //Event Handlers

  //Control the UX for typing in the textbox within the prompt
  const handleTypedInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target.value;
    if (input.length <= 1) {
      // Limit to one character and make it uppercase
      setValue(input.toUpperCase());
      setSelectedKey(null); // Clear selected non-standard key if typing
    }
  };

  const handleNonStandardKeyClick = (key: string) => {
    onSave(key);
    onClose();
  };

  const handleSave = () => {
    if (selectedKey !== null || value.length > 0) {
      const valueToSave = selectedKey !== null ? selectedKey : value;
      onSave(valueToSave);
      onClose(); // Close the prompt after saving
    }
  };

  const handleClear = () => {
    onSave("\u00A0".repeat(9));
    onClose(); 
  };

  const handleSkip = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="prompt-overlay" onClick={onClose}>
      <div className="prompt-content" onClick={e => e.stopPropagation()}>
        {" "}
        <div className="prompt-header">
          <h2>Edit Cell</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
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
            <button onClick={handleSave}>Confirm</button>
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleSkip}>Skip</button>
          </div>
          <div className="non-standard-keys-section">
            <h3>Non-Standard Keys</h3>
            <div className="non-standard-keys-list">
              {selectedKeyLayout.map(key => (
                <button
                  key={key}
                  className={selectedKey === key ? "selected" : ""}
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
};

export default CustomPrompt;
