import React from "react";
import "./KeyboardGrid.css";

interface KeyboardGridProps {
  layout: (string | null)[][]; // Allow null values
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

const KeyboardGrid: React.FC<KeyboardGridProps> = ({
  layout,
  onCellClick,
}) => {
  const maxCols = layout.reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <div
      className="keyboard-grid"
      style={{
        gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
      }}
    >
      {layout.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {row.map((keyData, keyIndex) => {
            // Build the className string dynamically
            let keyClasses = "key";
            if (keyData === null) {
              keyClasses += " skipped-key"; // Add our new class for null keys
            } else if (keyData.length > 1) {
              keyClasses += " nonstandard";
            }

            return (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={keyClasses}
                onClick={() => onCellClick(rowIndex, keyIndex)}
              >
                {keyData}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default KeyboardGrid;
