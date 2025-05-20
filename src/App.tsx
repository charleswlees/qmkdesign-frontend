import { useEffect, useState } from 'react'
import './App.css'
import KeyboardGrid from './KeyboardGrid';
import CustomPrompt from './CustomPrompt';
import LayerBar from './LayerBar';

function App() {

  const [rows, setRows] = useState(4)
  const [columns, setColumns] = useState(12)
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [layerIndex, setLayerIndex] = useState(0);
  const [layers, setLayers] = useState<string[][][]>([Array(rows).fill('').map(() => Array(columns).fill('\u00A0'.repeat(9)))]);
  const [currentLayer, setCurrentLayer] = useState<string[][]>(layers[layerIndex]);

  useEffect(() => {
    setCurrentLayer(layers[layerIndex]);
  }, [layerIndex, layers]);

  useEffect(() => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[layerIndex] = currentLayer
      return newLayers;
    });
  }, [currentLayer]);

  const addLayer = () => {
    setLayers([...layers, Array(rows).fill('').map(() => Array(columns).fill('\u00A0'.repeat(9)))])
  }

  const removeLayer =() => {
    if(layerIndex > 0){
      changeLayer(layerIndex - 1);
      let newLayers = [...layers]
      newLayers = newLayers.splice(0, newLayers.length-1);
      setLayers(newLayers)
    }
  }

  const changeLayer = (index: number) => {
    setLayerIndex(index);
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ rowIndex, colIndex });
    setIsPromptOpen(true);
  };

  const handleClosePrompt = () => {
    setIsPromptOpen(false);
    setEditingCell(null); 
  };

  // Function to handle saving the edited cell value
  const handleSaveCell = (newValue: string) => {
    if (editingCell) {
      setCurrentLayer(prevLayout => {
        const newLayout = prevLayout.map(row => [...row]); 
        newLayout[editingCell.rowIndex][editingCell.colIndex] = newValue;
        return newLayout;
      });
      setEditingCell(null); 
    }
  };

  const addRow = () => {
    const prevRows = rows;
    const newRows = prevRows + 1;

    if (prevRows < 15) {
      setLayers(prevLayers => {
        const newLayers = prevLayers.map(layer => {
          const newRow = Array(columns).fill('\u00A0'.repeat(9));
          return [...layer, newRow];
        });
        return newLayers;
      });
      setRows(prevRows + 1);
      return newRows;
    }
  }

  const removeRow = () => {
    const prevRows = rows;
    const newRows = prevRows -1;

    if (prevRows > 0) {
      setLayers(prevLayers => {
        const newLayers = prevLayers.map(layer => {
          return layer.slice(0, newRows);
        });
        return newLayers;
      });
      setRows(prevRows - 1);
      return prevRows - 1;
    }
  }

  const addColumn = () => {
    const prevCols = columns;
    const newCols = prevCols + 1;

    setLayers(prevLayers => {
      const newLayers = prevLayers.map(layer => {
        return layer.map(row => {
          return [...row, '\u00A0'.repeat(9)];
        });
      });
      return newLayers;
    });
    setColumns(newCols);
    return newCols;
  }

  const removeColumn = () => {
    const prevCols = columns;
    const newCols = Math.max(1, prevCols - 1);

    setLayers(prevLayers => {
        const newLayers = prevLayers.map(layer => {
          return layer.map(row => {
            return row.slice(0, newCols);
          });
        });
        return newLayers;
      });
    setColumns(newCols);
    return newCols;
  }

  // Determine the current value of the cell being edited for the modal
  const currentEditingCellValue = editingCell ? currentLayer[editingCell.rowIndex][editingCell.colIndex] : '';

  return (
    <>
      <LayerBar LayerChange={changeLayer} LayerCount={layers.length} CurrentLayer={layerIndex} LayerAdd={addLayer} LayerRemove={removeLayer}/>
      <KeyboardGrid layout={currentLayer} onCellClick={handleCellClick} />
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
