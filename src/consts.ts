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

export const CONNECTION_STATUS: Record<number, [string, string]> = {
    [WebSocket.CONNECTING]: ["CONNECTING", "text-info"],
    [WebSocket.OPEN]: ["OPEN", "text-success"],
    [WebSocket.CLOSING]: ["CLOSING", "text-warning"],
    [WebSocket.CLOSED]: ["CLOSED", "text-error"],
};

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

export const Z2M_COMMIT_URL = "https://github.com/Koenkk/zigbee2mqtt/commit/";

export const RELEASE_TAG_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/releases/tag/v";

export const Z2M_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee2mqtt/releases/tag/";

export const ZHC_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee-herdsman-converters/releases/tag/v";

export const ZH_RELEASE_TAG_URL = "https://github.com/Koenkk/zigbee-herdsman/releases/tag/v";

export const CONTRIBUTE_TRANSLATION_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/issues/199";
export const CONTRIBUTE_WINDFRONT_URL = "https://github.com/Nerivec/zigbee2mqtt-windfront/blob/main/CONTRIBUTING.md";
export const CONTRIBUTE_Z2M_URL = "https://github.com/Koenkk/zigbee2mqtt/blob/master/CONTRIBUTING.md";
export const CONTRIBUTE_ZHC_URL = "https://github.com/Koenkk/zigbee-herdsman-converters?tab=readme-ov-file#contributing";
export const CONTRIBUTE_ZH_URL = "https://github.com/Koenkk/zigbee-herdsman/wiki";

export enum InterviewState {
    Pending = "PENDING",
    InProgress = "IN_PROGRESS",
    Successful = "SUCCESSFUL",
    Failed = "FAILED",
}

export const REACT_SELECT_DEFAULT_CLASSNAMES = {
    clearIndicator: () => "text-base-content/70 hover:text-error cursor-pointer",
    container: () => "w-full !max-w-full",
    control: ({ isDisabled }) => `w-full input input-bordered !h-auto ${isDisabled ? "pointer-events-none opacity-50" : ""}`,
    dropdownIndicator: ({ isFocused }) => `text-base-content ${isFocused ? "text-primary" : ""}`,
    // group: () => "",
    groupHeading: () => "px-1 py-2 text-xs font-semibold uppercase text-base-content/70",
    indicatorsContainer: () => "flex items-center",
    indicatorSeparator: () => "hidden",
    input: () => "text-base-content",
    // loadingIndicator: () => "",
    // loadingMessage: () => "",
    menu: () => "!min-w-full !w-fit dropdown-content menu p-0 bg-base-100 text-base-content shadow-md border border-base-300 rounded-box !z-2",
    menuList: () => "max-h-60 overflow-auto",
    // menuPortal: () => "",
    multiValue: () => "p-1 bg-base-200 text-base-content rounded-box",
    // multiValueLabel: () => "",
    multiValueRemove: () => "p-0 ps-1 text-base-content/50 hover:text-error cursor-pointer",
    noOptionsMessage: () => "px-2 py-2 text-base-content/70",
    option: ({ isFocused, isSelected }) =>
        `px-3 py-2 cursor-pointer ${isSelected ? "bg-primary text-primary-content" : isFocused ? "bg-primary/10" : ""}`,
    placeholder: () => "text-base-content/60 truncate",
    singleValue: () => "text-base-content truncate",
    valueContainer: () => "gap-1 py-1 min-w-0",
};
