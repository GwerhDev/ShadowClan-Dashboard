/// <reference types="vite/client" />

// Variables de entorno VITE_* usadas por el Dashboard (definidas en .env).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WEB_URL?: string;
  readonly VITE_CLIENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
