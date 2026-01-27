import type { AttributeDefinition } from "./types.js";

export enum DataType {
    NO_DATA = 0,
    DATA8 = 8,
    DATA16 = 9,
    DATA24 = 10,
    DATA32 = 11,
    DATA40 = 12,
    DATA48 = 13,
    DATA56 = 14,
    DATA64 = 15,
    BOOLEAN = 16,
    BITMAP8 = 24,
    BITMAP16 = 25,
    BITMAP24 = 26,
    BITMAP32 = 27,
    BITMAP40 = 28,
    BITMAP48 = 29,
    BITMAP56 = 30,
    BITMAP64 = 31,
    UINT8 = 32,
    UINT16 = 33,
    UINT24 = 34,
    UINT32 = 35,
    UINT40 = 36,
    UINT48 = 37,
    UINT56 = 38,
    UINT64 = 39,
    INT8 = 40,
    INT16 = 41,
    INT24 = 42,
    INT32 = 43,
    INT40 = 44,
    INT48 = 45,
    INT56 = 46,
    INT64 = 47,
    ENUM8 = 48,
    ENUM16 = 49,
    SEMI_PREC = 56,
    SINGLE_PREC = 57,
    DOUBLE_PREC = 58,
    OCTET_STR = 65,
    CHAR_STR = 66,
    LONG_OCTET_STR = 67,
    LONG_CHAR_STR = 68,
    ARRAY = 72,
    STRUCT = 76,
    SET = 80,
    BAG = 81,
    TOD = 224,
    DATE = 225,
    UTC = 226,
    CLUSTER_ID = 232,
    ATTR_ID = 233,
    BAC_OID = 234,
    IEEE_ADDR = 240,
    SEC_KEY = 241,
    UNKNOWN = 255,
}

export enum BuffaloZclDataType {
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

export const isDiscreteOrCompositeDataType = (attrDefinition: AttributeDefinition): boolean =>
    (attrDefinition.type >= DataType.DATA8 && attrDefinition.type <= DataType.BITMAP64) ||
    attrDefinition.type === DataType.ENUM8 ||
    attrDefinition.type === DataType.ENUM16 ||
    (attrDefinition.type >= DataType.OCTET_STR && attrDefinition.type <= DataType.BAG) ||
    (attrDefinition.type >= DataType.CLUSTER_ID && attrDefinition.type <= DataType.SEC_KEY);

export const isAnalogDataType = (attrDefinition: AttributeDefinition): boolean =>
    (attrDefinition.type >= DataType.UINT8 && attrDefinition.type <= DataType.INT64) ||
    (attrDefinition.type >= DataType.SEMI_PREC && attrDefinition.type <= DataType.DOUBLE_PREC) ||
    (attrDefinition.type >= DataType.TOD && attrDefinition.type <= DataType.UTC);
