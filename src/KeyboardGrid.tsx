import React from "react";
import './KeyboardGrid.css'

interface KeyboardGridProps {
  layout: string[][];
}

const KeyboardGrid: React.FC<KeyboardGridProps> = ({ layout }) => {

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
