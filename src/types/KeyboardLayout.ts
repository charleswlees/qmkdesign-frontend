export interface KeyInfo {
  value: string | null;
  span: number;
}

export interface KeyboardLayout {
  dimensions: {
    rows: number;
    columns: number;
  };
  layers: (KeyInfo | null)[][][]; 
}
