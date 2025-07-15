import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import FirmwareDataService from '../services/firmware'

vi.mock('axios')

const mockedAxios = axios as any; // eslint-disable-line @typescript-eslint/no-explicit-any
describe("FirmwareDataService", () => {
  const mockLayout = [[
    [
      {value: 'Q', span: 1}, 
      {value: 'W', span: 1}, 
      {value: 'E', span: 1}, 
      {value: 'R', span: 1}
    ],
    [
      {value: 'A', span: 1}, 
      {value: 'Shift', span: 1}, 
      {value: 'Meta', span: 1}, 
      {value: 'F', span: 1}],
    [
      null,
      {value: 'Z', span: 1}, 
      {value: 'X', span: 1}, 
      {value: 'C', span: 1}
    ],
  ]];
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL

  beforeEach(() => {
    vi.clearAllMocks();
  });



  it("Calls a PUT method on the endpoint", () => {
    const mockBin = new Blob(['mock firmware data'], { type: 'application/zip' });
    mockedAxios.put.mockResolvedValue({
      data: mockBin
    });

    const mockCreateElement = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockClick = vi.fn();
    const mockCreateObjectURL = vi.fn().mockReturnValue('mock-url');
    const mockRevokeObjectURL = vi.fn();

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement.mockReturnValue({
        href: '',
        setAttribute: vi.fn(),
        click: mockClick
      }),
      writable: true
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
    });

    Object.defineProperty(window.URL, 'createObjectURL', {
      value: mockCreateObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
    });


    FirmwareDataService.getFirmware(mockLayout, 'testkeyboard');

    expect(axios.put).toHaveBeenCalledWith(
      `${baseURL}/firmware/testkeyboard`,
      {
        keyboard: "testkeyboard",
        keymap:"default",
        layout: "LAYOUT_all",
        layers: [
          ['KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_A', 'KC_LSFT', 'KC_LGUI', 'KC_F', 'KC_NO', 'KC_Z', 'KC_X', 'KC_C']
        ]
      },
      { responseType: 'blob' }
    );


  });

});

