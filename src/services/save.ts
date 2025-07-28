import type { KeyInfo } from "../types/KeyboardLayout";
import type { APIOutput } from "../types/APIOutput";
import type { UserProfile } from "../types/UserProfile.ts";
import type { Dispatch, SetStateAction } from 'react';
import axios from "axios";


export async function saveLayoutToApi(layout: (KeyInfo | null)[][][], userProfile: UserProfile, keyboardName: string){

    const output: APIOutput = {
      keyboard_layout : layout,
      user_id : userProfile.email,
      keyboard_name : keyboardName
    }

    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
    const data = output;
    return await axios.put(`${baseURL}/savedata`, data, {responseType: 'blob'});


}

export async function loadLayoutFromApi(
  userProfile: UserProfile, 
  setLayers: Dispatch<SetStateAction<(KeyInfo | null)[][][]>>,
  setKeyboardName: Dispatch<SetStateAction<string>>
  ){

    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
    const data = userProfile.email;
    const result  =  await axios.get<APIOutput>(`${baseURL}/savedata?email=${data}`);
    setLayers(result.data.keyboard_layout)
    setKeyboardName(result.data.keyboard_name)

}
