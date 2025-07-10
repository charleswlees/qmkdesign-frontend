declare module "*.css" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_AUTH_CLIENT_ID: string
  readonly VITE_BACKEND_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
