import "react-app-polyfill/stable";
import { createRoot } from "react-dom/client";

import "./styles.css";
import { OnboardingApp } from "./OnboardingApp.js";

const domNode = document.getElementById("root");

if (domNode) {
    createRoot(domNode).render(<OnboardingApp />);
}

// https://vite.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", () => {
    window.location.reload();
});
