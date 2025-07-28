import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveLayoutToApi, loadLayoutFromApi } from "../services/save";
import type { APIOutput } from "../types/APIOutput";
import type { UserProfile } from "../types/UserProfile.ts";
import axios from "axios";

vi.mock("axios");

const mockedAxios = axios as any; // eslint-disable-line @typescript-eslint/no-explicit-any

describe("SaveDataService", () => {
  const mockLayout = [
    [
      [
        { value: "Q", span: 1 },
        { value: "W", span: 1 },
        { value: "E", span: 1 },
        { value: "R", span: 1 },
      ],
      [
        { value: "A", span: 1 },
        { value: "Shift", span: 1 },
        { value: "Meta", span: 1 },
        { value: "F", span: 1 },
      ],
      [
        null,
        { value: "Z", span: 1 },
        { value: "X", span: 1 },
        { value: "C", span: 1 },
      ],
    ],
  ];
  const mockEmail: string = "john@smith.co";
  const mockName: string = "John Smith";
  const mockPath: string = "picturepath";
  const mockKeyboard: string = "zsh/planck_ez";
  const mockOutput: APIOutput = {
    keyboard_layout: mockLayout,
    user_id: mockEmail,
    keyboard_name: mockKeyboard,
  };

  const mockProfile: UserProfile = {
    name: mockName,
    picture: mockPath,
    email: mockEmail,
  };

  const mockSetLayers = vi.fn();
  const mockSetKeyboardName = vi.fn();

  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveLayoutToApi", () => {
    it("Calls a PUT method on the endpoint", () => {
      saveLayoutToApi(mockLayout, mockProfile, mockKeyboard);

      expect(axios.put).toHaveBeenCalledWith(
        `${baseURL}/savedata`,
        {
          keyboard_layout: mockLayout,
          user_id: mockEmail,
          keyboard_name: mockKeyboard
        },
        { responseType: 'blob' }
      );


    });
  });
  describe("loadLayoutFromApi", () => {
    it("Calls a GET method on the endpoint", () => {
      mockedAxios.get.mockResolvedValue({
        data: mockOutput
      });

      loadLayoutFromApi(mockProfile, mockSetLayers, mockSetKeyboardName);

      expect(axios.get).toHaveBeenCalledWith(
        `${baseURL}/savedata?email=${mockEmail}`,
      );
    });
    it("Calls Setters", async () => {
      mockedAxios.get.mockResolvedValue({
        data: mockOutput
      });

      await loadLayoutFromApi(mockProfile, mockSetLayers, mockSetKeyboardName);

      expect(mockSetLayers).toHaveBeenCalledWith(mockOutput.keyboard_layout);
      expect(mockSetKeyboardName).toHaveBeenCalledWith(mockOutput.keyboard_name);
    });
  });
});
