/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_API_KEY: string
  readonly VITE_AUTHDOMAIN: string
  readonly VITE_DB_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
