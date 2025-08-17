export const AVAILABILITY_FEATURE_TOPIC_ENDING = "/availability";

export const LOG_LEVELS = ["debug", "info", "warning", "error"];

export const LOG_LIMITS = [100, 200, 500, 1000];

export const LOG_LEVELS_CMAP = {
    error: "text-error",
    warning: "text-warning",
    info: "text-info",
    debug: "opacity-50",
};

export const NOTIFICATIONS_LIMIT_PER_SOURCE = 20;

export const BLACKLISTED_NOTIFICATIONS = ["MQTT publish", " COUNTERS]"];

export const TOAST_STATUSES_CMAP = {
    error: "text-error",
    ok: "text-success",
};

export const PUBLISH_GET_SET_REGEX = /^z2m: Publish '(set|get)' '(.+)' to '(.+)' failed.*\((.*)\)'$/;

export const SUPPORT_NEW_DEVICES_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html";

export const DEVICE_OPTIONS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/configuration/devices-groups.html#generic-device-options";

export const GROUP_OPTIONS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/usage/groups.html#configuration";

export const CONFIGURATION_DOCS_URL = "https://www.zigbee2mqtt.io/guide/configuration/";

export const MQTT_TOPICS_DOCS_URL = "https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html";

export const CONVERTERS_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/more/external_converters.html";

export const CONVERTERS_CODESPACE_URL = "https://github.com/Nerivec/z2m-external-converter-dev";

export const EXTENSIONS_DOCS_URL = "https://www.zigbee2mqtt.io/advanced/more/external_extensions.html";

export const DEVICE_AVAILABILITY_DOCS_URL =
    "https://www.zigbee2mqtt.io/guide/configuration/device-availability.html#availability-advanced-configuration";

export const LOAD_AVERAGE_DOCS_URL = "https://www.digitalocean.com/community/tutorials/load-average-in-linux";

export const MQTT_SPEC_URL = "https://mqtt.org/mqtt-specification/";

export const NODEJS_RELEASE_URL = "https://nodejs.org/en/about/previous-releases";

export const NEW_GITHUB_ISSUE_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/issues/new";

export const Z2M_NEW_GITHUB_ISSUE_URL = "https://github.com/Koenkk/zigbee2mqtt/issues/new";

export const ZHC_NEW_GITHUB_ISSUE_URL = "https://github.com/Koenkk/zigbee-herdsman-converters/issues/new";

export const Z2M_COMMIT_URL = "https://github.com/Koenkk/zigbee2mqtt/commit/";

export const RELEASE_TAG_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/releases/tag/v";

export const Z2M_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee2mqtt/releases/tag/";

export const ZHC_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee-herdsman-converters/releases/tag/v";

export const ZH_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee-herdsman/releases/tag/v";

export enum InterviewState {
    Pending = "PENDING",
    InProgress = "IN_PROGRESS",
    Successful = "SUCCESSFUL",
    Failed = "FAILED",
}
