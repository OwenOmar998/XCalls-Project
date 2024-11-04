/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_SIP_DOMAIN: string;
  readonly VITE_SIP_PORT: string;
  readonly VITE_SIP_PATH: string;
  readonly VITE_SIP_USERNAME: string;
  readonly VITE_SIP_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
