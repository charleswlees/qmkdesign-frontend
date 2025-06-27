import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/index.css";
import "./styles/font.css";
import App from "./App.tsx";

// Access the environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID

if (!googleClientId) {
  throw new Error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
