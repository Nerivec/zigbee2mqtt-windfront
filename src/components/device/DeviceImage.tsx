import { faBan, faExclamationTriangle, faQuestionCircle, faSpinner, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Suspense, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InterviewState } from "../../consts.js";
import genericDevice from "../../images/generic-zigbee-device.png";
import type { Device } from "../../types.js";
import ErrorBoundary from "./ErrorBoundary.js";
import LazyImage from "./LazyImage.js";

type DeviceImageProps = {
    device?: Device;
    otaState?: string;
    disabled: boolean;
    className?: string;
    noIndicator?: boolean;
};

const DeviceImage = memo((props: Readonly<DeviceImageProps>) => {
    const { t } = useTranslation("zigbee");
    const { device = {} as Device, disabled, otaState, className, noIndicator } = props;

    const interviewState = useMemo(
        () =>
            device.interview_state === InterviewState.InProgress ? (
                <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    title={t("interviewing")}
                    className="indicator-item indicator-bottom indicator-end text-info"
                />
            ) : device.interview_state === InterviewState.Failed ? (
                <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    beat
                    title={t("interview_failed")}
                    className="indicator-item indicator-bottom indicator-end text-error"
                />
            ) : device.supported ? null : (
                <FontAwesomeIcon
                    icon={faQuestionCircle}
                    beat
                    title={t("unsupported")}
                    className="indicator-item indicator-bottom indicator-end text-warning"
                />
            ),
        [device.interview_state, device.supported, t],
    );

    return (
        <Suspense fallback={<img alt={device.ieee_address} src={genericDevice} />}>
            <ErrorBoundary>
                {noIndicator ? (
                    <LazyImage device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                ) : (
                    <div className="indicator w-full">
                        {otaState === "updating" && (
                            <FontAwesomeIcon
                                icon={faSync}
                                spin
                                title={t("updating_firmware")}
                                className="indicator-item indicator-top indicator-end text-info"
                            />
                        )}
                        {interviewState}
                        {disabled && (
                            <FontAwesomeIcon
                                icon={faBan}
                                title={t("common:disabled")}
                                className="indicator-item indicator-middle indicator-center text-error"
                                size="2xl"
                            />
                        )}
                        <LazyImage device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                    </div>
                )}
            </ErrorBoundary>
        </Suspense>
    );
});

export default DeviceImage;
