import { type BasicFeature, type Device, FeatureAccessMode, type FeatureWithSubFeatures, type Group, type Scene } from "../../types.js";

import { isDevice } from "../../utils.js";

export function getScenes(target: Group | Device): Scene[] {
    if (isDevice(target)) {
        const scenes: Scene[] = [];

        for (const key in target.endpoints) {
            const ep = target.endpoints[key];

            for (const scene of ep.scenes) {
                scenes.push({ ...scene });
            }
        }

        return scenes;
    }

    return target.scenes;
}

const BLACKLISTED_PARTIAL_FEATURE_NAMES = ["schedule_", "_mode", "_options", "_startup", "_type", "inching_", "cyclic_", "_scene"];

const BLACKLISTED_FEATURE_NAMES = ["effect", "power_on_behavior", "gradient"];

const WHITELIST_FEATURE_NAMES = ["state", "color_temp", "color", "transition", "brightness"];

export const isValidForScenes = (expose: BasicFeature | FeatureWithSubFeatures): boolean => {
    if (expose.name) {
        if (WHITELIST_FEATURE_NAMES.includes(expose.name)) {
            return true;
        }

        for (const bName of BLACKLISTED_PARTIAL_FEATURE_NAMES) {
            if (expose.name.includes(bName)) {
                return false;
            }
        }

        if (BLACKLISTED_FEATURE_NAMES.includes(expose.name)) {
            return false;
        }
    }

    return (
        !expose.access ||
        expose.access === FeatureAccessMode.ALL ||
        expose.access === FeatureAccessMode.SET ||
        expose.access === FeatureAccessMode.STATE_SET
    );
};

export enum MergedDataType {
    /** length=0 */
    NO_DATA = 0,
    /** class=discrete, length=1 */
    DATA8 = 8,
    /** class=discrete, length=2 */
    DATA16 = 9,
    /** class=discrete, length=3 */
    DATA24 = 10,
    /** class=discrete, length=4 */
    DATA32 = 11,
    /** class=discrete, length=5 */
    DATA40 = 12,
    /** class=discrete, length=6 */
    DATA48 = 13,
    /** class=discrete, length=7 */
    DATA56 = 14,
    /** class=discrete, length=8 */
    DATA64 = 15,
    /** 0x00=false, 0x01=true, class=discrete, length=1, non-value=0xFF */
    BOOLEAN = 16,
    /** class=discrete, length=1 */
    BITMAP8 = 24,
    /** class=discrete, length=2 */
    BITMAP16 = 25,
    /** class=discrete, length=3 */
    BITMAP24 = 26,
    /** class=discrete, length=4 */
    BITMAP32 = 27,
    /** class=discrete, length=5 */
    BITMAP40 = 28,
    /** class=discrete, length=6 */
    BITMAP48 = 29,
    /** class=discrete, length=7 */
    BITMAP56 = 30,
    /** class=discrete, length=8 */
    BITMAP64 = 31,
    /** class=discrete, length=1, non-value=0xFF */
    UINT8 = 32,
    /** class=analog, length=2, non-value=0xFFFF */
    UINT16 = 33,
    /** class=analog, length=3, non-value=0xFFFFFF */
    UINT24 = 34,
    /** class=analog, length=4, non-value=0xFFFFFFFF */
    UINT32 = 35,
    /** class=analog, length=5, non-value=0xFFFFFFFFFF */
    UINT40 = 36,
    /** class=analog, length=6, non-value=0xFFFFFFFFFFFF */
    UINT48 = 37,
    /** class=analog, length=7, non-value=0xFFFFFFFFFFFFFF */
    UINT56 = 38,
    /** class=analog, length=8, non-value=0xFFFFFFFFFFFFFFFF */
    UINT64 = 39,
    /** class=analog, length=1, non-value=0x80 */
    INT8 = 40,
    /** class=analog, length=2, non-value=0x8000 */
    INT16 = 41,
    /** class=analog, length=3, non-value=0x800000 */
    INT24 = 42,
    /** class=analog, length=4, non-value=0x80000000 */
    INT32 = 43,
    /** class=analog, length=5, non-value=0x8000000000 */
    INT40 = 44,
    /** class=analog, length=6, non-value=0x800000000000 */
    INT48 = 45,
    /** class=analog, length=7, non-value=0x80000000000000 */
    INT56 = 46,
    /** class=analog, length=8, non-value=0x8000000000000000 */
    INT64 = 47,
    /** class=discrete, length=1, non-value=0xFF */
    ENUM8 = 48,
    /** class=discrete, length=2, non-value=0xFF */
    ENUM16 = 49,
    /** class=analog, length=2, non-value=NaN */
    SEMI_PREC = 56,
    /** class=analog, length=4, non-value=NaN */
    SINGLE_PREC = 57,
    /** class=analog, length=8, non-value=NaN */
    DOUBLE_PREC = 58,
    /** class=composite, length=0x00-0xFE, non-value=0xFF */
    OCTET_STR = 65,
    /** class=composite, length=0x00-0xFE, non-value=0xFF */
    CHAR_STR = 66,
    /** class=composite, length=0x0000-0xFFFE, non-value=0xFFFF */
    LONG_OCTET_STR = 67,
    /** class=composite, length=0x0000-0xFFFE, non-value=0xFFFF */
    LONG_CHAR_STR = 68,
    /** class=composite, length=variable, non-value=(length=0xFFFF) */
    ARRAY = 72,
    /** class=composite, length=variable, non-value=(length=0xFFFF) */
    STRUCT = 76,
    /** class=composite, length=max(0xFFFE * DataType) non-value=(length=0xFFFF) */
    SET = 80,
    /** @see SET Same but allows duplicate values */
    BAG = 81,
    /** Time of Day, @see ZclTimeOfDay , class=analog, length=4, unused-subfield=0xFF, non-value=0xFFFFFFFF */
    TOD = 224,
    /** @see ZclDate , class=analog, length=4, unused-subfield=0xFF, non-value=0xFFFFFFFF */
    DATE = 225,
    /** Number of seconds since 2000-01-01 00:00:00 UTC, class=analog, length=4, non-value=0xFFFFFFFF */
    UTC = 226,
    /** Defined in 2.6.1.3 of ZCL spec, class=discrete, length=2, non-value=0xFFFF */
    CLUSTER_ID = 232,
    /** Defined in 2.6.1.4 of ZCL spec, class=discrete, length=2, non-value=0xFFFF */
    ATTR_ID = 233,
    /** BACnet OID, allow internetworking (format defined in BACnet ref), class=discrete, length=4, non-value=0xFFFFFFFF */
    BAC_OID = 234,
    /** class=discrete, length=8, non-value=0xFFFFFFFFFFFFFFFF */
    IEEE_ADDR = 240,
    /** Any 128-bit value, class=discrete, length=16 */
    SEC_KEY = 241,
    /** length=0 */
    UNKNOWN = 255,

    USE_DATA_TYPE = 1000,
    LIST_UINT8 = 1001,
    LIST_UINT16 = 1002,
    LIST_UINT24 = 1003,
    LIST_UINT32 = 1004,
    LIST_ZONEINFO = 1005,
    EXTENSION_FIELD_SETS = 1006,
    LIST_THERMO_TRANSITIONS = 1007,
    BUFFER = 1008,
    GPD_FRAME = 1009,
    STRUCTURED_SELECTOR = 1010,
    LIST_TUYA_DATAPOINT_VALUES = 1011,
    LIST_MIBOXER_ZONES = 1012,
    BIG_ENDIAN_UINT24 = 1013,
    MI_STRUCT = 1014,
}
