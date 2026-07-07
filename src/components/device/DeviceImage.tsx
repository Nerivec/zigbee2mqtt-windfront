import { faBan, faExclamationTriangle, faQuestionCircle, faSpinner, faSquareArrowUpRight, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InterviewState } from "../../consts.js";
import genericDevice from "../../images/generic-zigbee-device.png";
import type { Device, DeviceState } from "../../types.js";
import ErrorBoundary from "./ErrorBoundary.js";
import LazyImage from "./LazyImage.js";

type DeviceImageProps = {
    device?: Device;
    otaState?: NonNullable<DeviceState["update"]>["state"];
    disabled: boolean;
    className?: string;
    noIndicator?: boolean;
};

const DeviceImage = memo((props: Readonly<DeviceImageProps>) => {
    const { t } = useTranslation(["zigbee", "common"]);
    const { device = {} as Device, disabled, otaState, className, noIndicator } = props;

    const interviewState = useMemo(
        () =>
            device.interview_state === InterviewState.InProgress ? (
                <span title={t(($) => $.interviewing)}>
                    <FontAwesomeIcon icon={faSpinner} spin className="indicator-item indicator-bottom indicator-end text-info" />
                </span>
            ) : device.interview_state === InterviewState.Failed ? (
                <span title={t(($) => $.interview_failed)}>
                    <FontAwesomeIcon icon={faExclamationTriangle} beat className="indicator-item indicator-bottom indicator-end text-error" />
                </span>
            ) : device.definition?.source === "generated" ? (
                <span title={t(($) => $.unsupported)}>
                    <FontAwesomeIcon icon={faQuestionCircle} beat className="indicator-item indicator-bottom indicator-end text-warning" />
                </span>
            ) : device.definition?.source === "external" ? (
                <span title={t(($) => $.unsupported)}>
                    <FontAwesomeIcon icon={faSquareArrowUpRight} className="indicator-item indicator-bottom indicator-end text-info" />
                </span>
            ) : null,
        [device.interview_state, device.definition, t],
    );

    return (
        <Suspense fallback={<img alt={device.ieee_address} src={genericDevice} />}>
            <ErrorBoundary>
                {noIndicator ? (
                    <LazyImage device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                ) : (
                    <div className="indicator w-full">
                        {otaState === "updating" && (
                            <span title={t(($) => $.updating_firmware)}>
                                <FontAwesomeIcon icon={faSync} spin className="indicator-item indicator-top indicator-end text-info" />
                            </span>
                        )}
                        {interviewState}
                        {disabled && (
                            <span title={t(($) => $.disabled, { ns: "common" })}>
                                <FontAwesomeIcon icon={faBan} className="indicator-item indicator-middle indicator-center text-error" size="2xl" />
                            </span>
                        )}
                        <LazyImage device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                    </div>
                )}
            </ErrorBoundary>
        </Suspense>
    );
});

export default DeviceImage;
