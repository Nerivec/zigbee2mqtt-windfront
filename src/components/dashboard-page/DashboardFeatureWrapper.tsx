import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";
import { getFeatureIcon } from "../features/index.js";

export default function DashboardFeatureWrapper({ children, feature, deviceValue, endpointSpecific }: PropsWithChildren<FeatureWrapperProps>) {
    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const fi = getFeatureIcon(feature.name, deviceValue, unit);
    const { t } = useTranslation("zigbee");
    const featureName = feature.name === "state" ? feature.property : feature.name;

    return (
        <div className="flex flex-row items-center gap-1 mb-2">
            <FontAwesomeIcon icon={fi[0]} fixedWidth className={fi[1]} {...fi[2]} />
            <div className="grow-1" title={featureName}>
                {startCase(camelCase(featureName))}
                {!endpointSpecific && <span title={t("endpoint")}>{feature.endpoint ? ` (${feature.endpoint})` : null}</span>}
            </div>
            <div className="shrink-1">{children}</div>
        </div>
    );
}
