import { useState } from 'react'
import './App.css'
import KeyboardGrid from './KeyboardGrid';
import CustomPrompt from './CustomPrompt';

function App() {

  const [rows, setRows] = useState(4)
  const [columns, setColumns] = useState(12)

  const [keyLayout, setKeyLayout] = useState<string[][]>(Array(rows).fill(' ').map(() => Array(columns).fill(' ')));

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ rowIndex, colIndex });
    setIsPromptOpen(true);
  };

  const handleClosePrompt = () => {
    setIsPromptOpen(false);
    setEditingCell(null); // Clear the editing cell state
  };

  // Function to handle saving the edited cell value
  const handleSaveCell = (newValue: string) => {
    if (editingCell) {
      setKeyLayout(prevLayout => {
        const newLayout = prevLayout.map(row => [...row]); // Create a deep copy
        newLayout[editingCell.rowIndex][editingCell.colIndex] = newValue;
        return newLayout;
      });
      setEditingCell(null); // Clear the editing cell state
    }
  };

  //  // Function to handle updating a cell's value
  //  const updateCellValue = (rowIndex: number, colIndex: number, newValue: string) => {
  //    setKeyLayout(prevLayout => {
  //      const newLayout = prevLayout.map(row => [...row]); // Create a deep copy
  //      newLayout[rowIndex][colIndex] = newValue;
  //      return newLayout;
  //    });
  //  };


  const addRow = () => {
    const prevRows = rows;
    if (prevRows < 15) {
      const newRows = prevRows + 1;
      setKeyLayout(prevLayout => {
        const newLayout = [...prevLayout, Array(columns).fill(' ')]; // Add a new row
        return newLayout;
      });
      setRows(prevRows + 1);
      return newRows;
    }
  }

  const removeRow = () => {
    const prevRows = rows;
    if (prevRows > 0) {
      setKeyLayout(prevLayout => {
        const newLayout = prevLayout.slice(0, prevRows - 1); // Remove the last row
        return newLayout;
      });
      setRows(prevRows - 1);
      return prevRows - 1;
    }
  }

  const addColumn = () => {
    const prevCols = columns;
    const newCols = prevCols + 1;
    setKeyLayout(prevLayout => {
      const newLayout = prevLayout.map(row => [...row, ' ']); // Add a new column to each row
      return newLayout;
    });
    setColumns(newCols);
    return newCols;
  }

  const removeColumn = () => {
    const prevCols = columns + 1;
    const newCols = Math.max(1, prevCols - 1);
    setKeyLayout(prevLayout => {
      const newLayout = prevLayout.map(row => row.slice(0, newCols)); // Remove the last column from each row
      return newLayout;
    });
    setColumns(newCols);
    return newCols;
  }

  // Determine the current value of the cell being edited for the modal
  const currentEditingCellValue = editingCell ? keyLayout[editingCell.rowIndex][editingCell.colIndex] : '';


  //const keyLayout: string[][] = Array(rows).fill(' ').map(() => Array(columns).fill(' '));


  return (
    <>
      <KeyboardGrid layout={keyLayout} onCellClick={handleCellClick} />
      <div>
        Rows: {rows}
        <button onClick={addRow}>+</button>
        <button onClick={removeRow}>-</button>
        Columns: {columns}
        <button onClick={addColumn}>+</button>
        <button onClick={removeColumn}>-</button>
      </div>

      <CustomPrompt
        isOpen={isPromptOpen}
        onClose={handleClosePrompt}
        currentValue={currentEditingCellValue}
        onSave={handleSaveCell}
      />
    </>
  )
}

export default App
