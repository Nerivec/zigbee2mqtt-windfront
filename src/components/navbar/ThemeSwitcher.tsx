import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useEffect, useState } from "react";
import { useLocation } from "react-router";
import store2 from "store2";
import { THEME_KEY } from "../../localStoreConsts.js";
import DialogDropdown from "../DialogDropdown.js";

const ALL_THEMES = [
    "", // "Default"
    "Light",
    "Dark",
    "Abyss",
    "Acid",
    "Aqua",
    "Autumn",
    "Black",
    "Bumblebee",
    "Business",
    "Caramellatte",
    "Cmyk",
    "Coffee",
    "Corporate",
    "Cupcake",
    "Cyberpunk",
    "Dim",
    "Dracula",
    "Emerald",
    "Fantasy",
    "Forest",
    "Garden",
    "Halloween",
    "Lemonade",
    "Lofi",
    "Luxury",
    "Night",
    "Nord",
    "Pastel",
    "Retro",
    "Silk",
    "Sunset",
    "Synthwave",
    "Valentine",
    "Winter",
    "Wireframe",
];

const ThemeSwitcher = memo(() => {
    const routerLocation = useLocation();
    const [currentTheme, setCurrentTheme] = useState<string>(store2.get(THEME_KEY, ""));

    useEffect(() => {
        store2.set(THEME_KEY, currentTheme);

        // system-derived theme (currentTheme === "") should not set "data-theme" attr
        if (currentTheme) {
            document.documentElement.setAttribute("data-theme", currentTheme);
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }, [currentTheme]);

    return (
        <DialogDropdown
            buttonChildren={<FontAwesomeIcon icon={faPaintBrush} />}
            buttonStyle="btn-square"
            // do not allow theme-switching while on network page due to rendering of reagraph
            buttonDisabled={routerLocation.pathname.startsWith("/network")}
        >
            {ALL_THEMES.map((theme) => (
                <li key={theme || "default"}>
                    <input
                        type="radio"
                        name="theme-dropdown"
                        className={`theme-controller w-full font-normal btn btn-block ${currentTheme === theme.toLowerCase() ? "btn-primary" : "btn-ghost"}`}
                        aria-label={theme || "Default"}
                        value={theme.toLowerCase()}
                        onChange={() => setCurrentTheme(theme.toLowerCase())}
                    />
                </li>
            ))}
        </DialogDropdown>
    );
});

export default ThemeSwitcher;
