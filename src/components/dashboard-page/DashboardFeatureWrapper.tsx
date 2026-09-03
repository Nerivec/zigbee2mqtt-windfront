import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";
import { getFeatureIcon } from "../features/index.js";
import { getExposeLabel } from "../../utils/exposeTranslations.js";

export default function DashboardFeatureWrapper({ children, feature, deviceValue, endpointSpecific }: PropsWithChildren<FeatureWrapperProps>) {
    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const [fi, fiClassName] = getFeatureIcon(feature.name, deviceValue, unit);
    const { t, i18n } = useTranslation("zigbee");
    const locale = i18n.language?.split("-")[0] ?? "en";
    const featureName = feature.name === "state" ? feature.property : feature.name;
    const label = getExposeLabel(feature, locale) || startCase(featureName);

    return (
        <div className="flex flex-row items-center gap-1 mb-2">
            <FontAwesomeIcon icon={fi} className={fiClassName} />
            <div className="grow-1" title={featureName}>
                {label}
                {!endpointSpecific && <span title={t(($) => $.endpoint)}>{feature.endpoint ? ` (${feature.endpoint})` : null}</span>}
            </div>
            <div className="shrink-1 *:bg-base-200">{children}</div>
        </div>
    );
}
