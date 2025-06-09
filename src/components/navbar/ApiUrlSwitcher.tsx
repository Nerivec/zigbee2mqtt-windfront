import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ReadyState } from "react-use-websocket";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext";
import { Z2M_API_NAMES } from "../../envs";
import PopoverDropdown from "../PopoverDropdown";

const CONNECTION_STATUS = {
    [ReadyState.CONNECTING]: "text-info",
    [ReadyState.OPEN]: "text-success",
    [ReadyState.CLOSING]: "text-warning",
    [ReadyState.CLOSED]: "text-error",
    [ReadyState.UNINSTANTIATED]: "text-error",
};

const ApiUrlSwitcher = memo(() => {
    const { t } = useTranslation("navbar");
    const { readyState, apiUrls, apiUrl, setApiUrl } = useContext(WebSocketApiRouterContext);
    const apiNames = import.meta.env.VITE_Z2M_API_NAMES?.split(",") ?? (Z2M_API_NAMES.startsWith("${") ? apiUrls : Z2M_API_NAMES.split(","));

    return (
        <PopoverDropdown
            name="api-url-switcher"
            buttonChildren={
                <FontAwesomeIcon
                    icon={faServer}
                    className={CONNECTION_STATUS[readyState]}
                    title={`${t("websocket_status")}: ${ReadyState[readyState]}`}
                />
            }
            buttonStyle="mx-1"
            dropdownStyle="dropdown-end"
        >
            {apiUrls.map((url, i) => (
                <li
                    key={url}
                    onClick={() => setApiUrl(url)}
                    onKeyUp={(e) => {
                        if (e.key === "enter") {
                            setApiUrl(url);
                        }
                    }}
                >
                    <span className={`btn btn-sm btn-block ${apiUrl === url ? "btn-primary" : "btn-ghost"}`}>
                        {apiNames[i] && apiNames[i] !== url ? `${apiNames[i]} (${url})` : url}
                    </span>
                </li>
            ))}
        </PopoverDropdown>
    );
});

export default ApiUrlSwitcher;
