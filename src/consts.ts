export const LOG_LEVELS = ["debug", "info", "warning", "error"];

export const LOG_LIMITS = [100, 200, 500, 1000];

export const LOG_LEVELS_CMAP = {
    error: "text-error",
    warning: "text-warning",
    info: "text-info",
    debug: "opacity-50",
};

export const SUPPORT_NEW_DEVICES_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html";

export const DEVICE_OPTIONS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/configuration/devices-groups.html#generic-device-options";

export const GROUP_OPTIONS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/usage/groups.html#configuration";

export const CONFIGURATION_DOCS_URL = "https://www.zigbee2mqtt.io/guide/configuration/";

export const MQTT_TOPICS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html";

export const CONVERTERS_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/more/external_converters.html";

export const CONVERTERS_CODESPACE_URL = "https://github.com/Nerivec/z2m-external-converter-dev";

export const EXTENSIONS_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/more/external_extensions.html";

export const NEW_GITHUB_ISSUE_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/issues/new";

export enum InterviewState {
    Pending = "PENDING",
    InProgress = "IN_PROGRESS",
    Successful = "SUCCESSFUL",
    Failed = "FAILED",
}
