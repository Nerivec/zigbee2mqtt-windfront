import { faCircle, faCircleHalfStroke, faExclamationTriangle, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import Feature from "../components/features/Feature.js";
import FeatureWrapper from "../components/features/FeatureWrapper.js";
import { getFeatureIcon } from "../components/features/index.js";
import { useAppStore } from "../store.js";
import type { BasicFeature, Device, DeviceState, FeatureWithAnySubFeatures } from "../types.js";
import { computeCommonExposes, getValidSourceIdx } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

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

type BulkApplyResult = {
    successCount: number;
    failureCount: number;
    failedDevices: string[];
};

interface BulkFeatureRowProps {
    feature: BasicFeature;
    valueStatus: ValueStatus;
    selectedDevices: Device[];
    onApplyBulkSetting: (feature: BasicFeature, value: Record<string, unknown>) => Promise<BulkApplyResult>;
    isApplying: boolean;
}

/**
 * Component for displaying a single feature row in the bulk settings list.
 * Shows the feature name, current value status, and a variance indicator for mixed values.
 * Expands to show feature controls when clicked.
 */
function BulkFeatureRow({ feature, valueStatus, selectedDevices, onApplyBulkSetting, isApplying }: BulkFeatureRowProps) {
    const { t } = useTranslation("bulkSettings");
    const [isExpanded, setIsExpanded] = useState(false);
    // Unit is only available on NumericFeature type
    const unit = "unit" in feature ? (feature.unit as string | undefined) : undefined;
    const [icon, iconClassName] = getFeatureIcon(feature.name, valueStatus.type === "uniform" ? valueStatus.value : undefined, unit);
    const label = feature.label || startCase(feature.name);

    // Create a mock device for the Feature component (using first selected device)
    const mockDevice = selectedDevices[0];
    // Create a deviceState that represents the current value (use uniform value or undefined for mixed)
    const deviceState = useMemo(() => {
        if (valueStatus.type === "uniform" && feature.property) {
            return { [feature.property]: valueStatus.value };
        }
        return {};
    }, [valueStatus, feature.property]);

    const handleChange = useCallback(
        async (value: Record<string, unknown>) => {
            await onApplyBulkSetting(feature, value);
        },
        [feature, onApplyBulkSetting],
    );

    return (
        <div className="collapse collapse-arrow bg-base-100 border-b border-base-200">
            <input
                type="checkbox"
                checked={isExpanded}
                onChange={(e) => setIsExpanded(e.target.checked)}
                disabled={isApplying}
            />
            <div className="collapse-title p-3 pr-10 min-h-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                        <FontAwesomeIcon icon={icon} className={iconClassName} size="xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" title={feature.name}>
                            {label}
                        </div>
                        {feature.description && <div className="text-xs opacity-60 truncate">{feature.description}</div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {isApplying && <span className="loading loading-spinner loading-sm" />}
                        {valueStatus.type === "uniform" && !isApplying && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCircle} className="text-success" size="sm" />
                                <span className="badge badge-ghost badge-sm">{formatValue(valueStatus.value)}</span>
                            </div>
                        )}
                        {valueStatus.type === "mixed" && !isApplying && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCircleHalfStroke} className="text-warning" size="sm" />
                                <span className="badge badge-warning badge-outline badge-sm">{t(($) => $.mixed_values)}</span>
                            </div>
                        )}
                        {valueStatus.type === "unknown" && !isApplying && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCircle} className="text-base-content opacity-30" size="sm" />
                                <span className="badge badge-ghost badge-sm opacity-50">{t(($) => $.unknown_value)}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-xs opacity-50 shrink-0">
                        {feature.type}
                        {unit && ` (${unit})`}
                    </div>
                </div>
            </div>
            <div className="collapse-content px-3 pb-3">
                <div className="pt-2 border-t border-base-200">
                    <div className="text-sm opacity-70 mb-2">
                        {t(($) => $.apply_to_devices, { count: selectedDevices.length })}
                    </div>
                    <div className="list bg-base-200 rounded-box">
                        <Feature
                            feature={feature as FeatureWithAnySubFeatures}
                            device={mockDevice}
                            deviceState={deviceState}
                            onChange={handleChange}
                            featureWrapperClass={FeatureWrapper}
                            parentFeatures={[]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BulkSettingsPage(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation(["bulkSettings", "common"]);
    const { sourceIdx } = useParams<BulkSettingsPageUrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);
    const addToast = useAppStore((state) => state.addToast);

    const bulkSelectedDevices = useAppStore(useShallow((state) => state.bulkSelectedDevices[numSourceIdx] ?? []));
    const allDevices = useAppStore(useShallow((state) => state.devices[numSourceIdx] ?? []));
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[numSourceIdx] ?? {}));

    // Track which feature is currently being applied
    const [applyingFeature, setApplyingFeature] = useState<string | null>(null);

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

    /**
     * Apply a setting change to all selected devices in parallel.
     * Uses Promise.allSettled to handle partial failures gracefully.
     */
    const applyBulkSetting = useCallback(
        async (feature: BasicFeature, value: Record<string, unknown>): Promise<BulkApplyResult> => {
            setApplyingFeature(feature.name);

            const promises = selectedDevices.map(async (device) => {
                try {
                    await sendMessage<"{friendlyNameOrId}/set">(
                        numSourceIdx,
                        // @ts-expect-error templated API endpoint
                        `${device.ieee_address}/set`,
                        value,
                    );
                    return { success: true, device };
                } catch (error) {
                    return { success: false, device, error };
                }
            });

            const results = await Promise.allSettled(promises);

            let successCount = 0;
            let failureCount = 0;
            const failedDevices: string[] = [];

            for (const result of results) {
                if (result.status === "fulfilled") {
                    if (result.value.success) {
                        successCount++;
                    } else {
                        failureCount++;
                        failedDevices.push(result.value.device.friendly_name);
                    }
                } else {
                    // Promise rejected (shouldn't normally happen with our try/catch)
                    failureCount++;
                }
            }

            // Show toast notification with results
            const totalDevices = selectedDevices.length;
            const allSuccess = successCount === totalDevices;
            const allFailed = failureCount === totalDevices;

            let toastMessage: string;
            if (allSuccess) {
                toastMessage = t(($) => $.bulk_apply_success, { count: successCount });
            } else if (allFailed) {
                toastMessage = t(($) => $.bulk_apply_all_failed, { count: failureCount });
            } else {
                toastMessage = t(($) => $.bulk_apply_partial, {
                    successCount,
                    failureCount,
                    total: totalDevices,
                });
                if (failedDevices.length > 0) {
                    toastMessage += ` ${t(($) => $.bulk_apply_failed_devices)}: ${failedDevices.join(", ")}`;
                }
            }

            addToast({
                sourceIdx: numSourceIdx,
                topic: `bulk/${feature.name}`,
                status: allFailed ? "error" : "ok",
                error: toastMessage,
            });

            setApplyingFeature(null);

            return { successCount, failureCount, failedDevices };
        },
        [selectedDevices, numSourceIdx, addToast, t],
    );

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
                        <p className="text-sm opacity-50 px-4">{t(($) => $.click_to_edit)}</p>
                        <div className="mt-2">
                            {commonExposes.map((feature) => (
                                <BulkFeatureRow
                                    key={feature.name}
                                    feature={feature}
                                    valueStatus={featureValueStatuses.get(feature.name) ?? { type: "unknown" }}
                                    selectedDevices={selectedDevices}
                                    onApplyBulkSetting={applyBulkSetting}
                                    isApplying={applyingFeature === feature.name}
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
