import { sep } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    viteFinal(baseConfig) {
        const dynamicApiPlugin: PluginOption = {
            name: "storybook-dynamic-api-urls",
            enforce: "pre",
            transform(code: string, id: string) {
                if (!id.endsWith(`${sep}store.ts`)) {
                    return undefined;
                }

                const replaced = code.replace(
                    /export const API_URLS[\s\S]*?;\s*\nexport const API_NAMES[\s\S]*?=\s*[\s\S]*?;/m,
                    `const sbParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : undefined;
const sbApiUrls = sbParams?.get("sb-api-urls") ?? "localhost:8080/api";
const sbApiNames = sbParams?.get("sb-api-names") ?? "Main";

export const API_URLS = sbApiUrls.split(",").map((u) => u.trim());
export const API_NAMES = sbApiNames.split(",");`,
                );

                return { code: replaced, map: null };
            },
        };

        return {
            ...baseConfig,
            plugins: [...(baseConfig.plugins ?? []), dynamicApiPlugin],
        };
    },
};

export default config;
