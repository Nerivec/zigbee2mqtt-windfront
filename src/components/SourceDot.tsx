import { faDotCircle, faExclamationCircle, faQuestionCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY } from "../localStoreConsts.js";
import { API_NAMES, MULTI_INSTANCE, useAppStore } from "../store.js";

type SourceDotProps = Omit<FontAwesomeIconProps, "icon" | "style" | "title"> & {
    idx: number;
    /** automatically skip rendering when only 1 source present */
    autoHide?: boolean;
    /** alwaysHideName takes precedence */
    alwaysShowName?: boolean;
    alwaysHideName?: boolean;
    nameClassName?: string;
    namePostfix?: string;
};

const CONNECTION_STATUS = {
    [WebSocket.CONNECTING]: faQuestionCircle,
    [WebSocket.OPEN]: faDotCircle,
    [WebSocket.CLOSING]: faExclamationCircle,
    [WebSocket.CLOSED]: faXmarkCircle,
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

const SourceDot = memo(({ idx, autoHide, alwaysShowName, alwaysHideName, nameClassName, namePostfix, ...rest }: SourceDotProps) => {
    const readyState = useAppStore(useShallow((state) => state.readyStates[idx]));
    const showName = !alwaysHideName && (alwaysShowName || store2.get(MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY, true));

    if (autoHide && !MULTI_INSTANCE) {
        return null;
    }

    return (
        <span title={`${idx} | ${API_NAMES[idx]}`}>
            <FontAwesomeIcon icon={CONNECTION_STATUS[readyState]} style={{ color: DOT_COLORS[idx] }} {...rest} />
            {showName && <span className={`ms-1 ${nameClassName ?? ""}`}>{API_NAMES[idx]}</span>}
            {showName && namePostfix}
        </span>
    );
});

export default SourceDot;
