import { useEffect, useState } from "react";
import { FaSave, FaCloudDownloadAlt, FaCloudUploadAlt } from "react-icons/fa";
import Auth from "./components/Auth";
import KeyboardGrid from "./components/KeyboardGrid";
import CustomPrompt from "./components/CustomPrompt";
import LayerBar from "./components/LayerBar.tsx";
import defaultLayout from "./components/default_layout.json";
import defaultLayouts from "./components/default_layouts.json";
import keyboardInfo from "./components/keyboard_list.json";
import "./styles/App.css";
import FirmwareDataService from "./services/firmware.ts";
import type { KeyboardLayout } from "./types/KeyboardLayout.ts";
import type { KeyInfo } from "./types/KeyboardLayout.ts";

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

  return {
    rows: defaultLayout.dimensions.rows,
    columns: defaultLayout.dimensions.columns,
    layers: defaultLayout.layers,
  };
};

function App() {
  const [initialState] = useState(getInitialState);
  const [keyboardName, setKeyboardName] = useState("zsa/planck_ez");
  const [rows, setRows] = useState(initialState.rows);
  const [columns, setColumns] = useState(initialState.columns);
  const [layers, setLayers] = useState<(KeyInfo | null)[][][]>(
    initialState.layers,
  );
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);
  const [layerIndex, setLayerIndex] = useState(0);
  const [currentLayer, setCurrentLayer] = useState<(KeyInfo | null)[][]>(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLayer]);

  //Handle changing the keyboard preset
  const handleKeyboardChange = (newKeyboardName: string) => {
    //Grab the details from the json
    const selectedKeyboard = keyboardInfo.keyboards.find(
      (kb) => kb.name === newKeyboardName,
    );

    if (selectedKeyboard) {
      //Update state
      setKeyboardName(selectedKeyboard.name);
      setRows(selectedKeyboard.rows);
      setColumns(selectedKeyboard.columns);

      //Set layout to default for new keyboard
      let newLayers = defaultLayouts.layouts.find(
        (layout) => layout.name === selectedKeyboard.name,
      );

      //Null Check / Default Empty Keymap
      if (!newLayers || !newLayers.layout || !newLayers.layout.layers) {
        newLayers = {
          name: "zsa/planck_ez",
          layout: {
            dimensions: { rows: 4, columns: 12 },
            layers: [
              Array(selectedKeyboard.rows)
                .fill(null)
                .map(() =>
                  Array(selectedKeyboard.columns)
                    .fill(null)
                    .map(() => ({ value: "\u00A0".repeat(9), span: 1 })),
                ),
            ],
          },
        };
      }

      setLayers(newLayers.layout.layers);
      setLayerIndex(0);
    }
  };

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
    console.log("Saving Cell");
    if (editingCell) {
      setCurrentLayer((prevLayout) => {
        const newLayout = prevLayout.map((row) => [...row]);
        newLayout[editingCell.rowIndex][editingCell.colIndex] = {
          value: newValue,
          span:
            prevLayout[editingCell.rowIndex][editingCell.colIndex]?.span ?? 1,
        };
        return newLayout;
      });
      setEditingCell(null);
    }
  };

  const currentEditingCellValue = editingCell
    ? (currentLayer[editingCell.rowIndex][editingCell.colIndex]?.value ?? null)
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
          <button className="icon-button" title="Import from Cloud" disabled>
            <FaCloudDownloadAlt />
          </button>
          <button className="icon-button" title="Export to Cloud" disabled>
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

      <div className="keyboard-dropdown">
        <p>Suported Keyboards</p>
        <select
          id="keyboard-list"
          value={keyboardName}
          onChange={(choice) => handleKeyboardChange(choice.target.value)}
          className="keyboard-dropdown"
        >
          {keyboardInfo.keyboards.map((keyboard) => (
            <option key={keyboard.name} value={keyboard.name}>
              {keyboard.name}
            </option>
          ))}
        </select>
      </div>
      <div className="export-container">
        <a
          onClick={() => FirmwareDataService.getFirmware(layers, keyboardName)}
        >
          Export QMK Firmware
        </a>
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
