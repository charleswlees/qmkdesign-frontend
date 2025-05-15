import { useState } from 'react'
import './App.css'
import KeyboardGrid from './KeyboardGrid';

function App() {
  const [rows, setRows] = useState(4)
  const [columns, setColumns] = useState(12)

  const addRow = () => {
    if (rows < 10) {
      let prevRow = rows;
      setRows(prevRow + 1);
    }
  }
  const removeRow = () => {
    if (rows > 0) {
      let prevRow = rows;
      setRows(prevRow - 1);
    }
  }

  const addColumn = () => {
    if (columns < 20) {
      let prevCol = columns;
      setColumns(prevCol + 1);
    }
  }

  const removeColumn = () => {
    if (columns > 0) {
      let prevCol = columns;
      setColumns(prevCol - 1);
    }
  }


  const keyLayout: string[][] = Array(rows).fill(' ').map(() => Array(columns).fill(' '));


  return (
    <>
      <KeyboardGrid layout={keyLayout} />
      <div>
        Rows: {rows}
        <button onClick={addRow}>+</button>
        <button onClick={removeRow}>-</button>
        Columns: {columns}
        <button onClick={addColumn}>+</button>
        <button onClick={removeColumn}>-</button>
      </div>
    </>
  )
}

export default App
