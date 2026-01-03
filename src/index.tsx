import "react-app-polyfill/stable";
import { createRoot } from "react-dom/client";
import store2 from "store2";

import "./styles/styles.global.css";
import { DEFAULT_ROUTE_KEY } from "./localStoreConsts.js";
import { Main } from "./Main.js";

// if current path is root, check against first page load from store
if (window.location.hash === "" || window.location.hash === "#" || window.location.hash === "#/") {
    const storedPath = store2.get(DEFAULT_ROUTE_KEY, "");

    if (storedPath) {
        window.location.hash = storedPath;
    }
}

const domNode = document.getElementById("root");

if (domNode) {
    createRoot(domNode).render(<Main />);
}

// https://vite.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", () => {
    window.location.reload();
});
