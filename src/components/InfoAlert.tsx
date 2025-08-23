import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PropsWithChildren } from "react";
import store2 from "store2";
import { HIDE_STATIC_INFO_ALERTS } from "../localStoreConsts.js";

export default function InfoAlert({ children }: PropsWithChildren) {
    const doNotShow = store2.get(HIDE_STATIC_INFO_ALERTS, false);

    return doNotShow ? null : (
        <div className="alert alert-info alert-soft mb-2" role="alert">
            <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
            {children}
        </div>
    );
}
