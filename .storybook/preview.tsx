import type { Preview } from "@storybook/react-vite";
import { installStorybookMocks } from "./storybook-mocks.js";

import "../src/styles/styles.global.css";

installStorybookMocks();

const preview: Preview = {
    parameters: {
        layout: "fullscreen",
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: "todo",
        },
    },
};

export default preview;
