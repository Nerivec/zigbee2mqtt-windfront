import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { compression, defineAlgorithm } from "vite-plugin-compression2";
import { startServer } from "./mocks/ws.js";

// biome-ignore lint/suspicious/useAwait: follows API
export default defineConfig(async ({ command, mode }) => {
    if (command === "serve" && mode !== "test") {
        startServer();
    }

    return {
        root: "src",
        base: "",
        build: {
            emptyOutDir: true,
            outDir: "../dist",
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        if (/envs.ts/.test(id)) {
                            return "envs";
                        }
                    },
                },
            },
        },
        test: {
            dir: "test",
            environment: "jsdom",
            onConsoleLog() {
                return false;
            },
            coverage: {
                enabled: false,
                include: ["src/**"],
                extension: [".ts", ".tsx"],
                // exclude: [],
                clean: true,
                cleanOnRerun: true,
                reportsDirectory: "coverage",
                reporter: ["text", "html"],
                reportOnFailure: false,
                thresholds: {
                    /** current dev status, should maintain above this */
                    statements: 0,
                    functions: 0,
                    branches: 0,
                    lines: 0,
                },
            },
        },
        plugins: [react(), tailwindcss(), compression({ algorithms: [defineAlgorithm("brotliCompress")] })],
        server: {
            proxy: {
                "/api": {
                    changeOrigin: true,
                    target: process.env.Z2M_API_URI ? process.env.Z2M_API_URI : "ws://localhost:8579",
                    ws: true,
                },
            },
        },
    };
});
