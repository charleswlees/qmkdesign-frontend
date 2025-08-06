import { useEffect, useState } from "react";
import { FaSave, FaCloudDownloadAlt, FaCloudUploadAlt } from "react-icons/fa";
import Auth from "./components/Auth";
import KeyboardGrid from "./components/KeyboardGrid";
import CustomPrompt from "./components/CustomPrompt";
import LayerBar from "./components/LayerBar.tsx";
import initialLayout from "./components/initial_layout.json";
import defaultLayouts from "./components/default_layouts.json";
import keyboardInfo from "./components/keyboard_list.json";
import "./styles/App.css";
import FirmwareDataService from "./services/firmware.ts";
import type { KeyboardLayout } from "./types/KeyboardLayout.ts";
import type { KeyInfo } from "./types/KeyboardLayout.ts";
import type { UserProfile } from "./types/UserProfile.ts";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { loadLayoutFromApi, saveLayoutToApi } from "./services/save.ts";


const getInitialLayout = () => {
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
    rows: initialLayout.dimensions.rows,
    columns: initialLayout.dimensions.columns,
    layers: initialLayout.layers,
  };
};

function App() {
  const [initialState] = useState(getInitialLayout);
  const [keyboardName, setKeyboardName] = useState(
    localStorage.getItem("keyboardName") ?? "zsa/planck_ez",
  );
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

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken"),
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setProfile(res.data);
        } catch (err) {
          console.log("Failed to fetch profile:", err);
          logout();
        }
      }
    };

    fetchProfile();
  }, [token]);

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

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem("authToken", tokenResponse.access_token);
      setToken(tokenResponse.access_token);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  const logout = () => {
    googleLogout();
    localStorage.removeItem("authToken");
    setToken(null);
    setProfile(null);
  };

  const handleKeyboardChange = (newKeyboardName: string) => {
    const selectedKeyboard = keyboardInfo.keyboards.find(
      (kb) => kb.name === newKeyboardName,
    );

    if (selectedKeyboard) {
      setKeyboardName(selectedKeyboard.name);
      setRows(selectedKeyboard.rows);
      setColumns(selectedKeyboard.columns);

      let newLayers = defaultLayouts.layouts.find(
        (layout) => layout.name === selectedKeyboard.name,
      );

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
      localStorage.setItem("keyboardName", keyboardName);
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
          .map(() =>
            Array(columns).fill({ value: "\u00A0".repeat(5), span: 1 }),
          ),
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

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ rowIndex, colIndex });
    setIsPromptOpen(true);
  };

  const handleClosePrompt = () => {
    setIsPromptOpen(false);
    setEditingCell(null);
  };

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
          <button className="icon-button" title="Import from Cloud" disabled={token ? false : true} onClick={() => loadLayoutFromApi(profile!, setLayers, setKeyboardName)}>
            <FaCloudDownloadAlt />
          </button>
          <button className="icon-button" title="Export to Cloud" disabled={token ? false : true} onClick={() => saveLayoutToApi(layers, profile!, keyboardName)}>
            <FaCloudUploadAlt />
          </button>
          <Auth profile={profile} onLogin={login} onLogout={logout} />
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
