export interface KeyboardLayout {
  version: string; 
  lastModified: string; 
  dimensions: {
    rows: number;
    columns: number;
  };
  layers: (string | null)[][][]; 
}
