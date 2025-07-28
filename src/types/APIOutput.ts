import type { KeyInfo } from "./KeyboardLayout";

export interface APIOutput {
  keyboard_layout : (KeyInfo | null)[][][],
  user_id : string,
  keyboard_name : string,
}

