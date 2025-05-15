import React from "react";
import './KeyboardGrid.css'

interface KeyboardGridProps {
  layout: string[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

const KeyboardGrid: React.FC<KeyboardGridProps> = ({ layout, onCellClick }) => {

  //const handleCellClick = (rowIndex: number, colIndex: number) => {
  //  const newValue = prompt(`Enter value for cell (${rowIndex}, ${colIndex}):`);
  //  if (newValue !== null) { // Check if the user didn't cancel the prompt
  //    onCellClick(rowIndex, colIndex, newValue);
  //  }
  //};

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
          {row.map((keyData, keyIndex) => (
            <div
              key={`${rowIndex}-${keyIndex}`}
              className="key"
              onClick = {() => onCellClick(rowIndex, keyIndex )}
            >
              {keyData}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );

}

export default KeyboardGrid;
