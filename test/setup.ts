import { afterEach, vi } from "vitest";

// Mock i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (fn: (obj: Record<string, string>) => string) => {
            const keys: Record<string, string> = {
                get_value_from_device: "Sync",
                reading_from_device: "Reading...",
                sending_to_device: "Sending...",
                no_response_retry: "No response, retry?",
                device_returned_different_retry: "Different value, retry?",
                read_timed_out: "Read timed out",
            };
            return fn(keys);
        },
    }),
}));

afterEach(() => {
    vi.clearAllTimers();
});
