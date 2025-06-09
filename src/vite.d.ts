/// <reference types="vite/client" />

interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_Z2M_API_URLS?: string;
    readonly VITE_Z2M_API_NAMES?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
