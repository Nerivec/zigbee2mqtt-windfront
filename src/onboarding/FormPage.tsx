import { faBan, faRandom } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSONSchema7 } from "json-schema";
import merge from "lodash/merge.js";
import random from "lodash/random.js";
import { type ChangeEvent, type FocusEvent, useCallback, useEffect, useRef, useState } from "react";
import type { OnboardInitData, OnboardSubmitResponse, Zigbee2MQTTSettings } from "zigbee2mqtt";
import Button from "../components/Button.js";
import SelectField from "../components/form-fields/SelectField.js";
import SettingsList from "../components/json-schema/SettingsList.js";
import type { TabName } from "../components/settings-page/tabs/Settings.js";
import Json from "../components/value-decorators/Json.js";

type FormPageProps = {
    data: OnboardInitData;
    onDone: (frontendUrl: string | null) => void;
};

const WIFI_CHANNELS = [1, 6, 11, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14] as const;
const PAN_ID_PATTERN = "(?:[1-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-4])";
const UINT8_PATTERN = "([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])";

const numCsvRegex = (size: number) => `(?:(?:${UINT8_PATTERN}, ?){${size - 1}}${UINT8_PATTERN})`;
const inputToArray = (value: string) => {
    const strArray = value.split(",");
    const numArr: number[] = [];

    for (const str of strArray) {
        const sanitizedStr = str.trim();

        numArr.push(Number.parseInt(sanitizedStr, sanitizedStr.startsWith("0x") ? 16 : 10));
    }

    return numArr;
};
const generatePanID = (): number => random(0x0001, 0xfffe);
const generateExtPanID = (): number[] => Array.from({ length: 8 }, () => random(0x00, 0xff));
const generateNetworkKey = (): number[] => Array.from({ length: 16 }, () => random(0x00, 0xff));
const readFileAsBase64 = async (file: File): Promise<string> => {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Failed to read ZIP file"));

                return;
            }

            const payload = reader.result.split(",", 2)[1];

            if (!payload) {
                reject(new Error("Failed to read ZIP file"));

                return;
            }

            resolve(payload);
        };
        reader.onerror = () => reject(new Error("Failed to read ZIP file"));

        reader.readAsDataURL(file);
    });
};

export function FormPage({ data: { settings, settingsSchema, devices }, onDone }: FormPageProps) {
    const panIdSchema = settingsSchema.properties.advanced.properties.pan_id;
    const extPanIdSchema = settingsSchema.properties.advanced.properties.ext_pan_id;
    const networkKeySchema = settingsSchema.properties.advanced.properties.network_key;
    const [currentSettings, setCurrentSettings] = useState(settings);
    // holds "only-modified" settings that will be sent (avoids Z2M saving defaults in yaml)
    const [formData, setFormData] = useState({});
    const [deviceName, setDeviceName] = useState<string | "">("");
    const [wifiChannel, setWifiChannel] = useState<number | "">("");
    const [panId, setPanId] = useState<number>(currentSettings.advanced.pan_id === "GENERATE" ? generatePanID() : currentSettings.advanced.pan_id);
    const [extPanId, setExtPanId] = useState<number[]>(
        currentSettings.advanced.ext_pan_id === "GENERATE" ? generateExtPanID() : currentSettings.advanced.ext_pan_id,
    );
    const [networkKey, setNetworkKey] = useState<number[]>(
        currentSettings.advanced.network_key === "GENERATE" ? generateNetworkKey() : currentSettings.advanced.network_key,
    );
    const [panIdInput, setPanIdInput] = useState<string | number>(`${panId}`);
    const [extPanIdInput, setExtPanIdInput] = useState<string>(extPanId.join(","));
    const [networkKeyInput, setNetworkKeyInput] = useState<string>(networkKey.join(","));
    const [restoreMode, setRestoreMode] = useState<boolean>(false);
    const [tab, setTab] = useState<TabName>("main");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const zipFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (deviceName) {
            const device = devices.find((device) => device.name === deviceName);

            if (!device) {
                return;
            }

            const options: Omit<Zigbee2MQTTSettings["serial"], "disable_led"> = {
                port: device.path,
                adapter: device.adapter,
                baudrate: device.baudRate ?? 115200,
                rtscts: device.rtscts === true,
            };

            setCurrentSettings((prev) => merge({}, prev, { serial: options }));
            setFormData((prev) => merge({}, prev, { serial: options }));
        }
    }, [deviceName, devices]);

    useEffect(() => {
        if (wifiChannel && Number.isFinite(wifiChannel)) {
            // WiFi 11-14, WiFi 6-10, WiFi 1-5
            const channel = wifiChannel >= 11 ? 15 : wifiChannel >= 6 ? 11 : 25;

            setCurrentSettings((prev) => merge({}, prev, { advanced: { channel } }));
            setFormData((prev) => merge({}, prev, { advanced: { channel } }));
        }
    }, [wifiChannel]);

    useEffect(() => {
        setPanIdInput(panId);
        setCurrentSettings((prev) => merge({}, prev, { advanced: { pan_id: panId } }));
        setFormData((prev) => merge({}, prev, { advanced: { pan_id: panId } }));
    }, [panId]);

    useEffect(() => {
        setExtPanIdInput(extPanId.join(","));
        setCurrentSettings((prev) => merge({}, prev, { advanced: { ext_pan_id: extPanId } }));
        setFormData((prev) => merge({}, prev, { advanced: { ext_pan_id: extPanId } }));
    }, [extPanId]);

    useEffect(() => {
        setNetworkKeyInput(networkKey.join(","));
        setCurrentSettings((prev) => merge({}, prev, { advanced: { network_key: networkKey } }));
        setFormData((prev) => merge({}, prev, { advanced: { network_key: networkKey } }));
    }, [networkKey]);

    const setSettings = useCallback(
        // biome-ignore lint/suspicious/useAwait: API
        async (options: Record<string, unknown>) => {
            if (tab === "main") {
                setCurrentSettings((prev) => merge({}, prev, options));
                setFormData((prev) => merge({}, prev, options));
            } else {
                setCurrentSettings((prev) => merge({}, prev, { [tab]: options }));
                setFormData((prev) => merge({}, prev, { [tab]: options }));
            }
        },
        [tab],
    );

    const onPanIdBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
        if (!e.target.validationMessage) {
            const rawValue = e.target.value;

            if (rawValue) {
                setPanId(Number.parseInt(rawValue, rawValue.startsWith("0x") ? 16 : 10));
            }
        }
    }, []);

    const onExtPanIdBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
        if (!e.target.validationMessage) {
            const rawValue = e.target.value;

            if (rawValue) {
                setExtPanId(inputToArray(rawValue));
            }
        }
    }, []);

    const onNetworkKeyBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
        if (!e.target.validationMessage) {
            const rawValue = e.target.value;

            if (rawValue) {
                setNetworkKey(inputToArray(rawValue));
            }
        }
    }, []);

    const onSubmit = useCallback(async () => {
        setSubmitError(null);
        setSubmitting(true);

        try {
            const response = await fetch("/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const submitResponse = (await response.json()) as OnboardSubmitResponse;

            if (submitResponse.success) {
                onDone(submitResponse.frontendUrl);
            } else {
                setSubmitError(submitResponse.error);
            }
        } catch (error) {
            setSubmitError((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    }, [formData, onDone]);

    const onSubmitZip = useCallback(async () => {
        if (!zipFile) {
            return;
        }

        setSubmitError(null);
        setSubmitting(true);

        try {
            const payload = await readFileAsBase64(zipFile);
            const response = await fetch("/submit-zip", {
                method: "POST",
                headers: { "Content-Type": "text/plain; charset=utf-8" },
                body: payload,
            });
            const submitResponse = (await response.json()) as OnboardSubmitResponse;

            if (submitResponse.success) {
                setZipFile(null);

                if (zipFileInputRef.current) {
                    zipFileInputRef.current.value = "";
                }

                onDone(submitResponse.frontendUrl);
            } else {
                setSubmitError(submitResponse.error);
            }
        } catch (error) {
            setSubmitError((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    }, [zipFile, onDone]);

    const onZipFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        setSubmitError(null);
        setZipFile(file ?? null);
    }, []);

    return (
        <div className="flex">
            <div className="card w-full">
                <div className="card-body">
                    <div className="flex justify-between">
                        <h1 className="card-title mb-3">Zigbee2MQTT Onboarding</h1>

                        <label className="label">
                            <input type="checkbox" className="toggle" onChange={(e) => setRestoreMode(e.target.checked)} />
                            Restore mode
                        </label>
                    </div>

                    {submitError && (
                        <div role="alert" className="alert alert-error">
                            <FontAwesomeIcon icon={faBan} />
                            <span>{submitError}</span>
                        </div>
                    )}

                    {restoreMode ? (
                        <>
                            <div className="">
                                <h2 className="text-lg">Restore files</h2>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Backup ZIP</legend>
                                    <input
                                        ref={zipFileInputRef}
                                        type="file"
                                        name="zip"
                                        accept=".zip,application/zip,application/x-zip-compressed"
                                        className="file-input w-full"
                                        onChange={onZipFileChange}
                                    />
                                    <p className="label">Overwrite the contents of the Zigbee2MQTT data folder with the contents of given ZIP file</p>
                                    <p className="label">
                                        Must be in same format as backups downloaded from MQTT backup response or from frontend
                                        Settings&gt;Tools&gt;Request Z2M backup
                                    </p>
                                </fieldset>
                            </div>

                            <div className="card-actions justify-end">
                                <button className="btn btn-primary" type="button" disabled={submitting || !zipFile} onClick={onSubmitZip}>
                                    {submitting ? "Uploading..." : "Upload ZIP"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="">
                                    <h2 className="text-lg">Coordinator/Adapter</h2>
                                    <SelectField
                                        name="devices_found"
                                        label="Devices found"
                                        detail="Optionally allows to configure coordinator port and type (if known) automatically"
                                        onChange={(e) => !e.target.validationMessage && setDeviceName(e.target.value)}
                                        value={deviceName}
                                        className="select w-full"
                                    >
                                        <option value="">-</option>
                                        {devices.map((device) => (
                                            <option value={device.name} key={`${device.name}-${device.path}`}>
                                                {device.name.replaceAll(",", "")}, {device.path}, {device.adapter ?? "unknown"}
                                            </option>
                                        ))}
                                    </SelectField>
                                </div>
                                <div className="">
                                    <h2 className="text-lg">Network</h2>
                                    <div className="grid grid-cols-1">
                                        <SelectField
                                            name="wifi_channel"
                                            label="Closest WiFi Channel"
                                            detail='Optionally set to your closest WiFi channel to pick the best value for "channel" (in "Advanced" tab)'
                                            onChange={(e) => !e.target.validationMessage && setWifiChannel(Number(e.target.value))}
                                            value={wifiChannel}
                                            className="select w-full"
                                        >
                                            <option value="">-</option>
                                            {WIFI_CHANNELS.map((channel) => (
                                                <option value={channel} key={channel}>
                                                    {channel}
                                                </option>
                                            ))}
                                        </SelectField>
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">PAN ID</legend>
                                            <div className="join">
                                                <input
                                                    type="text"
                                                    className="input w-full validator"
                                                    onChange={(e) => setPanIdInput(e.target.value)}
                                                    onBlur={onPanIdBlur}
                                                    required
                                                    pattern={PAN_ID_PATTERN}
                                                    value={panIdInput}
                                                />
                                                <Button
                                                    item=""
                                                    onClick={() => setPanId(generatePanID())}
                                                    className="btn btn-square btn-warning btn-outline join-item tooltip"
                                                    title="Random"
                                                >
                                                    <FontAwesomeIcon icon={faRandom} />
                                                </Button>
                                            </div>
                                            <p className="label">{panIdSchema.description}</p>
                                        </fieldset>
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Extended PAN ID</legend>
                                            <div className="join">
                                                <input
                                                    type="text"
                                                    className="input w-full validator"
                                                    onChange={(e) => setExtPanIdInput(e.target.value)}
                                                    onBlur={onExtPanIdBlur}
                                                    required
                                                    pattern={numCsvRegex(8)}
                                                    value={extPanIdInput}
                                                />
                                                <Button
                                                    item=""
                                                    onClick={() => setExtPanId(generateExtPanID())}
                                                    className="btn btn-square btn-warning btn-outline join-item tooltip"
                                                    title="Random"
                                                >
                                                    <FontAwesomeIcon icon={faRandom} />
                                                </Button>
                                            </div>
                                            <p className="label">{extPanIdSchema.description}</p>
                                        </fieldset>
                                    </div>
                                    <div className="grid grid-cols-1">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Network key</legend>
                                            <div className="join">
                                                <input
                                                    type="text"
                                                    className="input w-full validator"
                                                    onChange={(e) => setNetworkKeyInput(e.target.value)}
                                                    onBlur={onNetworkKeyBlur}
                                                    required
                                                    pattern={numCsvRegex(16)}
                                                    value={networkKeyInput}
                                                />
                                                <Button
                                                    item=""
                                                    onClick={() => setNetworkKey(generateNetworkKey())}
                                                    className="btn btn-square btn-warning btn-outline join-item tooltip"
                                                    title="Random"
                                                >
                                                    <FontAwesomeIcon icon={faRandom} />
                                                </Button>
                                            </div>
                                            <p className="label">{networkKeySchema.description}</p>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>

                            <div className="divider" />

                            <div className="tabs tabs-border">
                                <button type="button" className={`tab ${tab === "main" ? "tab-active" : ""}`} onClick={() => setTab("main")}>
                                    Main
                                </button>
                                <button type="button" className={`tab ${tab === "frontend" ? "tab-active" : ""}`} onClick={() => setTab("frontend")}>
                                    Frontend
                                </button>
                                <button type="button" className={`tab ${tab === "mqtt" ? "tab-active" : ""}`} onClick={() => setTab("mqtt")}>
                                    MQTT
                                </button>
                                <button type="button" className={`tab ${tab === "serial" ? "tab-active" : ""}`} onClick={() => setTab("serial")}>
                                    Serial
                                </button>
                                <button
                                    type="button"
                                    className={`tab ${tab === "availability" ? "tab-active" : ""}`}
                                    onClick={() => setTab("availability")}
                                >
                                    Availability
                                </button>
                                <button type="button" className={`tab ${tab === "ota" ? "tab-active" : ""}`} onClick={() => setTab("ota")}>
                                    OTA
                                </button>
                                <button type="button" className={`tab ${tab === "advanced" ? "tab-active" : ""}`} onClick={() => setTab("advanced")}>
                                    Advanced
                                </button>
                                <button
                                    type="button"
                                    className={`tab ${tab === "homeassistant" ? "tab-active" : ""}`}
                                    onClick={() => setTab("homeassistant")}
                                >
                                    Home Assistant
                                </button>
                                <button type="button" className={`tab ${tab === "health" ? "tab-active" : ""}`} onClick={() => setTab("health")}>
                                    Health
                                </button>
                                <div className="tab-content block h-full bg-base-100 p-3">
                                    {tab === "main" ? (
                                        <SettingsList
                                            schema={settingsSchema as unknown as JSONSchema7}
                                            data={currentSettings as unknown as Record<string, unknown>}
                                            set={setSettings}
                                            rootOnly
                                            namespace=""
                                        />
                                    ) : settingsSchema.properties[tab] ? (
                                        <SettingsList
                                            key={
                                                tab === "serial"
                                                    ? currentSettings.serial.port
                                                    : tab === "advanced"
                                                      ? currentSettings.advanced.channel
                                                      : undefined
                                            }
                                            schema={settingsSchema.properties[tab] as unknown as JSONSchema7}
                                            data={currentSettings[tab]}
                                            set={setSettings}
                                            namespace={tab}
                                        />
                                    ) : null}
                                </div>
                            </div>

                            <div className="divider" />

                            <div className="collapse collapse-arrow bg-base-100 shadow border-base-200 border mb-3">
                                <input type="checkbox" />
                                <div className="collapse-title font-semibold">Inspect configuration</div>
                                <div className="collapse-content text-sm">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Pending submit</legend>
                                            <Json obj={formData} lines={15} />
                                        </fieldset>
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Effective configuration once applied</legend>
                                            <Json obj={currentSettings} lines={15} />
                                        </fieldset>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions justify-end">
                                <button className="btn btn-primary" type="button" disabled={submitting} onClick={onSubmit}>
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
