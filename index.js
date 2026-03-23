import { join } from "node:path";

export default {
    getPath: () => join(import.meta.dirname, "dist"),
    getOnboardingPath: () => join(import.meta.dirname, "dist", "onboarding"),
};
