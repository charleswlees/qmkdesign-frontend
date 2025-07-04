export interface KeyboardLayout {
  dimensions: {
    rows: number;
    columns: number;
  };
  layers: (string | null)[][][]; 
}
