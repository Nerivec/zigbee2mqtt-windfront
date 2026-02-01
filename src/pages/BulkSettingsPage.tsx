import { faCircle, faCircleHalfStroke, faExclamationTriangle, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type JSX, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { getFeatureIcon } from "../components/features/index.js";
import { useAppStore } from "../store.js";
import type { BasicFeature, Device, DeviceState } from "../types.js";
import { computeCommonExposes, getValidSourceIdx } from "../utils.js";

type BulkSettingsPageUrlParams = {
    sourceIdx: `${number}`;
};

type ValueStatus = { type: "unknown" } | { type: "uniform"; value: unknown } | { type: "mixed" };

/**
 * Determines the current value status for a feature across multiple devices.
 * Returns 'uniform' if all devices have the same value, 'mixed' if values differ,
 * or 'unknown' if no values are available.
 */
function getCurrentValueStatus(featureName: string, devices: Device[], deviceStates: Record<string, DeviceState>): ValueStatus {
    const values = devices.map((d) => deviceStates[d.friendly_name]?.[featureName]);
    const definedValues = values.filter((v) => v !== undefined);

    if (definedValues.length === 0) {
        return { type: "unknown" };
    }

    const allSame = definedValues.every((v) => {
        // Handle object comparison for complex values
        if (typeof v === "object" && v !== null) {
            return JSON.stringify(v) === JSON.stringify(definedValues[0]);
        }
        return v === definedValues[0];
    });

    if (allSame) {
        return { type: "uniform", value: definedValues[0] };
    }

    return { type: "mixed" };
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
    if (value === undefined || value === null) {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "ON" : "OFF";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

interface BulkFeatureRowProps {
    feature: BasicFeature;
    valueStatus: ValueStatus;
}

/**
 * Component for displaying a single feature row in the bulk settings list.
 * Shows the feature name, current value status, and a variance indicator for mixed values.
 */
function BulkFeatureRow({ feature, valueStatus }: BulkFeatureRowProps) {
    const { t } = useTranslation("bulkSettings");
    // Unit is only available on NumericFeature type
    const unit = "unit" in feature ? (feature.unit as string | undefined) : undefined;
    const [icon, iconClassName] = getFeatureIcon(feature.name, valueStatus.type === "uniform" ? valueStatus.value : undefined, unit);
    const label = feature.label || startCase(feature.name);

    return (
        <div className="list-row p-3">
            <div>
                <FontAwesomeIcon icon={icon} className={iconClassName} size="2xl" />
            </div>
            <div className="flex-1">
                <div className="font-medium" title={feature.name}>
                    {label}
                </div>
                {feature.description && <div className="text-xs opacity-60">{feature.description}</div>}
            </div>
            <div className="flex items-center gap-2">
                {valueStatus.type === "uniform" && (
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircle} className="text-success" size="sm" />
                        <span className="badge badge-ghost">{formatValue(valueStatus.value)}</span>
                    </div>
                )}
                {valueStatus.type === "mixed" && (
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircleHalfStroke} className="text-warning" size="sm" />
                        <span className="badge badge-warning badge-outline">{t(($) => $.mixed_values)}</span>
                    </div>
                )}
                {valueStatus.type === "unknown" && (
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircle} className="text-base-content opacity-30" size="sm" />
                        <span className="badge badge-ghost opacity-50">{t(($) => $.unknown_value)}</span>
                    </div>
                )}
            </div>
            <div className="text-xs opacity-50">
                {feature.type}
                {unit && ` (${unit})`}
            </div>
        </div>
    );
}

export default function BulkSettingsPage(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation(["bulkSettings", "common"]);
    const { sourceIdx } = useParams<BulkSettingsPageUrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);

    const bulkSelectedDevices = useAppStore(useShallow((state) => state.bulkSelectedDevices[numSourceIdx] ?? []));
    const allDevices = useAppStore(useShallow((state) => state.devices[numSourceIdx] ?? []));
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[numSourceIdx] ?? {}));

    // Filter to get only selected devices
    const selectedDevices = useMemo(() => {
        const selectedSet = new Set(bulkSelectedDevices);
        return allDevices.filter((d) => selectedSet.has(d.ieee_address));
    }, [allDevices, bulkSelectedDevices]);

    // Compute common exposes across all selected devices
    const commonExposes = useMemo(() => {
        return computeCommonExposes(selectedDevices);
    }, [selectedDevices]);

    // Compute value statuses for each feature
    const featureValueStatuses = useMemo(() => {
        const statuses = new Map<string, ValueStatus>();

        for (const feature of commonExposes) {
            if (feature.property) {
                statuses.set(feature.name, getCurrentValueStatus(feature.property, selectedDevices, deviceStates));
            }
        }

        return statuses;
    }, [commonExposes, selectedDevices, deviceStates]);

    // Redirect if selection is invalid (less than 2 devices or invalid sourceIdx)
    useEffect(() => {
        if (!validSourceIdx || selectedDevices.length < 2) {
            void navigate("/devices", { replace: true });
        }
    }, [validSourceIdx, selectedDevices.length, navigate]);

    // Don't render if we're about to redirect
    if (!validSourceIdx || selectedDevices.length < 2) {
        return (
            <div className="flex flex-row justify-center items-center gap-2">
                <span className="loading loading-infinity loading-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title">
                        <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                        {t(($) => $.title)}
                    </h2>
                    <p className="text-sm opacity-70">{t(($) => $.selected_devices_count, { count: selectedDevices.length })}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedDevices.map((device) => (
                            <span key={device.ieee_address} className="badge badge-primary badge-outline">
                                {device.friendly_name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Common Features */}
            {commonExposes.length > 0 ? (
                <div className="card bg-base-100">
                    <div className="card-body p-0">
                        <h3 className="card-title p-4 pb-0">
                            {t(($) => $.common_features)}
                            <span className="badge badge-neutral">{commonExposes.length}</span>
                        </h3>
                        <p className="text-sm opacity-70 px-4">{t(($) => $.common_features_description)}</p>
                        <div className="list bg-base-100 mt-2">
                            {commonExposes.map((feature) => (
                                <BulkFeatureRow
                                    key={feature.name}
                                    feature={feature}
                                    valueStatus={featureValueStatuses.get(feature.name) ?? { type: "unknown" }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{t(($) => $.no_common_features)}</span>
                </div>
            )}

            {/* Legend */}
            <div className="card bg-base-200">
                <div className="card-body py-3">
                    <h4 className="text-sm font-medium mb-2">{t(($) => $.legend)}</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircle} className="text-success" size="sm" />
                            <span>{t(($) => $.legend_uniform)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircleHalfStroke} className="text-warning" size="sm" />
                            <span>{t(($) => $.legend_mixed)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircle} className="text-base-content opacity-30" size="sm" />
                            <span>{t(($) => $.legend_unknown)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
