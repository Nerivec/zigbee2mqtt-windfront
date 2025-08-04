import NiceModal from "@ebay/nice-modal-react";
import type { Preview } from "@storybook/react-vite";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import i18n from "../src/i18n/index.js";

import "../src/styles/styles.global.css";

const preview: Preview = {
    parameters: {
        layout: "centered",
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
    decorators: [
        (Story) => (
            <I18nextProvider i18n={i18n}>
                <NiceModal.Provider>
                    <MemoryRouter initialEntries={["/"]}>
                        <Story />
                    </MemoryRouter>
                </NiceModal.Provider>
            </I18nextProvider>
        ),
    ],
};

export default preview;
