/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: used by envsubst */
// templates replaced at runtime
export const Z2M_API_URLS: NonNullable<ImportMetaEnv["VITE_Z2M_API_URLS"]> = "${Z2M_API_URLS}";
export const Z2M_API_NAMES: NonNullable<ImportMetaEnv["VITE_Z2M_API_NAMES"]> = "${Z2M_API_NAMES}";
export const USE_PROXY: NonNullable<ImportMetaEnv["VITE_USE_PROXY"]> = "${USE_PROXY}";
