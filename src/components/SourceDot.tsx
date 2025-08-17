import { faDotCircle, faExclamationCircle, faQuestionCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { memo, useContext } from "react";
import { ReadyState } from "react-use-websocket";
import { API_NAMES } from "../store.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type SourceDotProps = Omit<FontAwesomeIconProps, "icon" | "style" | "title"> & {
    idx: number;
    /** automatically skip rendering when only 1 source present */
    autoHide?: boolean;
};

const CONNECTION_STATUS = {
    [ReadyState.CONNECTING]: faQuestionCircle,
    [ReadyState.OPEN]: faDotCircle,
    [ReadyState.CLOSING]: faExclamationCircle,
    [ReadyState.CLOSED]: faXmarkCircle,
    [ReadyState.UNINSTANTIATED]: faXmarkCircle,
};

const DOT_COLORS = [
    "#F3C300",
    "#875692",
    "#0067A5",
    "#008856",
    "#E25822",
    "#2B3D26",
    "#8DB600",
    "#B3446C",
    "#A1CAF1",
    "#654522",
    "#E68FAC",
    "#F38400",
    "#604E97",
    "#C2B280",
    "#BE0032",
];

const SourceDot = memo(({ idx, autoHide, ...rest }: SourceDotProps) => {
    const { readyStates } = useContext(WebSocketApiRouterContext);

    if (autoHide && readyStates.length < 2) {
        return null;
    }

    return (
        <span title={`${idx} | ${API_NAMES[idx]}`}>
            <FontAwesomeIcon icon={CONNECTION_STATUS[readyStates[idx]]} style={{ color: DOT_COLORS[idx] }} {...rest} />
        </span>
    );
});

export default SourceDot;
