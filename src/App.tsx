import { useEffect, useState } from "react";
import { FaSave, FaCloudDownloadAlt, FaCloudUploadAlt } from "react-icons/fa";
import Auth from "./components/Auth";
import KeyboardGrid from "./components/KeyboardGrid";
import CustomPrompt from "./components/CustomPrompt";
import LayerBar from "./components/LayerBar.tsx";
import QMKExporter from "./components/QMKExporter.tsx";
import './styles/App.css';
import type { KeyboardLayout } from "./types/KeyboardLayout.ts";

//Pulling initial state from local storage if possible
const getInitialState = () => {
  const savedLayoutJSON = localStorage.getItem("keyboardLayout");
  if (savedLayoutJSON) {
    try {
      const savedLayout: KeyboardLayout = JSON.parse(savedLayoutJSON);
      if (savedLayout.layers) {
        return {
          rows: savedLayout.dimensions.rows,
          columns: savedLayout.dimensions.columns,
          layers: savedLayout.layers,
        };
      }
    } catch (error) {
      console.error("Can't load local layout: ", error);
    }
  }

  const defaultRows = 4;
  const defaultCols = 12;
  return {
    rows: defaultRows,
    columns: defaultCols,
    layers: [
      Array(defaultRows)
        .fill("")
        .map(() => Array(defaultCols).fill("\u00A0".repeat(9))),
    ],
  };
};

function App() {
  const [initialState] = useState(getInitialState);
  const [rows, setRows] = useState(initialState.rows);
  const [columns, setColumns] = useState(initialState.columns);
  const [layers, setLayers] = useState<(string | null)[][][]>(
    initialState.layers,
  );
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);
  const [layerIndex, setLayerIndex] = useState(0);
  const [currentLayer, setCurrentLayer] = useState<(string | null)[][]>(
    layers[layerIndex],
  );

  //Handle Changing Active Layer
  useEffect(() => {
    setCurrentLayer(layers[layerIndex]);
  }, [layerIndex, layers]);

  //Updating the state of all layers to include updated current layer
  useEffect(() => {
    setLayers((prevLayers) => {
      if (!prevLayers[layerIndex]) return prevLayers;
      const newLayers = [...prevLayers];
      newLayers[layerIndex] = currentLayer;
      return newLayers;
    });
  }, [currentLayer]);

  //Save Layout Locally as JSON
  const handleSaveLayout = async () => {
    const layoutToSave: KeyboardLayout = {
      dimensions: {
        rows,
        columns,
      },
      layers,
    };

    const layoutJSON = JSON.stringify(layoutToSave, null, 2);

    try {
      localStorage.setItem("keyboardLayout", layoutJSON);
      alert("Layout saved to browser storage!");
    } catch (error) {
      console.error("Failed to save layout to localStorage:", error);
      alert("Error: Could not save layout to browser storage.");
    }
  };

  //Adding and Removing Layers from our Layout
  
  const addLayer = () => {
    if (layers.length < 10) {
      setLayers([
        ...layers,
        Array(rows)
          .fill("")
          .map(() => Array(columns).fill("\u00A0".repeat(9))),
      ]);
    }
  };

  const removeLayer = () => {
    if (layerIndex > 0) {
      setLayerIndex(layerIndex - 1);
      let newLayers = [...layers];
      newLayers = newLayers.splice(0, newLayers.length - 1);
      setLayers(newLayers);
    }
  };

  //Opens custom prompt on relevant cell
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ rowIndex, colIndex });
    setIsPromptOpen(true);
  };

  //Handles closing prompt
  const handleClosePrompt = () => {
    setIsPromptOpen(false);
    setEditingCell(null);
  };

  //Updates Current Layer after saving cell
  const handleSaveCell = (newValue: string | null) => {
    console.log("Saving Cell")
    if (editingCell) {
      setCurrentLayer((prevLayout) => {
        const newLayout = prevLayout.map((row) => [...row]);
        newLayout[editingCell.rowIndex][editingCell.colIndex] = newValue;
        return newLayout;
      });
      setEditingCell(null);
    }
  };

  //Add a row of empty cells at the bottom of the keyboard grid UI
  const addRow = () => {
    const prevRows = rows;
    const newRows = prevRows + 1;

    if (prevRows < 15) {
      setLayers((prevLayers) => {
        const newLayers = prevLayers.map((layer) => {
          const newRow = Array(columns).fill("\u00A0".repeat(9));
          return [...layer, newRow];
        });
        return newLayers;
      });
      setRows(prevRows + 1);
      return newRows;
    }
  };

  //Remove last row from the Keyboard Grid UI
  const removeRow = () => {
    const prevRows = rows;
    const newRows = prevRows - 1;

    if (prevRows > 0) {
      setLayers((prevLayers) => {
        const newLayers = prevLayers.map((layer) => {
          return layer.slice(0, newRows);
        });
        return newLayers;
      });
      setRows(prevRows - 1);
      return prevRows - 1;
    }
  };

  //Add an empty column to the UI
  const addColumn = () => {
    const prevCols = columns;
    const newCols = prevCols + 1;

    setLayers((prevLayers) => {
      const newLayers = prevLayers.map((layer) => {
        return layer.map((row) => {
          return [...row, "\u00A0".repeat(9)];
        });
      });
      return newLayers;
    });
    setColumns(newCols);
    return newCols;
  };

  //Remove the right-most column fromt the UI
  const removeColumn = () => {
    const prevCols = columns;
    const newCols = Math.max(1, prevCols - 1);

    setLayers((prevLayers) => {
      const newLayers = prevLayers.map((layer) => {
        return layer.map((row) => {
          return row.slice(0, newCols);
        });
      });
      return newLayers;
    });
    setColumns(newCols);
    return newCols;
  };

  const currentEditingCellValue = editingCell
    ? currentLayer[editingCell.rowIndex][editingCell.colIndex]
    : null;

  return (
    <>
      <header className="app-header">
        <h1>QMK Design</h1>
        <div className="header-controls">
          <button
            onClick={handleSaveLayout}
            className="icon-button"
            title="Save Layout to Browser"
          >
            <FaSave />
          </button>
          <button
            className="icon-button"
            title="Import from Cloud"
            disabled
          >
            <FaCloudDownloadAlt />
          </button>
          <button
            className="icon-button"
            title="Export to Cloud"
            disabled
          >
            <FaCloudUploadAlt />
          </button>
          <Auth />
        </div>
      </header>

      <LayerBar
        LayerChange={setLayerIndex}
        LayerCount={layers.length}
        CurrentLayer={layerIndex}
        LayerAdd={addLayer}
        LayerRemove={removeLayer}
      />
      <KeyboardGrid layout={currentLayer} onCellClick={handleCellClick} />
      <div>
        Rows: {rows}
        <button onClick={addRow}>+</button>
        <button onClick={removeRow}>-</button>
        Columns: {columns}
        <button onClick={addColumn}>+</button>
        <button onClick={removeColumn}>-</button>
      </div>

      <div className="export-container">
        <QMKExporter
          layout={{
            dimensions: { rows, columns },
            layers,
          }}
        />
      </div>

      <CustomPrompt
        isOpen={isPromptOpen}
        onClose={handleClosePrompt}
        currentValue={currentEditingCellValue}
        onSave={handleSaveCell}
      />
    </>
  );
}

export default App;
