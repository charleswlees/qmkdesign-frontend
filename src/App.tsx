import { useEffect, useState } from "react";
import { FaSave, FaCloudDownloadAlt, FaCloudUploadAlt } from "react-icons/fa";
import Auth from "./components/Auth";
import KeyboardGrid from "./components/KeyboardGrid";
import CustomPrompt from "./components/CustomPrompt";
import LayerBar from "./components/LayerBar.tsx";
import QMKExporter from "./components/QMKExporter.tsx";
import './styles/App.css';
import type { KeyboardLayout } from "./types/KeyboardLayout.ts";

const getInitialState = () => {
  const savedLayoutJSON = localStorage.getItem("keyboardLayout");
  if (savedLayoutJSON) {
    try {
      const savedLayout: KeyboardLayout = JSON.parse(savedLayoutJSON);
      if (savedLayout.version === "1.0" && savedLayout.layers) {
        // Return the saved state if it's valid
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

  useEffect(() => {
    setCurrentLayer(layers[layerIndex]);
  }, [layerIndex, layers]);

  useEffect(() => {
    setLayers((prevLayers) => {
      if (!prevLayers[layerIndex]) return prevLayers;
      const newLayers = [...prevLayers];
      newLayers[layerIndex] = currentLayer;
      return newLayers;
    });
  }, [currentLayer, layerIndex]);

  const handleSaveLayout = async () => {
    const layoutToSave: KeyboardLayout = {
      version: "1.0",
      lastModified: new Date().toISOString(),
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
      changeLayer(layerIndex - 1);
      let newLayers = [...layers];
      newLayers = newLayers.splice(0, newLayers.length - 1);
      setLayers(newLayers);
    }
  };

  const changeLayer = (index: number) => {
    setLayerIndex(index);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ rowIndex, colIndex });
    setIsPromptOpen(true);
  };

  const handleClosePrompt = () => {
    setIsPromptOpen(false);
    setEditingCell(null);
  };

  const handleSaveCell = (newValue: string | null) => {
    if (editingCell) {
      setCurrentLayer((prevLayout) => {
        const newLayout = prevLayout.map((row) => [...row]);
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
            title="Import from Cloud (Coming Soon)"
            disabled
          >
            <FaCloudDownloadAlt />
          </button>
          <button
            className="icon-button"
            title="Export to Cloud (Coming Soon)"
            disabled
          >
            <FaCloudUploadAlt />
          </button>
          <Auth />
        </div>
      </header>

      <LayerBar
        LayerChange={changeLayer}
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
            version: "1.0",
            lastModified: new Date().toISOString(),
            dimensions: { rows, columns },
            layers,
          }}
          keyboardName="my_custom_keyboard"
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
