/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SETLISTFM_API_KEY: string
  // Add other VITE_ env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
