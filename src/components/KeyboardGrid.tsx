import React from "react";
import "../styles/KeyboardGrid.css";
import type { KeyInfo } from "../types/KeyboardLayout";

interface KeyboardGridProps {
  layout: (KeyInfo | null)[][]; 
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

            let value : string = "";
            let span : number = 0;
            if(keyData){
              value = keyData?.value ?? ""
              span = keyData?.span ?? 1
            }
            let keyClasses = "key";
            if (keyData === null) {
              keyClasses += " skipped-key"; 
            } else if (keyData.value !== null && keyData.value.length > 1) {
              keyClasses += " nonstandard";
            }

            if (span > 1) {
              keyClasses += " spanning-key";
            }

            return (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={keyClasses}
                style={{
                  gridColumn: span > 1 ? `span ${span}` : undefined,
                }}
                onClick={() => onCellClick(rowIndex, keyIndex)}
              >
                {keyData?.value ?? ''}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default KeyboardGrid;
