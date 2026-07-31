import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { Message } from "../src/types.js";

export const BRIDGE_DEFINITION: Message<Zigbee2MQTTAPI["bridge/definitions"]> = {
    payload: {
        actions: ["raw", "philips_hue_factory_reset"],
        clusters: {
            barrierControl: {
                ID: 259,
                attributes: {
                    barrierPosition: {
                        ID: 10,
                        max: 100,
                        name: "barrierPosition",
                        report: true,
                        required: true,
                        scene: true,
                        special: { 255: "PositionUnknown" },
                        type: 32,
                    },
                    capabilities: {
                        ID: 3,
                        name: "capabilities",
                        required: true,
                        type: 24,
                    },
                    closeEvents: {
                        ID: 5,
                        default: 0,
                        max: 65534,
                        name: "closeEvents",
                        type: 33,
                        write: true,
                    },
                    closePeriod: {
                        ID: 9,
                        max: 65534,
                        name: "closePeriod",
                        type: 33,
                        write: true,
                    },
                    commandCloseEvents: {
                        ID: 7,
                        default: 0,
                        max: 65534,
                        name: "commandCloseEvents",
                        type: 33,
                        write: true,
                    },
                    commandOpenEvents: {
                        ID: 6,
                        default: 0,
                        max: 65534,
                        name: "commandOpenEvents",
                        type: 33,
                        write: true,
                    },
                    movingState: {
                        ID: 1,
                        name: "movingState",
                        report: true,
                        required: true,
                        type: 48,
                    },
                    openEvents: {
                        ID: 4,
                        default: 0,
                        max: 65534,
                        name: "openEvents",
                        type: 33,
                        write: true,
                    },
                    openPeriod: {
                        ID: 8,
                        max: 65534,
                        name: "openPeriod",
                        type: 33,
                        write: true,
                    },
                    safetyStatus: {
                        ID: 2,
                        name: "safetyStatus",
                        report: true,
                        required: true,
                        type: 25,
                    },
                },
                commands: {
                    goToPercent: {
                        ID: 0,
                        name: "goToPercent",
                        parameters: [
                            {
                                max: 100,
                                min: 0,
                                name: "percentOpen",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    stop: {
                        ID: 1,
                        name: "stop",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "barrierControl",
            },
            closuresDoorLock: {
                ID: 257,
                attributes: {
                    actuatorEnabled: {
                        ID: 2,
                        name: "actuatorEnabled",
                        required: true,
                        type: 16,
                    },
                    alarmMask: {
                        ID: 64,
                        default: 0,
                        name: "alarmMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    autoRelockTime: {
                        ID: 35,
                        default: 0,
                        name: "autoRelockTime",
                        report: true,
                        special: { 0: "Disabled" },
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    defaultConfigurationRegister: {
                        ID: 39,
                        default: 0,
                        name: "defaultConfigurationRegister",
                        report: true,
                        type: 25,
                    },
                    doorClosedEvents: {
                        ID: 5,
                        name: "doorClosedEvents",
                        type: 35,
                        write: true,
                    },
                    doorOpenEvents: {
                        ID: 4,
                        name: "doorOpenEvents",
                        type: 35,
                        write: true,
                    },
                    doorState: {
                        ID: 3,
                        name: "doorState",
                        report: true,
                        type: 48,
                    },
                    enableInsideStatusLed: {
                        ID: 42,
                        default: 0,
                        name: "enableInsideStatusLed",
                        report: true,
                        type: 16,
                        write: true,
                    },
                    enableLocalProgramming: {
                        ID: 40,
                        default: 1,
                        name: "enableLocalProgramming",
                        report: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    enableLogging: {
                        ID: 32,
                        default: 0,
                        name: "enableLogging",
                        report: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    enableOneTouchLocking: {
                        ID: 41,
                        default: 0,
                        name: "enableOneTouchLocking",
                        report: true,
                        type: 16,
                        write: true,
                    },
                    enablePrivacyModeButton: {
                        ID: 43,
                        default: 0,
                        name: "enablePrivacyModeButton",
                        report: true,
                        type: 16,
                        write: true,
                    },
                    keypadOperationEventMask: {
                        ID: 65,
                        default: 0,
                        name: "keypadOperationEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    keypadProgrammingEventMask: {
                        ID: 69,
                        default: 0,
                        name: "keypadProgrammingEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    language: {
                        ID: 33,
                        default: "",
                        length: 2,
                        name: "language",
                        report: true,
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    ledSettings: {
                        ID: 34,
                        default: 0,
                        name: "ledSettings",
                        report: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    lockState: {
                        ID: 0,
                        name: "lockState",
                        report: true,
                        required: true,
                        type: 48,
                    },
                    lockType: {
                        ID: 1,
                        name: "lockType",
                        required: true,
                        type: 48,
                    },
                    manualOperationEventMask: {
                        ID: 67,
                        default: 0,
                        name: "manualOperationEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    maxPinLen: {
                        ID: 23,
                        default: 8,
                        name: "maxPinLen",
                        type: 32,
                    },
                    maxRfidLen: {
                        ID: 25,
                        default: 20,
                        name: "maxRfidLen",
                        type: 32,
                    },
                    minPinLen: {
                        ID: 24,
                        default: 4,
                        name: "minPinLen",
                        type: 32,
                    },
                    minRfidLen: {
                        ID: 26,
                        default: 8,
                        name: "minRfidLen",
                        type: 32,
                    },
                    numOfHolidayScheduledsSupported: {
                        ID: 22,
                        default: 0,
                        name: "numOfHolidayScheduledsSupported",
                        type: 32,
                    },
                    numOfLockRecordsSupported: {
                        ID: 16,
                        default: 0,
                        name: "numOfLockRecordsSupported",
                        type: 33,
                    },
                    numOfPinUsersSupported: {
                        ID: 18,
                        default: 0,
                        name: "numOfPinUsersSupported",
                        type: 33,
                    },
                    numOfRfidUsersSupported: {
                        ID: 19,
                        default: 0,
                        name: "numOfRfidUsersSupported",
                        type: 33,
                    },
                    numOfTotalUsersSupported: {
                        ID: 17,
                        default: 0,
                        name: "numOfTotalUsersSupported",
                        type: 33,
                    },
                    numOfWeekDaySchedulesSupportedPerUser: {
                        ID: 20,
                        default: 0,
                        name: "numOfWeekDaySchedulesSupportedPerUser",
                        type: 32,
                    },
                    numOfYearDaySchedulesSupportedPerUser: {
                        ID: 21,
                        default: 0,
                        name: "numOfYearDaySchedulesSupportedPerUser",
                        type: 32,
                    },
                    openPeriod: {
                        ID: 6,
                        name: "openPeriod",
                        type: 33,
                        write: true,
                    },
                    operatingMode: {
                        ID: 37,
                        default: 0,
                        name: "operatingMode",
                        report: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    requirePinForRfOperation: {
                        ID: 51,
                        default: 0,
                        name: "requirePinForRfOperation",
                        report: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    rfOperationEventMask: {
                        ID: 66,
                        default: 0,
                        name: "rfOperationEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    rfProgrammingEventMask: {
                        ID: 70,
                        default: 0,
                        name: "rfProgrammingEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    rfidOperationEventMask: {
                        ID: 68,
                        default: 0,
                        name: "rfidOperationEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    rfidProgrammingEventMask: {
                        ID: 71,
                        default: 0,
                        name: "rfidProgrammingEventMask",
                        report: true,
                        type: 25,
                        write: true,
                    },
                    sendPinOta: {
                        ID: 50,
                        default: 0,
                        name: "sendPinOta",
                        report: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    soundVolume: {
                        ID: 36,
                        default: 0,
                        name: "soundVolume",
                        report: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    supportedOperatingModes: {
                        ID: 38,
                        default: 1,
                        name: "supportedOperatingModes",
                        type: 25,
                    },
                    userCodeTemporaryDisableTime: {
                        ID: 49,
                        default: 0,
                        name: "userCodeTemporaryDisableTime",
                        report: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    wrongCodeEntryLimit: {
                        ID: 48,
                        default: 0,
                        name: "wrongCodeEntryLimit",
                        report: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    zigbeeSecurityLevel: {
                        ID: 52,
                        default: 0,
                        name: "zigbeeSecurityLevel",
                        report: true,
                        type: 48,
                    },
                },
                commands: {
                    clearAllPinCodes: {
                        ID: 8,
                        name: "clearAllPinCodes",
                        parameters: [],
                        response: 8,
                    },
                    clearAllRfidCodes: {
                        ID: 25,
                        name: "clearAllRfidCodes",
                        parameters: [],
                        response: 25,
                    },
                    clearHolidaySchedule: {
                        ID: 19,
                        name: "clearHolidaySchedule",
                        parameters: [
                            {
                                name: "holidayscheduleid",
                                type: 32,
                            },
                        ],
                        response: 19,
                    },
                    clearPinCode: {
                        ID: 7,
                        name: "clearPinCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 7,
                    },
                    clearRfidCode: {
                        ID: 24,
                        name: "clearRfidCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 24,
                    },
                    clearWeekDaySchedule: {
                        ID: 13,
                        name: "clearWeekDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 13,
                    },
                    clearYearDaySchedule: {
                        ID: 16,
                        name: "clearYearDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 16,
                    },
                    getHolidaySchedule: {
                        ID: 18,
                        name: "getHolidaySchedule",
                        parameters: [
                            {
                                name: "holidayscheduleid",
                                type: 32,
                            },
                        ],
                        response: 18,
                    },
                    getLogRecord: {
                        ID: 4,
                        name: "getLogRecord",
                        parameters: [
                            {
                                name: "logindex",
                                special: { 0: "MostRecent" },
                                type: 33,
                            },
                        ],
                        response: 4,
                    },
                    getPinCode: {
                        ID: 6,
                        name: "getPinCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 6,
                    },
                    getRfidCode: {
                        ID: 23,
                        name: "getRfidCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 23,
                    },
                    getUserStatus: {
                        ID: 10,
                        name: "getUserStatus",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 10,
                    },
                    getUserType: {
                        ID: 21,
                        name: "getUserType",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 21,
                    },
                    getWeekDaySchedule: {
                        ID: 12,
                        name: "getWeekDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 12,
                    },
                    getYearDaySchedule: {
                        ID: 15,
                        name: "getYearDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                        ],
                        response: 15,
                    },
                    lockDoor: {
                        ID: 0,
                        name: "lockDoor",
                        parameters: [
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    setHolidaySchedule: {
                        ID: 17,
                        name: "setHolidaySchedule",
                        parameters: [
                            {
                                name: "holidayscheduleid",
                                type: 32,
                            },
                            {
                                name: "zigbeelocalstarttime",
                                type: 35,
                            },
                            {
                                name: "zigbeelocalendtime",
                                type: 35,
                            },
                            {
                                name: "opermodelduringholiday",
                                type: 48,
                            },
                        ],
                        response: 17,
                    },
                    setPinCode: {
                        ID: 5,
                        name: "setPinCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        response: 5,
                    },
                    setRfidCode: {
                        ID: 22,
                        name: "setRfidCode",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        response: 22,
                    },
                    setUserStatus: {
                        ID: 9,
                        name: "setUserStatus",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                        ],
                        response: 9,
                    },
                    setUserType: {
                        ID: 20,
                        name: "setUserType",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                        ],
                        response: 20,
                    },
                    setWeekDaySchedule: {
                        ID: 11,
                        name: "setWeekDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "daysmask",
                                type: 24,
                            },
                            {
                                max: 23,
                                min: 0,
                                name: "starthour",
                                type: 32,
                            },
                            {
                                max: 59,
                                min: 0,
                                name: "startminute",
                                type: 32,
                            },
                            {
                                max: 23,
                                min: 0,
                                name: "endhour",
                                type: 32,
                            },
                            {
                                max: 59,
                                min: 0,
                                name: "endminute",
                                type: 32,
                            },
                        ],
                        response: 11,
                    },
                    setYearDaySchedule: {
                        ID: 14,
                        name: "setYearDaySchedule",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "zigbeelocalstarttime",
                                type: 35,
                            },
                            {
                                name: "zigbeelocalendtime",
                                type: 35,
                            },
                        ],
                        response: 14,
                    },
                    toggleDoor: {
                        ID: 2,
                        name: "toggleDoor",
                        parameters: [
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        response: 2,
                    },
                    unlockDoor: {
                        ID: 1,
                        name: "unlockDoor",
                        parameters: [
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                    unlockWithTimeout: {
                        ID: 3,
                        name: "unlockWithTimeout",
                        parameters: [
                            {
                                name: "timeout",
                                type: 33,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                        response: 3,
                    },
                },
                commandsResponse: {
                    clearAllPinCodesRsp: {
                        ID: 8,
                        name: "clearAllPinCodesRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearAllRfidCodesRsp: {
                        ID: 25,
                        name: "clearAllRfidCodesRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearHolidayScheduleRsp: {
                        ID: 19,
                        name: "clearHolidayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearPinCodeRsp: {
                        ID: 7,
                        name: "clearPinCodeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearRfidCodeRsp: {
                        ID: 24,
                        name: "clearRfidCodeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearWeekDayScheduleRsp: {
                        ID: 13,
                        name: "clearWeekDayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    clearYearDayScheduleRsp: {
                        ID: 16,
                        name: "clearYearDayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    getHolidayScheduleRsp: {
                        ID: 18,
                        name: "getHolidayScheduleRsp",
                        parameters: [
                            {
                                name: "holidayscheduleid",
                                type: 32,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                            {
                                name: "zigbeelocalstarttime",
                                type: 35,
                            },
                            {
                                name: "zigbeelocalendtime",
                                type: 35,
                            },
                            {
                                name: "opermodelduringholiday",
                                type: 48,
                            },
                        ],
                    },
                    getLogRecordRsp: {
                        ID: 4,
                        name: "getLogRecordRsp",
                        parameters: [
                            {
                                name: "logentryid",
                                type: 33,
                            },
                            {
                                name: "timestamp",
                                type: 35,
                            },
                            {
                                name: "eventtype",
                                type: 48,
                            },
                            {
                                name: "source",
                                type: 32,
                            },
                            {
                                name: "eventidalarmcode",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                    },
                    getPinCodeRsp: {
                        ID: 6,
                        name: "getPinCodeRsp",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                    },
                    getRfidCodeRsp: {
                        ID: 23,
                        name: "getRfidCodeRsp",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                            {
                                name: "pincodevalue",
                                type: 65,
                            },
                        ],
                    },
                    getUserStatusRsp: {
                        ID: 10,
                        name: "getUserStatusRsp",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                        ],
                    },
                    getUserTypeRsp: {
                        ID: 21,
                        name: "getUserTypeRsp",
                        parameters: [
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                        ],
                    },
                    getWeekDayScheduleRsp: {
                        ID: 12,
                        name: "getWeekDayScheduleRsp",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                            {
                                name: "daysmask",
                                type: 24,
                            },
                            {
                                max: 23,
                                min: 0,
                                name: "starthour",
                                type: 32,
                            },
                            {
                                max: 59,
                                min: 0,
                                name: "startminute",
                                type: 32,
                            },
                            {
                                max: 23,
                                min: 0,
                                name: "endhour",
                                type: 32,
                            },
                            {
                                max: 59,
                                min: 0,
                                name: "endminute",
                                type: 32,
                            },
                        ],
                    },
                    getYearDayScheduleRsp: {
                        ID: 15,
                        name: "getYearDayScheduleRsp",
                        parameters: [
                            {
                                name: "scheduleid",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "zigbeelocalstarttime",
                                type: 35,
                            },
                            {
                                name: "zigbeelocalendtime",
                                type: 35,
                            },
                        ],
                    },
                    lockDoorRsp: {
                        ID: 0,
                        name: "lockDoorRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    operationEventNotification: {
                        ID: 32,
                        name: "operationEventNotification",
                        parameters: [
                            {
                                name: "opereventsrc",
                                type: 32,
                            },
                            {
                                name: "opereventcode",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "pin",
                                type: 65,
                            },
                            {
                                name: "zigbeelocaltime",
                                type: 35,
                            },
                            {
                                name: "data",
                                type: 66,
                            },
                        ],
                    },
                    programmingEventNotification: {
                        ID: 33,
                        name: "programmingEventNotification",
                        parameters: [
                            {
                                name: "programeventsrc",
                                type: 32,
                            },
                            {
                                name: "programeventcode",
                                type: 32,
                            },
                            {
                                name: "userid",
                                type: 33,
                            },
                            {
                                name: "pin",
                                type: 65,
                            },
                            {
                                name: "usertype",
                                type: 48,
                            },
                            {
                                name: "userstatus",
                                type: 32,
                            },
                            {
                                name: "zigbeelocaltime",
                                type: 35,
                            },
                            {
                                name: "data",
                                type: 66,
                            },
                        ],
                    },
                    setHolidayScheduleRsp: {
                        ID: 17,
                        name: "setHolidayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setPinCodeRsp: {
                        ID: 5,
                        name: "setPinCodeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setRfidCodeRsp: {
                        ID: 22,
                        name: "setRfidCodeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setUserStatusRsp: {
                        ID: 9,
                        name: "setUserStatusRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setUserTypeRsp: {
                        ID: 20,
                        name: "setUserTypeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setWeekDayScheduleRsp: {
                        ID: 11,
                        name: "setWeekDayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    setYearDayScheduleRsp: {
                        ID: 14,
                        name: "setYearDayScheduleRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                    },
                    toggleDoorRsp: {
                        ID: 2,
                        name: "toggleDoorRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                    },
                    unlockDoorRsp: {
                        ID: 1,
                        name: "unlockDoorRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    unlockWithTimeoutRsp: {
                        ID: 3,
                        name: "unlockWithTimeoutRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                    },
                },
                name: "closuresDoorLock",
            },
            closuresShadeCfg: {
                ID: 256,
                attributes: {
                    closedLimit: {
                        ID: 16,
                        default: 1,
                        max: 65534,
                        min: 1,
                        name: "closedLimit",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    mode: {
                        ID: 17,
                        default: 0,
                        max: 254,
                        name: "mode",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    motorStepSize: {
                        ID: 1,
                        max: 254,
                        name: "motorStepSize",
                        type: 32,
                    },
                    physicalClosedLimit: {
                        ID: 0,
                        max: 65534,
                        min: 1,
                        name: "physicalClosedLimit",
                        type: 33,
                    },
                    status: {
                        ID: 2,
                        default: 0,
                        name: "status",
                        required: true,
                        type: 24,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "closuresShadeCfg",
            },
            closuresWindowCovering: {
                ID: 258,
                attributes: {
                    accelerationTimeLift: {
                        ID: 21,
                        default: 0,
                        max: 65535,
                        name: "accelerationTimeLift",
                        type: 33,
                        write: true,
                    },
                    configStatus: {
                        ID: 7,
                        default: 3,
                        name: "configStatus",
                        required: true,
                        type: 24,
                    },
                    currentPositionLiftCm: {
                        ID: 3,
                        default: 0,
                        max: 65535,
                        name: "currentPositionLiftCm",
                        type: 33,
                    },
                    currentPositionLiftPercentage: {
                        ID: 8,
                        default: 0,
                        max: 100,
                        name: "currentPositionLiftPercentage",
                        report: true,
                        scene: true,
                        type: 32,
                    },
                    currentPositionTiltDdegree: {
                        ID: 4,
                        default: 0,
                        max: 65535,
                        name: "currentPositionTiltDdegree",
                        type: 33,
                    },
                    currentPositionTiltPercentage: {
                        ID: 9,
                        default: 0,
                        max: 100,
                        name: "currentPositionTiltPercentage",
                        report: true,
                        scene: true,
                        type: 32,
                    },
                    decelerationTimeLift: {
                        ID: 22,
                        default: 0,
                        max: 65535,
                        name: "decelerationTimeLift",
                        type: 33,
                        write: true,
                    },
                    installedClosedLimitLiftCm: {
                        ID: 17,
                        default: 65535,
                        max: 65535,
                        name: "installedClosedLimitLiftCm",
                        type: 33,
                    },
                    installedClosedLimitTiltDdegree: {
                        ID: 19,
                        default: 65535,
                        max: 65535,
                        name: "installedClosedLimitTiltDdegree",
                        type: 33,
                    },
                    installedOpenLimitLiftCm: {
                        ID: 16,
                        default: 0,
                        max: 65535,
                        name: "installedOpenLimitLiftCm",
                        type: 33,
                    },
                    installedOpenLimitTiltDdegree: {
                        ID: 18,
                        default: 0,
                        max: 65535,
                        name: "installedOpenLimitTiltDdegree",
                        type: 33,
                    },
                    intermediateSetpointsLift: {
                        ID: 24,
                        default: "1,0x0000",
                        name: "intermediateSetpointsLift",
                        type: 65,
                        write: true,
                    },
                    intermediateSetpointsTilt: {
                        ID: 25,
                        default: "1,0x0000",
                        name: "intermediateSetpointsTilt",
                        type: 65,
                        write: true,
                    },
                    numOfActuationsLift: {
                        ID: 5,
                        default: 0,
                        max: 65535,
                        name: "numOfActuationsLift",
                        type: 33,
                    },
                    numOfActuationsTilt: {
                        ID: 6,
                        default: 0,
                        max: 65535,
                        name: "numOfActuationsTilt",
                        type: 33,
                    },
                    physicalClosedLimitLiftCm: {
                        ID: 1,
                        default: 0,
                        max: 65535,
                        name: "physicalClosedLimitLiftCm",
                        type: 33,
                    },
                    physicalClosedLimitTiltDdegree: {
                        ID: 2,
                        default: 0,
                        max: 65535,
                        name: "physicalClosedLimitTiltDdegree",
                        type: 33,
                    },
                    velocityLift: {
                        ID: 20,
                        default: 0,
                        max: 65535,
                        name: "velocityLift",
                        type: 33,
                        write: true,
                    },
                    windowCoveringMode: {
                        ID: 23,
                        default: 4,
                        name: "windowCoveringMode",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    windowCoveringType: {
                        ID: 0,
                        default: 0,
                        name: "windowCoveringType",
                        required: true,
                        type: 48,
                    },
                },
                commands: {
                    downClose: {
                        ID: 1,
                        name: "downClose",
                        parameters: [],
                        required: true,
                    },
                    goToLiftPercentage: {
                        ID: 5,
                        name: "goToLiftPercentage",
                        parameters: [
                            {
                                max: 100,
                                name: "percentageliftvalue",
                                type: 32,
                            },
                        ],
                    },
                    goToLiftValue: {
                        ID: 4,
                        name: "goToLiftValue",
                        parameters: [
                            {
                                name: "liftvalue",
                                type: 33,
                            },
                        ],
                    },
                    goToTiltPercentage: {
                        ID: 8,
                        name: "goToTiltPercentage",
                        parameters: [
                            {
                                max: 100,
                                name: "percentagetiltvalue",
                                type: 32,
                            },
                        ],
                    },
                    goToTiltValue: {
                        ID: 7,
                        name: "goToTiltValue",
                        parameters: [
                            {
                                name: "tiltvalue",
                                type: 33,
                            },
                        ],
                    },
                    stop: {
                        ID: 2,
                        name: "stop",
                        parameters: [],
                        required: true,
                    },
                    upOpen: {
                        ID: 0,
                        name: "upOpen",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "closuresWindowCovering",
            },
            genAlarms: {
                ID: 9,
                attributes: {
                    alarmCount: {
                        ID: 0,
                        default: 0,
                        max: 65535,
                        name: "alarmCount",
                        type: 33,
                    },
                },
                commands: {
                    getAlarm: {
                        ID: 2,
                        name: "getAlarm",
                        parameters: [],
                    },
                    reset: {
                        ID: 0,
                        name: "reset",
                        parameters: [
                            {
                                name: "alarmcode",
                                type: 48,
                            },
                            {
                                name: "clusterid",
                                type: 232,
                            },
                        ],
                        required: true,
                    },
                    resetAll: {
                        ID: 1,
                        name: "resetAll",
                        parameters: [],
                        required: true,
                    },
                    resetLog: {
                        ID: 3,
                        name: "resetLog",
                        parameters: [],
                    },
                },
                commandsResponse: {
                    alarm: {
                        ID: 0,
                        name: "alarm",
                        parameters: [
                            {
                                name: "alarmcode",
                                type: 48,
                            },
                            {
                                name: "clusterid",
                                type: 232,
                            },
                        ],
                        required: true,
                    },
                    getRsp: {
                        ID: 1,
                        name: "getRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "alarmcode",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "clusterid",
                                type: 232,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "timestamp",
                                type: 35,
                            },
                        ],
                    },
                },
                name: "genAlarms",
            },
            genAnalogInput: {
                ID: 12,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    engineeringUnits: {
                        ID: 117,
                        max: 65535,
                        name: "engineeringUnits",
                        type: 49,
                        write: true,
                        writeOptional: true,
                    },
                    maxPresentValue: {
                        ID: 65,
                        name: "maxPresentValue",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    minPresentValue: {
                        ID: 69,
                        name: "minPresentValue",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        report: true,
                        required: true,
                        type: 57,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    resolution: {
                        ID: 106,
                        name: "resolution",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        report: true,
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genAnalogInput",
            },
            genAnalogOutput: {
                ID: 13,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    engineeringUnits: {
                        ID: 117,
                        max: 65535,
                        name: "engineeringUnits",
                        type: 49,
                        write: true,
                        writeOptional: true,
                    },
                    maxPresentValue: {
                        ID: 65,
                        name: "maxPresentValue",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    minPresentValue: {
                        ID: 69,
                        name: "minPresentValue",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        report: true,
                        required: true,
                        type: 57,
                        write: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    resolution: {
                        ID: 106,
                        name: "resolution",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        report: true,
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genAnalogOutput",
            },
            genAnalogValue: {
                ID: 14,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    engineeringUnits: {
                        ID: 117,
                        max: 65535,
                        name: "engineeringUnits",
                        type: 49,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 57,
                        write: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genAnalogValue",
            },
            genBasic: {
                ID: 0,
                attributes: {
                    alarmMask: {
                        ID: 19,
                        default: 0,
                        name: "alarmMask",
                        type: 24,
                        write: true,
                    },
                    appVersion: {
                        ID: 1,
                        default: 0,
                        max: 255,
                        name: "appVersion",
                        type: 32,
                    },
                    dateCode: {
                        ID: 6,
                        default: "",
                        maxLen: 16,
                        name: "dateCode",
                        type: 66,
                    },
                    deviceEnabled: {
                        ID: 18,
                        default: 1,
                        name: "deviceEnabled",
                        type: 16,
                        write: true,
                    },
                    disableLocalConfig: {
                        ID: 20,
                        default: 0,
                        name: "disableLocalConfig",
                        type: 24,
                        write: true,
                    },
                    genericDeviceClass: {
                        ID: 8,
                        default: 255,
                        name: "genericDeviceClass",
                        type: 48,
                    },
                    genericDeviceType: {
                        ID: 9,
                        default: 255,
                        name: "genericDeviceType",
                        type: 48,
                    },
                    hwVersion: {
                        ID: 3,
                        default: 0,
                        max: 255,
                        name: "hwVersion",
                        type: 32,
                    },
                    locationDesc: {
                        ID: 16,
                        default: "",
                        maxLen: 16,
                        name: "locationDesc",
                        type: 66,
                        write: true,
                    },
                    manufacturerName: {
                        ID: 4,
                        default: "",
                        maxLen: 32,
                        name: "manufacturerName",
                        type: 66,
                    },
                    manufacturerVersionDetails: {
                        ID: 12,
                        default: "",
                        name: "manufacturerVersionDetails",
                        type: 66,
                    },
                    modelId: {
                        ID: 5,
                        default: "",
                        maxLen: 32,
                        name: "modelId",
                        type: 66,
                    },
                    physicalEnv: {
                        ID: 17,
                        default: 0,
                        name: "physicalEnv",
                        type: 48,
                        write: true,
                    },
                    powerSource: {
                        ID: 7,
                        default: 255,
                        name: "powerSource",
                        required: true,
                        type: 48,
                    },
                    productCode: {
                        ID: 10,
                        default: "",
                        name: "productCode",
                        type: 65,
                    },
                    productLabel: {
                        ID: 14,
                        default: "",
                        name: "productLabel",
                        type: 66,
                    },
                    productUrl: {
                        ID: 11,
                        default: "",
                        name: "productUrl",
                        type: 66,
                    },
                    serialNumber: {
                        ID: 13,
                        default: "",
                        name: "serialNumber",
                        type: 66,
                    },
                    stackVersion: {
                        ID: 2,
                        default: 0,
                        max: 255,
                        name: "stackVersion",
                        type: 32,
                    },
                    swBuildId: {
                        ID: 16384,
                        default: "",
                        maxLen: 16,
                        name: "swBuildId",
                        type: 66,
                    },
                    zclVersion: {
                        ID: 0,
                        default: 8,
                        max: 255,
                        name: "zclVersion",
                        required: true,
                        type: 32,
                    },
                },
                commands: {
                    resetFactDefault: {
                        ID: 0,
                        name: "resetFactDefault",
                        parameters: [],
                    },
                },
                commandsResponse: {},
                name: "genBasic",
            },
            genBinaryInput: {
                ID: 15,
                attributes: {
                    activeText: {
                        ID: 4,
                        default: "\u0000",
                        name: "activeText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    inactiveText: {
                        ID: 46,
                        default: "\u0000",
                        name: "inactiveText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    polarity: {
                        ID: 84,
                        default: 0,
                        name: "polarity",
                        type: 48,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genBinaryInput",
            },
            genBinaryOutput: {
                ID: 16,
                attributes: {
                    activeText: {
                        ID: 4,
                        default: "\u0000",
                        name: "activeText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    inactiveText: {
                        ID: 46,
                        default: "\u0000",
                        name: "inactiveText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    minimumOffTime: {
                        ID: 66,
                        default: 4294967295,
                        name: "minimumOffTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    minimumOnTime: {
                        ID: 67,
                        default: 4294967295,
                        name: "minimumOnTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    polarity: {
                        ID: 84,
                        default: 0,
                        name: "polarity",
                        type: 48,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genBinaryOutput",
            },
            genBinaryValue: {
                ID: 17,
                attributes: {
                    activeText: {
                        ID: 4,
                        default: "\u0000",
                        name: "activeText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    inactiveText: {
                        ID: 46,
                        default: "\u0000",
                        name: "inactiveText",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    minimumOffTime: {
                        ID: 66,
                        default: 4294967295,
                        name: "minimumOffTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    minimumOnTime: {
                        ID: 67,
                        default: 4294967295,
                        name: "minimumOnTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genBinaryValue",
            },
            genCommissioning: {
                ID: 21,
                attributes: {
                    channelmask: {
                        ID: 3,
                        name: "channelmask",
                        required: true,
                        type: 27,
                        write: true,
                    },
                    concentratorDiscoveryTime: {
                        ID: 66,
                        default: 0,
                        max: 255,
                        name: "concentratorDiscoveryTime",
                        type: 32,
                        write: true,
                    },
                    concentratorFlag: {
                        ID: 64,
                        default: 0,
                        name: "concentratorFlag",
                        type: 16,
                        write: true,
                    },
                    concentratorRadius: {
                        ID: 65,
                        default: 15,
                        max: 255,
                        name: "concentratorRadius",
                        type: 32,
                        write: true,
                    },
                    extendedPANId: {
                        ID: 1,
                        default: "0xffffffffffffffff",
                        name: "extendedPANId",
                        required: true,
                        special: { "0xffffffffffffffff": "PANIdUnspecified" },
                        type: 240,
                        write: true,
                    },
                    indirectPollRate: {
                        ID: 48,
                        max: 65535,
                        name: "indirectPollRate",
                        type: 33,
                        write: true,
                    },
                    maxRejoinInterval: {
                        ID: 35,
                        default: 3600,
                        max: 65535,
                        min: 1,
                        name: "maxRejoinInterval",
                        type: 33,
                        write: true,
                    },
                    networkKey: {
                        ID: 18,
                        name: "networkKey",
                        required: true,
                        type: 241,
                        write: true,
                    },
                    networkKeySeqNum: {
                        ID: 21,
                        default: 0,
                        max: 255,
                        name: "networkKeySeqNum",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    networkKeyType: {
                        ID: 22,
                        name: "networkKeyType",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    networkManagerress: {
                        ID: 23,
                        default: 0,
                        name: "networkManagerress",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    panId: {
                        ID: 2,
                        max: 65535,
                        name: "panId",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    parentRetryThreshold: {
                        ID: 49,
                        max: 255,
                        name: "parentRetryThreshold",
                        type: 32,
                    },
                    preconfiguredLinkKey: {
                        ID: 20,
                        name: "preconfiguredLinkKey",
                        required: true,
                        type: 241,
                        write: true,
                    },
                    protocolVersion: {
                        ID: 4,
                        max: 2,
                        min: 2,
                        name: "protocolVersion",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    rejoinInterval: {
                        ID: 34,
                        default: 60,
                        min: 1,
                        name: "rejoinInterval",
                        type: 33,
                        write: true,
                    },
                    scanAttempts: {
                        ID: 32,
                        default: 5,
                        max: 255,
                        min: 1,
                        name: "scanAttempts",
                        type: 32,
                        write: true,
                    },
                    shortress: {
                        ID: 0,
                        max: 65527,
                        name: "shortress",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    stackProfile: {
                        ID: 5,
                        max: 2,
                        min: 1,
                        name: "stackProfile",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    startupControl: {
                        ID: 6,
                        max: 3,
                        name: "startupControl",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    timeBetweenScans: {
                        ID: 33,
                        default: 100,
                        max: 65535,
                        min: 1,
                        name: "timeBetweenScans",
                        type: 33,
                        write: true,
                    },
                    trustCenterMasterKey: {
                        ID: 17,
                        name: "trustCenterMasterKey",
                        type: 241,
                        write: true,
                    },
                    trustCenterress: {
                        ID: 16,
                        default: "0x0000000000000000",
                        name: "trustCenterress",
                        required: true,
                        special: { "0x0000000000000000": "AddressUnspecified" },
                        type: 240,
                        write: true,
                    },
                    useInsecureJoin: {
                        ID: 19,
                        default: 1,
                        name: "useInsecureJoin",
                        required: true,
                        type: 16,
                        write: true,
                    },
                },
                commands: {
                    resetStartupParams: {
                        ID: 3,
                        name: "resetStartupParams",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "index",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    restartDevice: {
                        ID: 0,
                        name: "restartDevice",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "delay",
                                type: 32,
                            },
                            {
                                name: "jitter",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    restoreStartupParams: {
                        ID: 2,
                        name: "restoreStartupParams",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "index",
                                type: 32,
                            },
                        ],
                    },
                    saveStartupParams: {
                        ID: 1,
                        name: "saveStartupParams",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "index",
                                type: 32,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    resetStartupParamsRsp: {
                        ID: 3,
                        name: "resetStartupParamsRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    restartDeviceRsp: {
                        ID: 0,
                        name: "restartDeviceRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    restoreStartupParamsRsp: {
                        ID: 2,
                        name: "restoreStartupParamsRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    saveStartupParamsRsp: {
                        ID: 1,
                        name: "saveStartupParamsRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                },
                name: "genCommissioning",
            },
            genDeviceTempCfg: {
                ID: 2,
                attributes: {
                    currentTemperature: {
                        ID: 0,
                        max: 200,
                        min: -200,
                        name: "currentTemperature",
                        required: true,
                        type: 41,
                    },
                    devTempAlarmMask: {
                        ID: 16,
                        default: 0,
                        name: "devTempAlarmMask",
                        type: 24,
                        write: true,
                    },
                    highTempDwellTripPoint: {
                        ID: 20,
                        max: 16777215,
                        name: "highTempDwellTripPoint",
                        type: 34,
                        write: true,
                    },
                    highTempThres: {
                        ID: 18,
                        max: 200,
                        min: -200,
                        name: "highTempThres",
                        type: 41,
                        write: true,
                    },
                    lowTempDwellTripPoint: {
                        ID: 19,
                        max: 16777215,
                        name: "lowTempDwellTripPoint",
                        type: 34,
                        write: true,
                    },
                    lowTempThres: {
                        ID: 17,
                        max: 200,
                        min: -200,
                        name: "lowTempThres",
                        type: 41,
                        write: true,
                    },
                    maxTempExperienced: {
                        ID: 2,
                        max: 200,
                        min: -200,
                        name: "maxTempExperienced",
                        type: 41,
                    },
                    minTempExperienced: {
                        ID: 1,
                        max: 200,
                        min: -200,
                        name: "minTempExperienced",
                        type: 41,
                    },
                    overTempTotalDwell: {
                        ID: 3,
                        default: 0,
                        max: 65535,
                        name: "overTempTotalDwell",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genDeviceTempCfg",
            },
            genGroups: {
                ID: 4,
                attributes: {
                    nameSupport: {
                        ID: 0,
                        default: 0,
                        name: "nameSupport",
                        required: true,
                        type: 24,
                    },
                },
                commands: {
                    add: {
                        ID: 0,
                        name: "add",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "groupname",
                                type: 66,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    addIfIdentifying: {
                        ID: 5,
                        name: "addIfIdentifying",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "groupname",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    getMembership: {
                        ID: 2,
                        name: "getMembership",
                        parameters: [
                            {
                                name: "groupcount",
                                type: 32,
                            },
                            {
                                name: "grouplist",
                                type: 1002,
                            },
                        ],
                        required: true,
                        response: 2,
                    },
                    remove: {
                        ID: 3,
                        name: "remove",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 3,
                    },
                    removeAll: {
                        ID: 4,
                        name: "removeAll",
                        parameters: [],
                        required: true,
                    },
                    view: {
                        ID: 1,
                        name: "view",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                },
                commandsResponse: {
                    addRsp: {
                        ID: 0,
                        name: "addRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    getMembershipRsp: {
                        ID: 2,
                        name: "getMembershipRsp",
                        parameters: [
                            {
                                name: "capacity",
                                type: 32,
                            },
                            {
                                name: "groupcount",
                                type: 32,
                            },
                            {
                                name: "grouplist",
                                type: 1002,
                            },
                        ],
                        required: true,
                    },
                    removeRsp: {
                        ID: 3,
                        name: "removeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    viewRsp: {
                        ID: 1,
                        name: "viewRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "groupname",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                },
                name: "genGroups",
            },
            genIdentify: {
                ID: 3,
                attributes: {
                    identifyTime: {
                        ID: 0,
                        default: 0,
                        max: 65535,
                        name: "identifyTime",
                        required: true,
                        type: 33,
                        write: true,
                    },
                },
                commands: {
                    identify: {
                        ID: 0,
                        name: "identify",
                        parameters: [
                            {
                                name: "identifytime",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    identifyQuery: {
                        ID: 1,
                        name: "identifyQuery",
                        parameters: [],
                        required: true,
                    },
                    triggerEffect: {
                        ID: 64,
                        name: "triggerEffect",
                        parameters: [
                            {
                                name: "effectid",
                                type: 48,
                            },
                            {
                                name: "effectvariant",
                                type: 48,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    identifyQueryRsp: {
                        ID: 0,
                        name: "identifyQueryRsp",
                        parameters: [
                            {
                                max: 65535,
                                name: "timeout",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                },
                name: "genIdentify",
            },
            genLevelCtrl: {
                ID: 8,
                attributes: {
                    currentFrequency: {
                        ID: 4,
                        default: 0,
                        name: "currentFrequency",
                        report: true,
                        type: 33,
                    },
                    currentLevel: {
                        ID: 0,
                        default: 255,
                        name: "currentLevel",
                        report: true,
                        required: true,
                        scene: true,
                        type: 32,
                    },
                    defaultMoveRate: {
                        ID: 20,
                        max: 254,
                        name: "defaultMoveRate",
                        type: 32,
                        write: true,
                    },
                    maxFrequency: {
                        ID: 6,
                        default: 0,
                        max: 65535,
                        name: "maxFrequency",
                        type: 33,
                    },
                    maxLevel: {
                        ID: 3,
                        default: 255,
                        max: 255,
                        name: "maxLevel",
                        type: 32,
                    },
                    minFrequency: {
                        ID: 5,
                        default: 0,
                        name: "minFrequency",
                        type: 33,
                    },
                    minLevel: {
                        ID: 2,
                        default: 0,
                        name: "minLevel",
                        type: 32,
                    },
                    offTransitionTime: {
                        ID: 19,
                        default: 65535,
                        max: 65534,
                        name: "offTransitionTime",
                        type: 33,
                        write: true,
                    },
                    onLevel: {
                        ID: 17,
                        default: 255,
                        name: "onLevel",
                        type: 32,
                        write: true,
                    },
                    onOffTransitionTime: {
                        ID: 16,
                        default: 0,
                        max: 65535,
                        name: "onOffTransitionTime",
                        type: 33,
                        write: true,
                    },
                    onTransitionTime: {
                        ID: 18,
                        default: 65535,
                        max: 65534,
                        name: "onTransitionTime",
                        type: 33,
                        write: true,
                    },
                    options: {
                        ID: 15,
                        default: 0,
                        name: "options",
                        type: 24,
                        write: true,
                    },
                    remainingTime: {
                        ID: 1,
                        default: 0,
                        max: 65535,
                        name: "remainingTime",
                        type: 33,
                    },
                    startUpCurrentLevel: {
                        ID: 16384,
                        max: 255,
                        name: "startUpCurrentLevel",
                        special: {
                            0: "MinimumDeviceValuePermitted",
                            255: "SetToPreviousValue",
                        },
                        type: 32,
                        write: true,
                    },
                },
                commands: {
                    move: {
                        ID: 1,
                        name: "move",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveToClosestFrequency: {
                        ID: 8,
                        name: "moveToClosestFrequency",
                        parameters: [
                            {
                                name: "frequency",
                                type: 33,
                            },
                        ],
                    },
                    moveToLevel: {
                        ID: 0,
                        name: "moveToLevel",
                        parameters: [
                            {
                                max: 255,
                                name: "level",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveToLevelWithOnOff: {
                        ID: 4,
                        name: "moveToLevelWithOnOff",
                        parameters: [
                            {
                                max: 255,
                                name: "level",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveWithOnOff: {
                        ID: 5,
                        name: "moveWithOnOff",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    step: {
                        ID: 2,
                        name: "step",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stepWithOnOff: {
                        ID: 6,
                        name: "stepWithOnOff",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stop: {
                        ID: 3,
                        name: "stop",
                        parameters: [
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stopWithOnOff: {
                        ID: 7,
                        name: "stopWithOnOff",
                        parameters: [
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "genLevelCtrl",
            },
            genMultistateInput: {
                ID: 18,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    numberOfStates: {
                        ID: 74,
                        default: 0,
                        max: 65535,
                        min: 1,
                        name: "numberOfStates",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    stateText: {
                        ID: 14,
                        name: "stateText",
                        type: 72,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genMultistateInput",
            },
            genMultistateOutput: {
                ID: 19,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    numberOfStates: {
                        ID: 74,
                        default: 0,
                        max: 65535,
                        min: 1,
                        name: "numberOfStates",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    stateText: {
                        ID: 14,
                        name: "stateText",
                        type: 72,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genMultistateOutput",
            },
            genMultistateValue: {
                ID: 20,
                attributes: {
                    applicationType: {
                        ID: 256,
                        max: 4294967295,
                        name: "applicationType",
                        type: 35,
                    },
                    description: {
                        ID: 28,
                        default: "\u0000",
                        name: "description",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    numberOfStates: {
                        ID: 74,
                        default: 0,
                        max: 65535,
                        min: 1,
                        name: "numberOfStates",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    outOfService: {
                        ID: 81,
                        default: 0,
                        name: "outOfService",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    presentValue: {
                        ID: 85,
                        name: "presentValue",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    priorityArray: {
                        ID: 87,
                        name: "priorityArray",
                        type: 72,
                        write: true,
                    },
                    reliability: {
                        ID: 103,
                        default: 0,
                        name: "reliability",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    relinquishDefault: {
                        ID: 104,
                        name: "relinquishDefault",
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    stateText: {
                        ID: 14,
                        name: "stateText",
                        type: 72,
                        write: true,
                        writeOptional: true,
                    },
                    statusFlags: {
                        ID: 111,
                        default: 0,
                        max: 15,
                        name: "statusFlags",
                        required: true,
                        type: 24,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genMultistateValue",
            },
            genOnOff: {
                ID: 6,
                attributes: {
                    globalSceneCtrl: {
                        ID: 16384,
                        default: 1,
                        name: "globalSceneCtrl",
                        type: 16,
                    },
                    offWaitTime: {
                        ID: 16386,
                        default: 0,
                        max: 65535,
                        name: "offWaitTime",
                        type: 33,
                        write: true,
                    },
                    onOff: {
                        ID: 0,
                        default: 0,
                        name: "onOff",
                        report: true,
                        required: true,
                        scene: true,
                        type: 16,
                    },
                    onTime: {
                        ID: 16385,
                        default: 0,
                        max: 65535,
                        name: "onTime",
                        type: 33,
                        write: true,
                    },
                    startUpOnOff: {
                        ID: 16387,
                        max: 255,
                        name: "startUpOnOff",
                        special: { 255: "SetToPreviousValue" },
                        type: 48,
                        write: true,
                    },
                },
                commands: {
                    off: {
                        ID: 0,
                        name: "off",
                        parameters: [],
                        required: true,
                    },
                    offWithEffect: {
                        ID: 64,
                        name: "offWithEffect",
                        parameters: [
                            {
                                name: "effectid",
                                type: 48,
                            },
                            {
                                name: "effectvariant",
                                type: 32,
                            },
                        ],
                    },
                    on: {
                        ID: 1,
                        name: "on",
                        parameters: [],
                        required: true,
                    },
                    onWithRecallGlobalScene: {
                        ID: 65,
                        name: "onWithRecallGlobalScene",
                        parameters: [],
                    },
                    onWithTimedOff: {
                        ID: 66,
                        name: "onWithTimedOff",
                        parameters: [
                            {
                                name: "ctrlbits",
                                type: 32,
                            },
                            {
                                name: "ontime",
                                type: 33,
                            },
                            {
                                name: "offwaittime",
                                type: 33,
                            },
                        ],
                    },
                    toggle: {
                        ID: 2,
                        name: "toggle",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "genOnOff",
            },
            genOnOffSwitchCfg: {
                ID: 7,
                attributes: {
                    switchActions: {
                        ID: 16,
                        max: 2,
                        min: 0,
                        name: "switchActions",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    switchType: {
                        ID: 0,
                        max: 2,
                        min: 0,
                        name: "switchType",
                        required: true,
                        type: 48,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genOnOffSwitchCfg",
            },
            genOta: {
                ID: 25,
                attributes: {
                    currentFileVersion: {
                        ID: 2,
                        client: true,
                        default: 4294967295,
                        max: 4294967295,
                        name: "currentFileVersion",
                        type: 35,
                    },
                    currentZigbeeStackVersion: {
                        ID: 3,
                        client: true,
                        default: 65535,
                        max: 65535,
                        name: "currentZigbeeStackVersion",
                        type: 33,
                    },
                    downloadedFileVersion: {
                        ID: 4,
                        client: true,
                        default: 4294967295,
                        max: 4294967295,
                        name: "downloadedFileVersion",
                        type: 35,
                    },
                    downloadedZigbeeStackVersion: {
                        ID: 5,
                        client: true,
                        default: 65535,
                        max: 65535,
                        name: "downloadedZigbeeStackVersion",
                        type: 33,
                    },
                    fileOffset: {
                        ID: 1,
                        client: true,
                        default: 4294967295,
                        max: 4294967295,
                        name: "fileOffset",
                        type: 35,
                    },
                    imageStamp: {
                        ID: 10,
                        client: true,
                        max: 4294967295,
                        name: "imageStamp",
                        type: 35,
                    },
                    imageTypeId: {
                        ID: 8,
                        client: true,
                        max: 65535,
                        name: "imageTypeId",
                        type: 33,
                    },
                    imageUpgradeStatus: {
                        ID: 6,
                        client: true,
                        default: 0,
                        max: 255,
                        name: "imageUpgradeStatus",
                        required: true,
                        type: 48,
                    },
                    manufacturerId: {
                        ID: 7,
                        client: true,
                        max: 65535,
                        name: "manufacturerId",
                        type: 33,
                    },
                    minimumBlockReqDelay: {
                        ID: 9,
                        client: true,
                        default: 0,
                        max: 65534,
                        name: "minimumBlockReqDelay",
                        type: 33,
                    },
                    upgradeActivationPolicy: {
                        ID: 11,
                        client: true,
                        default: 0,
                        name: "upgradeActivationPolicy",
                        type: 48,
                    },
                    upgradeServerId: {
                        ID: 0,
                        client: true,
                        default: "0xffffffffffffffff",
                        name: "upgradeServerId",
                        required: true,
                        type: 240,
                    },
                    upgradeTimeoutPolicy: {
                        ID: 12,
                        client: true,
                        default: 0,
                        name: "upgradeTimeoutPolicy",
                        type: 48,
                    },
                },
                commands: {
                    imageBlockRequest: {
                        ID: 3,
                        name: "imageBlockRequest",
                        parameters: [
                            {
                                name: "fieldControl",
                                type: 24,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                name: "fileOffset",
                                type: 35,
                            },
                            {
                                name: "maximumDataSize",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fieldControl",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "requestNodeIeeeAddress",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "fieldControl",
                                        type: "bitMaskSet",
                                    },
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 2,
                                    },
                                ],
                                name: "minimumBlockPeriod",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 5,
                    },
                    imagePageRequest: {
                        ID: 4,
                        name: "imagePageRequest",
                        parameters: [
                            {
                                name: "fieldControl",
                                type: 24,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                name: "fileOffset",
                                type: 35,
                            },
                            {
                                name: "maximumDataSize",
                                type: 32,
                            },
                            {
                                name: "pageSize",
                                type: 33,
                            },
                            {
                                name: "responseSpacing",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fieldControl",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "requestNodeIeeeAddress",
                                type: 240,
                            },
                        ],
                        response: 5,
                    },
                    queryDeviceSpecificFileRequest: {
                        ID: 8,
                        name: "queryDeviceSpecificFileRequest",
                        parameters: [
                            {
                                name: "eui64",
                                type: 240,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 65534,
                                min: 65472,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                name: "zigbeeStackVersion",
                                type: 33,
                            },
                        ],
                        response: 9,
                    },
                    queryNextImageRequest: {
                        ID: 1,
                        name: "queryNextImageRequest",
                        parameters: [
                            {
                                name: "fieldControl",
                                type: 24,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fieldControl",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "hardwareVersion",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 2,
                    },
                    upgradeEndRequest: {
                        ID: 6,
                        name: "upgradeEndRequest",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                name: "fileVersion",
                                type: 35,
                            },
                        ],
                        required: true,
                        response: 7,
                    },
                },
                commandsResponse: {
                    imageBlockResponse: {
                        ID: 5,
                        name: "imageBlockResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "fileOffset",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "dataSize",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "data",
                                type: 1008,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 151,
                                    },
                                ],
                                name: "currentTime",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 151,
                                    },
                                ],
                                name: "requestTime",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 151,
                                    },
                                ],
                                name: "minimumBlockPeriod",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    imageNotify: {
                        ID: 0,
                        name: "imageNotify",
                        parameters: [
                            {
                                name: "payloadType",
                                type: 48,
                            },
                            {
                                name: "queryJitter",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "payloadType",
                                        type: "fieldGT",
                                        value: 0,
                                    },
                                ],
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "payloadType",
                                        type: "fieldGT",
                                        value: 1,
                                    },
                                ],
                                max: 65535,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "payloadType",
                                        type: "fieldGT",
                                        value: 2,
                                    },
                                ],
                                max: 4294967295,
                                name: "fileVersion",
                                type: 35,
                            },
                        ],
                    },
                    queryDeviceSpecificFileResponse: {
                        ID: 9,
                        name: "queryDeviceSpecificFileResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                max: 65534,
                                min: 65472,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "imageSize",
                                type: 35,
                            },
                        ],
                    },
                    queryNextImageResponse: {
                        ID: 2,
                        name: "queryNextImageResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                max: 65471,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "imageSize",
                                type: 35,
                            },
                        ],
                        required: true,
                    },
                    upgradeEndResponse: {
                        ID: 7,
                        name: "upgradeEndResponse",
                        parameters: [
                            {
                                max: 1048575,
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                max: 1048575,
                                name: "imageType",
                                type: 33,
                            },
                            {
                                max: 68719476735,
                                name: "fileVersion",
                                type: 35,
                            },
                            {
                                name: "currentTime",
                                type: 226,
                            },
                            {
                                name: "upgradeTime",
                                type: 226,
                            },
                        ],
                        required: true,
                    },
                },
                name: "genOta",
            },
            genPollCtrl: {
                ID: 32,
                attributes: {
                    checkinInterval: {
                        ID: 0,
                        default: 14400,
                        max: 7208960,
                        name: "checkinInterval",
                        required: true,
                        type: 35,
                        write: true,
                    },
                    checkinIntervalMin: {
                        ID: 4,
                        default: 0,
                        name: "checkinIntervalMin",
                        type: 35,
                    },
                    fastPollTimeout: {
                        ID: 3,
                        default: 40,
                        max: 65535,
                        min: 1,
                        name: "fastPollTimeout",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    fastPollTimeoutMax: {
                        ID: 6,
                        default: 0,
                        name: "fastPollTimeoutMax",
                        type: 33,
                    },
                    longPollInterval: {
                        ID: 1,
                        default: 20,
                        max: 7208960,
                        min: 4,
                        name: "longPollInterval",
                        required: true,
                        type: 35,
                    },
                    longPollIntervalMin: {
                        ID: 5,
                        default: 0,
                        name: "longPollIntervalMin",
                        type: 35,
                    },
                    shortPollInterval: {
                        ID: 2,
                        default: 2,
                        max: 65535,
                        min: 1,
                        name: "shortPollInterval",
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    checkinRsp: {
                        ID: 0,
                        name: "checkinRsp",
                        parameters: [
                            {
                                name: "startFastPolling",
                                type: 16,
                            },
                            {
                                name: "fastPollTimeout",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    fastPollStop: {
                        ID: 1,
                        name: "fastPollStop",
                        parameters: [],
                        required: true,
                    },
                    setLongPollInterval: {
                        ID: 2,
                        name: "setLongPollInterval",
                        parameters: [
                            {
                                name: "newLongPollInterval",
                                type: 35,
                            },
                        ],
                    },
                    setShortPollInterval: {
                        ID: 3,
                        name: "setShortPollInterval",
                        parameters: [
                            {
                                name: "newShortPollInterval",
                                type: 33,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    checkin: {
                        ID: 0,
                        name: "checkin",
                        parameters: [],
                        required: true,
                    },
                },
                name: "genPollCtrl",
            },
            genPowerCfg: {
                ID: 1,
                attributes: {
                    battery2AHrRating: {
                        ID: 82,
                        max: 65535,
                        name: "battery2AHrRating",
                        type: 33,
                        write: true,
                    },
                    battery2AlarmMask: {
                        ID: 85,
                        default: 0,
                        name: "battery2AlarmMask",
                        type: 24,
                        write: true,
                    },
                    battery2AlarmState: {
                        ID: 94,
                        default: 0,
                        name: "battery2AlarmState",
                        report: true,
                        type: 27,
                    },
                    battery2Manufacturer: {
                        ID: 80,
                        default: "",
                        maxLen: 16,
                        name: "battery2Manufacturer",
                        type: 66,
                        write: true,
                    },
                    battery2PercentageMinThreshold: {
                        ID: 90,
                        default: 0,
                        max: 255,
                        name: "battery2PercentageMinThreshold",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2PercentageRemaining: {
                        ID: 65,
                        default: 0,
                        max: 255,
                        name: "battery2PercentageRemaining",
                        report: true,
                        type: 32,
                    },
                    battery2PercentageThreshold1: {
                        ID: 91,
                        default: 0,
                        max: 255,
                        name: "battery2PercentageThreshold1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2PercentageThreshold2: {
                        ID: 92,
                        default: 0,
                        max: 255,
                        name: "battery2PercentageThreshold2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2PercentageThreshold3: {
                        ID: 93,
                        default: 0,
                        max: 255,
                        name: "battery2PercentageThreshold3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2Quantity: {
                        ID: 83,
                        max: 255,
                        name: "battery2Quantity",
                        type: 32,
                        write: true,
                    },
                    battery2RatedVoltage: {
                        ID: 84,
                        max: 255,
                        name: "battery2RatedVoltage",
                        type: 32,
                        write: true,
                    },
                    battery2Size: {
                        ID: 81,
                        default: 255,
                        name: "battery2Size",
                        type: 48,
                        write: true,
                    },
                    battery2Voltage: {
                        ID: 64,
                        max: 255,
                        name: "battery2Voltage",
                        type: 32,
                    },
                    battery2VoltageMinThreshold: {
                        ID: 86,
                        default: 0,
                        max: 255,
                        name: "battery2VoltageMinThreshold",
                        type: 32,
                        write: true,
                    },
                    battery2VoltageThreshold1: {
                        ID: 87,
                        default: 0,
                        max: 255,
                        name: "battery2VoltageThreshold1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2VoltageThreshold2: {
                        ID: 88,
                        default: 0,
                        max: 255,
                        name: "battery2VoltageThreshold2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery2VoltageThreshold3: {
                        ID: 89,
                        default: 0,
                        max: 255,
                        name: "battery2VoltageThreshold3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3AHrRating: {
                        ID: 114,
                        max: 65535,
                        name: "battery3AHrRating",
                        type: 33,
                        write: true,
                    },
                    battery3AlarmMask: {
                        ID: 117,
                        default: 0,
                        name: "battery3AlarmMask",
                        type: 24,
                        write: true,
                    },
                    battery3AlarmState: {
                        ID: 126,
                        default: 0,
                        name: "battery3AlarmState",
                        report: true,
                        type: 27,
                    },
                    battery3Manufacturer: {
                        ID: 112,
                        default: "",
                        maxLen: 16,
                        name: "battery3Manufacturer",
                        type: 66,
                        write: true,
                    },
                    battery3PercentageMinThreshold: {
                        ID: 122,
                        default: 0,
                        max: 255,
                        name: "battery3PercentageMinThreshold",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3PercentageRemaining: {
                        ID: 97,
                        default: 0,
                        max: 255,
                        name: "battery3PercentageRemaining",
                        report: true,
                        type: 32,
                    },
                    battery3PercentageThreshold1: {
                        ID: 123,
                        default: 0,
                        max: 255,
                        name: "battery3PercentageThreshold1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3PercentageThreshold2: {
                        ID: 124,
                        default: 0,
                        max: 255,
                        name: "battery3PercentageThreshold2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3PercentageThreshold3: {
                        ID: 125,
                        default: 0,
                        max: 255,
                        name: "battery3PercentageThreshold3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3Quantity: {
                        ID: 115,
                        max: 255,
                        name: "battery3Quantity",
                        type: 32,
                        write: true,
                    },
                    battery3RatedVoltage: {
                        ID: 116,
                        max: 255,
                        name: "battery3RatedVoltage",
                        type: 32,
                        write: true,
                    },
                    battery3Size: {
                        ID: 113,
                        default: 255,
                        name: "battery3Size",
                        type: 48,
                        write: true,
                    },
                    battery3Voltage: {
                        ID: 96,
                        max: 255,
                        name: "battery3Voltage",
                        type: 32,
                    },
                    battery3VoltageMinThreshold: {
                        ID: 118,
                        default: 0,
                        max: 255,
                        name: "battery3VoltageMinThreshold",
                        type: 32,
                        write: true,
                    },
                    battery3VoltageThreshold1: {
                        ID: 119,
                        default: 0,
                        max: 255,
                        name: "battery3VoltageThreshold1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3VoltageThreshold2: {
                        ID: 120,
                        default: 0,
                        max: 255,
                        name: "battery3VoltageThreshold2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    battery3VoltageThreshold3: {
                        ID: 121,
                        default: 0,
                        max: 255,
                        name: "battery3VoltageThreshold3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryAHrRating: {
                        ID: 50,
                        max: 65535,
                        name: "batteryAHrRating",
                        type: 33,
                        write: true,
                    },
                    batteryAlarmMask: {
                        ID: 53,
                        default: 0,
                        name: "batteryAlarmMask",
                        type: 24,
                        write: true,
                    },
                    batteryAlarmState: {
                        ID: 62,
                        default: 0,
                        name: "batteryAlarmState",
                        report: true,
                        type: 27,
                    },
                    batteryManufacturer: {
                        ID: 48,
                        default: "",
                        maxLen: 16,
                        name: "batteryManufacturer",
                        type: 66,
                        write: true,
                    },
                    batteryPercentMinThres: {
                        ID: 58,
                        default: 0,
                        max: 255,
                        name: "batteryPercentMinThres",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryPercentThres1: {
                        ID: 59,
                        default: 0,
                        max: 255,
                        name: "batteryPercentThres1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryPercentThres2: {
                        ID: 60,
                        default: 0,
                        max: 255,
                        name: "batteryPercentThres2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryPercentThres3: {
                        ID: 61,
                        default: 0,
                        max: 255,
                        name: "batteryPercentThres3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryPercentageRemaining: {
                        ID: 33,
                        default: 0,
                        max: 255,
                        name: "batteryPercentageRemaining",
                        report: true,
                        type: 32,
                    },
                    batteryQuantity: {
                        ID: 51,
                        max: 255,
                        name: "batteryQuantity",
                        type: 32,
                        write: true,
                    },
                    batteryRatedVoltage: {
                        ID: 52,
                        max: 255,
                        name: "batteryRatedVoltage",
                        type: 32,
                        write: true,
                    },
                    batterySize: {
                        ID: 49,
                        default: 255,
                        name: "batterySize",
                        type: 48,
                        write: true,
                    },
                    batteryVoltMinThres: {
                        ID: 54,
                        default: 0,
                        max: 255,
                        name: "batteryVoltMinThres",
                        type: 32,
                        write: true,
                    },
                    batteryVoltThres1: {
                        ID: 55,
                        default: 0,
                        max: 255,
                        name: "batteryVoltThres1",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryVoltThres2: {
                        ID: 56,
                        default: 0,
                        max: 255,
                        name: "batteryVoltThres2",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryVoltThres3: {
                        ID: 57,
                        default: 0,
                        max: 255,
                        name: "batteryVoltThres3",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                    batteryVoltage: {
                        ID: 32,
                        max: 255,
                        name: "batteryVoltage",
                        type: 32,
                    },
                    mainsAlarmMask: {
                        ID: 16,
                        default: 0,
                        name: "mainsAlarmMask",
                        type: 24,
                        write: true,
                    },
                    mainsFrequency: {
                        ID: 1,
                        max: 255,
                        name: "mainsFrequency",
                        type: 32,
                    },
                    mainsVoltMaxThres: {
                        ID: 18,
                        default: 65535,
                        max: 65535,
                        name: "mainsVoltMaxThres",
                        type: 33,
                        write: true,
                    },
                    mainsVoltMinThres: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "mainsVoltMinThres",
                        type: 33,
                        write: true,
                    },
                    mainsVoltage: {
                        ID: 0,
                        max: 65535,
                        name: "mainsVoltage",
                        type: 33,
                    },
                    mainsVoltageDwellTripPoint: {
                        ID: 19,
                        default: 0,
                        max: 65535,
                        name: "mainsVoltageDwellTripPoint",
                        type: 33,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genPowerCfg",
            },
            genRssiLocation: {
                ID: 11,
                attributes: {
                    age: {
                        ID: 2,
                        max: 65535,
                        name: "age",
                        type: 33,
                    },
                    calcPeriod: {
                        ID: 22,
                        max: 65535,
                        name: "calcPeriod",
                        type: 33,
                        write: true,
                    },
                    coordinate1: {
                        ID: 16,
                        max: 32767,
                        min: -32768,
                        name: "coordinate1",
                        required: true,
                        type: 41,
                        write: true,
                    },
                    coordinate2: {
                        ID: 17,
                        max: 32767,
                        min: -32768,
                        name: "coordinate2",
                        required: true,
                        type: 41,
                        write: true,
                    },
                    coordinate3: {
                        ID: 18,
                        max: 32767,
                        min: -32768,
                        name: "coordinate3",
                        type: 41,
                        write: true,
                    },
                    method: {
                        ID: 1,
                        name: "method",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    numOfDevices: {
                        ID: 4,
                        max: 255,
                        name: "numOfDevices",
                        type: 32,
                    },
                    numRSSIMeasurements: {
                        ID: 23,
                        max: 255,
                        min: 1,
                        name: "numRSSIMeasurements",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    pathLossExponent: {
                        ID: 20,
                        name: "pathLossExponent",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    power: {
                        ID: 19,
                        max: 32767,
                        min: -32768,
                        name: "power",
                        required: true,
                        type: 41,
                        write: true,
                    },
                    qualityMeasure: {
                        ID: 3,
                        max: 100,
                        name: "qualityMeasure",
                        type: 32,
                    },
                    reportingPeriod: {
                        ID: 21,
                        max: 65535,
                        name: "reportingPeriod",
                        type: 33,
                        write: true,
                    },
                    type: {
                        ID: 0,
                        name: "type",
                        required: true,
                        type: 8,
                        write: true,
                    },
                },
                commands: {
                    anchorNodeAnnounce: {
                        ID: 6,
                        name: "anchorNodeAnnounce",
                        parameters: [
                            {
                                name: "anchorNodeAddr",
                                type: 240,
                            },
                            {
                                name: "x",
                                type: 41,
                            },
                            {
                                name: "y",
                                type: 41,
                            },
                            {
                                name: "z",
                                type: 41,
                            },
                        ],
                    },
                    getDeviceConfig: {
                        ID: 2,
                        name: "getDeviceConfig",
                        parameters: [
                            {
                                name: "targetAddr",
                                type: 240,
                            },
                        ],
                        required: true,
                    },
                    getLocationData: {
                        ID: 3,
                        name: "getLocationData",
                        parameters: [
                            {
                                name: "info",
                                type: 24,
                            },
                            {
                                name: "numResponses",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 4,
                                        param: "info",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "targetAddr",
                                type: 240,
                            },
                        ],
                        required: true,
                    },
                    rssiResponse: {
                        ID: 4,
                        name: "rssiResponse",
                        parameters: [
                            {
                                name: "replyingDevice",
                                type: 240,
                            },
                            {
                                name: "x",
                                type: 41,
                            },
                            {
                                name: "y",
                                type: 41,
                            },
                            {
                                name: "z",
                                type: 41,
                            },
                            {
                                name: "rssi",
                                type: 40,
                            },
                            {
                                name: "numRssiMeasurements",
                                type: 32,
                            },
                        ],
                    },
                    sendPings: {
                        ID: 5,
                        name: "sendPings",
                        parameters: [
                            {
                                name: "targetAddr",
                                type: 240,
                            },
                            {
                                name: "numRssiMeasurements",
                                type: 32,
                            },
                            {
                                name: "calcPeriod",
                                type: 33,
                            },
                        ],
                    },
                    setAbsolute: {
                        ID: 0,
                        name: "setAbsolute",
                        parameters: [
                            {
                                name: "coordinate1",
                                type: 41,
                            },
                            {
                                name: "coordinate2",
                                type: 41,
                            },
                            {
                                name: "coordinate3",
                                type: 41,
                            },
                            {
                                name: "power",
                                type: 41,
                            },
                            {
                                name: "pathLossExponent",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    setDeviceConfig: {
                        ID: 1,
                        name: "setDeviceConfig",
                        parameters: [
                            {
                                name: "power",
                                type: 41,
                            },
                            {
                                name: "pathLossExponent",
                                type: 33,
                            },
                            {
                                name: "calcPeriod",
                                type: 33,
                            },
                            {
                                name: "numRssiMeasurements",
                                type: 32,
                            },
                            {
                                name: "reportingPeriod",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    compactLocationDataNotification: {
                        ID: 3,
                        name: "compactLocationDataNotification",
                        parameters: [
                            {
                                name: "type",
                                type: 8,
                            },
                            {
                                name: "coordinate1",
                                type: 41,
                            },
                            {
                                name: "coordinate2",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "coordinate3",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "qualityMeasure",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "age",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    deviceConfigResponse: {
                        ID: 0,
                        name: "deviceConfigResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "power",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "pathLossExponent",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "calcPeriod",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "numRssiMeasurements",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "reportingPeriod",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    locationDataNotification: {
                        ID: 2,
                        name: "locationDataNotification",
                        parameters: [
                            {
                                name: "type",
                                type: 8,
                            },
                            {
                                name: "coordinate1",
                                type: 41,
                            },
                            {
                                name: "coordinate2",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "coordinate3",
                                type: 41,
                            },
                            {
                                name: "power",
                                type: 41,
                            },
                            {
                                name: "pathLossExponent",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "method",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "qualityMeasure",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "type",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "age",
                                type: 33,
                            },
                        ],
                    },
                    locationDataResponse: {
                        ID: 1,
                        name: "locationDataResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "type",
                                type: 8,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "coordinate1",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "coordinate2",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "coordinate3",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "power",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "pathLossExponent",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "method",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "qualityMeasure",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "age",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    reportRssiMeasurements: {
                        ID: 6,
                        name: "reportRssiMeasurements",
                        parameters: [
                            {
                                name: "measuringDeviceAddr",
                                type: 240,
                            },
                            {
                                name: "numNeighbors",
                                type: 32,
                            },
                        ],
                    },
                    requestOwnLocation: {
                        ID: 7,
                        name: "requestOwnLocation",
                        parameters: [
                            {
                                name: "blindNodeAddr",
                                type: 240,
                            },
                        ],
                    },
                    rssiPing: {
                        ID: 4,
                        name: "rssiPing",
                        parameters: [
                            {
                                name: "type",
                                type: 8,
                            },
                        ],
                        required: true,
                    },
                    rssiRequest: {
                        ID: 5,
                        name: "rssiRequest",
                        parameters: [],
                    },
                },
                name: "genRssiLocation",
            },
            genScenes: {
                ID: 5,
                attributes: {
                    count: {
                        ID: 0,
                        default: 0,
                        max: 255,
                        name: "count",
                        required: true,
                        type: 32,
                    },
                    currentGroup: {
                        ID: 2,
                        default: 0,
                        max: 65527,
                        name: "currentGroup",
                        required: true,
                        type: 33,
                    },
                    currentScene: {
                        ID: 1,
                        default: 0,
                        max: 255,
                        name: "currentScene",
                        required: true,
                        type: 32,
                    },
                    lastCfgBy: {
                        ID: 5,
                        name: "lastCfgBy",
                        special: { "0xffffffffffffffff": "UnknownOrNotConfigured" },
                        type: 240,
                    },
                    nameSupport: {
                        ID: 4,
                        default: 0,
                        name: "nameSupport",
                        required: true,
                        type: 24,
                    },
                    sceneValid: {
                        ID: 3,
                        default: 0,
                        name: "sceneValid",
                        required: true,
                        type: 16,
                    },
                },
                commands: {
                    add: {
                        ID: 0,
                        name: "add",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                name: "scenename",
                                type: 66,
                            },
                            {
                                name: "extensionfieldsets",
                                type: 1006,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    copy: {
                        ID: 66,
                        name: "copy",
                        parameters: [
                            {
                                name: "mode",
                                type: 24,
                            },
                            {
                                name: "groupidfrom",
                                type: 33,
                            },
                            {
                                name: "sceneidfrom",
                                type: 32,
                            },
                            {
                                name: "groupidto",
                                type: 33,
                            },
                            {
                                name: "sceneidto",
                                type: 32,
                            },
                        ],
                        response: 66,
                    },
                    enhancedAdd: {
                        ID: 64,
                        name: "enhancedAdd",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                name: "scenename",
                                type: 66,
                            },
                            {
                                name: "extensionfieldsets",
                                type: 1006,
                            },
                        ],
                        response: 64,
                    },
                    enhancedView: {
                        ID: 65,
                        name: "enhancedView",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        response: 65,
                    },
                    getSceneMembership: {
                        ID: 6,
                        name: "getSceneMembership",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 6,
                    },
                    recall: {
                        ID: 5,
                        name: "recall",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 2,
                                    },
                                ],
                                name: "transitionTime",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    remove: {
                        ID: 2,
                        name: "remove",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 2,
                    },
                    removeAll: {
                        ID: 3,
                        name: "removeAll",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 3,
                    },
                    store: {
                        ID: 4,
                        name: "store",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 4,
                    },
                    view: {
                        ID: 1,
                        name: "view",
                        parameters: [
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                },
                commandsResponse: {
                    addRsp: {
                        ID: 0,
                        name: "addRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupId",
                                type: 33,
                            },
                            {
                                name: "sceneId",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    copyRsp: {
                        ID: 66,
                        name: "copyRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupidfrom",
                                type: 33,
                            },
                            {
                                name: "sceneidfrom",
                                type: 32,
                            },
                        ],
                    },
                    enhancedAddRsp: {
                        ID: 64,
                        name: "enhancedAddRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupId",
                                type: 33,
                            },
                            {
                                name: "sceneId",
                                type: 32,
                            },
                        ],
                    },
                    enhancedViewRsp: {
                        ID: 65,
                        name: "enhancedViewRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "scenename",
                                type: 66,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "extensionfieldsets",
                                type: 1006,
                            },
                        ],
                    },
                    getSceneMembershipRsp: {
                        ID: 6,
                        name: "getSceneMembershipRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                max: 255,
                                min: 0,
                                name: "capacity",
                                special: {
                                    0: "NoFurtherScenesMayBeAdded",
                                    254: "AtLeastOneFurtherSceneMayBeAdded",
                                    255: "Unknown",
                                },
                                type: 32,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "scenecount",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "scenelist",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                    removeAllRsp: {
                        ID: 3,
                        name: "removeAllRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    removeRsp: {
                        ID: 2,
                        name: "removeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    storeRsp: {
                        ID: 4,
                        name: "storeRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    viewRsp: {
                        ID: 1,
                        name: "viewRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "groupid",
                                type: 33,
                            },
                            {
                                name: "sceneid",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "scenename",
                                type: 66,
                            },
                            {
                                conditions: [
                                    {
                                        field: "status",
                                        type: "fieldEquals",
                                        value: 0,
                                    },
                                ],
                                name: "extensionfieldsets",
                                type: 1006,
                            },
                        ],
                        required: true,
                    },
                },
                name: "genScenes",
            },
            genTime: {
                ID: 10,
                attributes: {
                    dstEnd: {
                        ID: 4,
                        default: 4294967295,
                        max: 4294967294,
                        name: "dstEnd",
                        type: 35,
                        write: true,
                    },
                    dstShift: {
                        ID: 5,
                        default: 0,
                        max: 86400,
                        min: -86400,
                        name: "dstShift",
                        type: 43,
                        write: true,
                    },
                    dstStart: {
                        ID: 3,
                        default: 4294967295,
                        max: 4294967294,
                        name: "dstStart",
                        type: 35,
                        write: true,
                    },
                    lastSetTime: {
                        ID: 8,
                        default: 4294967295,
                        name: "lastSetTime",
                        type: 226,
                    },
                    localTime: {
                        ID: 7,
                        default: 4294967295,
                        max: 4294967294,
                        name: "localTime",
                        type: 35,
                    },
                    standardTime: {
                        ID: 6,
                        default: 4294967295,
                        max: 4294967294,
                        name: "standardTime",
                        type: 35,
                    },
                    time: {
                        ID: 0,
                        default: 4294967295,
                        max: 4294967294,
                        name: "time",
                        required: true,
                        type: 226,
                        write: true,
                    },
                    timeStatus: {
                        ID: 1,
                        default: 0,
                        name: "timeStatus",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    timeZone: {
                        ID: 2,
                        default: 0,
                        max: 86400,
                        min: -86400,
                        name: "timeZone",
                        type: 43,
                        write: true,
                    },
                    validUntilTime: {
                        ID: 9,
                        default: 4294967295,
                        name: "validUntilTime",
                        type: 226,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "genTime",
            },
            greenPower: {
                ID: 33,
                attributes: {
                    gpLinkKey: {
                        ID: 34,
                        name: "gpLinkKey",
                        type: 241,
                        write: true,
                    },
                    gpSharedSecurityKey: {
                        ID: 33,
                        name: "gpSharedSecurityKey",
                        type: 241,
                        write: true,
                    },
                    gpSharedSecurityKeyType: {
                        ID: 32,
                        default: 0,
                        max: 7,
                        name: "gpSharedSecurityKeyType",
                        type: 24,
                        write: true,
                    },
                    gppActiveFunctionality: {
                        ID: 23,
                        client: true,
                        name: "gppActiveFunctionality",
                        required: true,
                        type: 26,
                    },
                    gppBlockGpdId: {
                        ID: 21,
                        client: true,
                        name: "gppBlockGpdId",
                        type: 67,
                    },
                    gppFunctionality: {
                        ID: 22,
                        client: true,
                        name: "gppFunctionality",
                        required: true,
                        type: 26,
                    },
                    gppMaxSearchCounter: {
                        ID: 20,
                        client: true,
                        default: 10,
                        max: 255,
                        name: "gppMaxSearchCounter",
                        type: 32,
                        write: true,
                    },
                    gppNotificationRetryNumber: {
                        ID: 18,
                        client: true,
                        default: 2,
                        max: 5,
                        name: "gppNotificationRetryNumber",
                        type: 32,
                        write: true,
                    },
                    gppNotificationRetryTimer: {
                        ID: 19,
                        client: true,
                        default: 100,
                        max: 255,
                        name: "gppNotificationRetryTimer",
                        type: 32,
                        write: true,
                    },
                    gpsActiveFunctionality: {
                        ID: 7,
                        default: 16777215,
                        name: "gpsActiveFunctionality",
                        required: true,
                        type: 26,
                    },
                    gpsCommissioningExitMode: {
                        ID: 3,
                        default: 2,
                        name: "gpsCommissioningExitMode",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    gpsCommissioningWindow: {
                        ID: 4,
                        default: 180,
                        max: 65535,
                        name: "gpsCommissioningWindow",
                        type: 33,
                        write: true,
                    },
                    gpsCommunicationMode: {
                        ID: 2,
                        default: 1,
                        name: "gpsCommunicationMode",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    gpsFunctionality: {
                        ID: 6,
                        name: "gpsFunctionality",
                        required: true,
                        type: 26,
                    },
                    gpsMaxProxyTableEntries: {
                        ID: 16,
                        client: true,
                        default: 20,
                        max: 255,
                        name: "gpsMaxProxyTableEntries",
                        required: true,
                        type: 32,
                    },
                    gpsMaxSinkTableEntries: {
                        ID: 0,
                        max: 255,
                        name: "gpsMaxSinkTableEntries",
                        required: true,
                        type: 32,
                    },
                    gpsSecurityLevel: {
                        ID: 5,
                        default: 6,
                        name: "gpsSecurityLevel",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    proxyTable: {
                        ID: 17,
                        client: true,
                        default: 0,
                        name: "proxyTable",
                        required: true,
                        type: 67,
                    },
                    sinkTable: {
                        ID: 1,
                        name: "sinkTable",
                        required: true,
                        type: 67,
                    },
                },
                commands: {
                    commissioningNotification: {
                        ID: 4,
                        name: "commissioningNotification",
                        parameters: [
                            {
                                name: "options",
                                type: 25,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "frameCounter",
                                type: 35,
                            },
                            {
                                name: "commandID",
                                type: 32,
                            },
                            {
                                name: "payloadSize",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 48,
                                        param: "options",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                    {
                                        mask: 512,
                                        param: "options",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "commandFrame",
                                type: 1009,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2048,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "gppNwkAddr",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2048,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "gppGpdLink",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 512,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "mic",
                                type: 35,
                            },
                        ],
                    },
                    notification: {
                        ID: 0,
                        name: "notification",
                        parameters: [
                            {
                                name: "options",
                                type: 25,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "frameCounter",
                                type: 35,
                            },
                            {
                                name: "commandID",
                                type: 32,
                            },
                            {
                                name: "payloadSize",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 192,
                                        param: "options",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "commandFrame",
                                type: 1009,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 16384,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "gppNwkAddr",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 16384,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "gppGpdLink",
                                type: 24,
                            },
                        ],
                    },
                    pairingSearch: {
                        ID: 1,
                        name: "pairingSearch",
                        parameters: [
                            {
                                name: "options",
                                type: 25,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                        ],
                    },
                    proxyTableRsp: {
                        ID: 11,
                        name: "proxyTableRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "totalNumberNonEmptyEntries",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                name: "entriesCount",
                                type: 32,
                            },
                        ],
                    },
                    sinkCommissioningMode: {
                        ID: 4,
                        name: "sinkCommissioningMode",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                max: 65535,
                                name: "gpmAddressForSecurity",
                                type: 33,
                            },
                            {
                                max: 65535,
                                name: "gpmAddressForPairing",
                                type: 33,
                            },
                            {
                                name: "sinkEndpoint",
                                type: 32,
                            },
                        ],
                    },
                    sinkTableReq: {
                        ID: 10,
                        name: "sinkTableReq",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "index",
                                type: 32,
                            },
                        ],
                        response: 10,
                    },
                    translationTableReq: {
                        ID: 8,
                        name: "translationTableReq",
                        parameters: [
                            {
                                name: "startIndex",
                                type: 32,
                            },
                        ],
                        response: 8,
                    },
                    translationTableUpdate: {
                        ID: 7,
                        name: "translationTableUpdate",
                        parameters: [
                            {
                                name: "options",
                                type: 25,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                        ],
                    },
                    tunnelingStop: {
                        ID: 3,
                        name: "tunnelingStop",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "gpdSecurityFrameCounter",
                                type: 35,
                            },
                            {
                                name: "gppShortAddress",
                                type: 33,
                            },
                            {
                                name: "gppGpdLink",
                                type: 24,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    commisioningMode: {
                        ID: 2,
                        name: "commisioningMode",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "commisioningWindow",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 16,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "channel",
                                type: 32,
                            },
                        ],
                    },
                    notificationResponse: {
                        ID: 0,
                        name: "notificationResponse",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "gpdSecurityFrameCounter",
                                type: 35,
                            },
                        ],
                    },
                    pairing: {
                        ID: 1,
                        name: "pairing",
                        parameters: [
                            {
                                name: "options",
                                type: 26,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 6,
                                    },
                                ],
                                name: "sinkIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "sinkIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 6,
                                    },
                                ],
                                name: "sinkNwkAddr",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "sinkNwkAddr",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 4,
                                    },
                                ],
                                name: "sinkGroupID",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 4,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "sinkGroupID",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 8,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "deviceID",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 16384,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "frameCounter",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 32768,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "gpdKey",
                                type: 241,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 65536,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "assignedAlias",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 131072,
                                        param: "options",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "groupcastRadius",
                                type: 32,
                            },
                        ],
                    },
                    proxyTableReq: {
                        ID: 11,
                        name: "proxyTableReq",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "index",
                                type: 32,
                            },
                        ],
                    },
                    response: {
                        ID: 6,
                        name: "response",
                        parameters: [
                            {
                                name: "options",
                                type: 32,
                            },
                            {
                                name: "tempMaster",
                                type: 33,
                            },
                            {
                                name: "tempMasterTx",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 0,
                                    },
                                ],
                                name: "srcID",
                                type: 35,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdIEEEAddr",
                                type: 240,
                            },
                            {
                                conditions: [
                                    {
                                        offset: 0,
                                        param: "options",
                                        size: 3,
                                        type: "bitFieldEnum",
                                        value: 2,
                                    },
                                ],
                                name: "gpdEndpoint",
                                type: 32,
                            },
                            {
                                name: "gpdCmd",
                                type: 32,
                            },
                            {
                                name: "gpdPayload",
                                type: 1009,
                            },
                        ],
                    },
                    sinkTableRsp: {
                        ID: 10,
                        name: "sinkTableRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "totalNumberNonEmptyEntries",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                name: "entriesCount",
                                type: 32,
                            },
                        ],
                    },
                    translationTableRsp: {
                        ID: 8,
                        name: "translationTableRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "totalNumberEntries",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                name: "entriesCount",
                                type: 32,
                            },
                        ],
                    },
                },
                name: "greenPower",
            },
            haApplianceControl: {
                ID: 27,
                attributes: {
                    finishTime: {
                        ID: 1,
                        default: 0,
                        max: 65535,
                        name: "finishTime",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    remainingTime: {
                        ID: 2,
                        default: 0,
                        max: 65535,
                        name: "remainingTime",
                        report: true,
                        type: 33,
                    },
                    startTime: {
                        ID: 0,
                        default: 0,
                        max: 65535,
                        name: "startTime",
                        report: true,
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    executionOfCommand: {
                        ID: 0,
                        name: "executionOfCommand",
                        parameters: [
                            {
                                name: "commandId",
                                type: 48,
                            },
                        ],
                    },
                    overloadPause: {
                        ID: 4,
                        name: "overloadPause",
                        parameters: [],
                    },
                    overloadPauseResume: {
                        ID: 3,
                        name: "overloadPauseResume",
                        parameters: [],
                    },
                    overloadWarning: {
                        ID: 5,
                        name: "overloadWarning",
                        parameters: [
                            {
                                name: "warningEvent",
                                type: 48,
                            },
                        ],
                    },
                    signalState: {
                        ID: 1,
                        name: "signalState",
                        parameters: [],
                        required: true,
                        response: 0,
                    },
                    writeFunctions: {
                        ID: 2,
                        name: "writeFunctions",
                        parameters: [],
                    },
                },
                commandsResponse: {
                    signalStateNotification: {
                        ID: 0,
                        name: "signalStateNotification",
                        parameters: [
                            {
                                name: "applianceStatus",
                                type: 48,
                            },
                            {
                                name: "remoteEnableFlagsAndDeviceStatus2",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 3,
                                    },
                                ],
                                name: "applianceStatus2",
                                type: 34,
                            },
                        ],
                        required: true,
                    },
                    signalStateRsp: {
                        ID: 0,
                        name: "signalStateRsp",
                        parameters: [
                            {
                                name: "applianceStatus",
                                type: 48,
                            },
                            {
                                name: "remoteEnableFlagsAndDeviceStatus2",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 3,
                                    },
                                ],
                                name: "applianceStatus2",
                                type: 34,
                            },
                        ],
                        required: true,
                    },
                },
                name: "haApplianceControl",
            },
            haApplianceEventsAlerts: {
                ID: 2818,
                attributes: {},
                commands: {
                    getAlerts: {
                        ID: 0,
                        name: "getAlerts",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {
                    alertsNotification: {
                        ID: 1,
                        name: "alertsNotification",
                        parameters: [
                            {
                                name: "alertscount",
                                type: 32,
                            },
                            {
                                name: "aalert",
                                type: 1003,
                            },
                        ],
                        required: true,
                    },
                    eventNotification: {
                        ID: 2,
                        name: "eventNotification",
                        parameters: [
                            {
                                name: "eventheader",
                                type: 32,
                            },
                            {
                                max: 255,
                                name: "eventid",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    getAlertsRsp: {
                        ID: 0,
                        name: "getAlertsRsp",
                        parameters: [
                            {
                                name: "alertscount",
                                type: 32,
                            },
                            {
                                name: "aalert",
                                type: 1003,
                            },
                        ],
                        required: true,
                    },
                },
                name: "haApplianceEventsAlerts",
            },
            haApplianceIdentification: {
                ID: 2816,
                attributes: {
                    basicIdentification: {
                        ID: 0,
                        name: "basicIdentification",
                        required: true,
                        type: 38,
                    },
                    brandId: {
                        ID: 19,
                        max: 65535,
                        name: "brandId",
                        type: 33,
                    },
                    brandName: {
                        ID: 18,
                        maxLen: 16,
                        name: "brandName",
                        type: 66,
                    },
                    cecedSpecificationVersion: {
                        ID: 26,
                        max: 255,
                        name: "cecedSpecificationVersion",
                        type: 32,
                    },
                    companyId: {
                        ID: 17,
                        max: 65535,
                        name: "companyId",
                        type: 33,
                    },
                    companyName: {
                        ID: 16,
                        maxLen: 16,
                        name: "companyName",
                        type: 66,
                    },
                    model: {
                        ID: 20,
                        maxLen: 16,
                        name: "model",
                        type: 65,
                    },
                    partNumber: {
                        ID: 21,
                        maxLen: 16,
                        name: "partNumber",
                        type: 65,
                    },
                    productRevision: {
                        ID: 22,
                        maxLen: 6,
                        name: "productRevision",
                        type: 65,
                    },
                    productTypeId: {
                        ID: 25,
                        max: 65535,
                        name: "productTypeId",
                        type: 33,
                    },
                    productTypeName: {
                        ID: 24,
                        length: 2,
                        name: "productTypeName",
                        type: 65,
                    },
                    softwareRevision: {
                        ID: 23,
                        maxLen: 6,
                        name: "softwareRevision",
                        type: 65,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "haApplianceIdentification",
            },
            haApplianceStatistics: {
                ID: 2819,
                attributes: {
                    logMaxSize: {
                        ID: 0,
                        default: 60,
                        name: "logMaxSize",
                        required: true,
                        type: 35,
                    },
                    logQueueMaxSize: {
                        ID: 1,
                        default: 1,
                        name: "logQueueMaxSize",
                        required: true,
                        type: 32,
                    },
                },
                commands: {
                    log: {
                        ID: 0,
                        name: "log",
                        parameters: [
                            {
                                name: "logid",
                                type: 35,
                            },
                        ],
                        required: true,
                    },
                    logQueue: {
                        ID: 1,
                        name: "logQueue",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {
                    logNotification: {
                        ID: 0,
                        name: "logNotification",
                        parameters: [
                            {
                                name: "timestamp",
                                type: 226,
                            },
                            {
                                name: "logid",
                                type: 35,
                            },
                            {
                                name: "loglength",
                                type: 35,
                            },
                            {
                                name: "logpayload",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                    logQueueRsp: {
                        ID: 2,
                        name: "logQueueRsp",
                        parameters: [
                            {
                                name: "logqueuesize",
                                type: 32,
                            },
                            {
                                name: "logid",
                                type: 1004,
                            },
                        ],
                        required: true,
                    },
                    logRsp: {
                        ID: 1,
                        name: "logRsp",
                        parameters: [
                            {
                                name: "timestamp",
                                type: 226,
                            },
                            {
                                name: "logid",
                                type: 35,
                            },
                            {
                                name: "loglength",
                                type: 35,
                            },
                            {
                                name: "logpayload",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                    statisticsAvailable: {
                        ID: 3,
                        name: "statisticsAvailable",
                        parameters: [
                            {
                                name: "logqueuesize",
                                type: 32,
                            },
                            {
                                name: "logid",
                                type: 1004,
                            },
                        ],
                        required: true,
                    },
                },
                name: "haApplianceStatistics",
            },
            haDiagnostic: {
                ID: 2821,
                attributes: {
                    aPSRxBcast: {
                        ID: 262,
                        default: 0,
                        max: 65535,
                        name: "aPSRxBcast",
                        type: 33,
                    },
                    aPSRxUcast: {
                        ID: 264,
                        default: 0,
                        max: 65535,
                        name: "aPSRxUcast",
                        type: 33,
                    },
                    aPSTxBcast: {
                        ID: 263,
                        default: 0,
                        max: 65535,
                        name: "aPSTxBcast",
                        type: 33,
                    },
                    aPSTxUcastFail: {
                        ID: 267,
                        default: 0,
                        max: 65535,
                        name: "aPSTxUcastFail",
                        type: 33,
                    },
                    aPSTxUcastRetry: {
                        ID: 266,
                        default: 0,
                        max: 65535,
                        name: "aPSTxUcastRetry",
                        type: 33,
                    },
                    aPSTxUcastSuccess: {
                        ID: 265,
                        default: 0,
                        max: 65535,
                        name: "aPSTxUcastSuccess",
                        type: 33,
                    },
                    apsDecryptFailures: {
                        ID: 278,
                        default: 0,
                        max: 65535,
                        name: "apsDecryptFailures",
                        type: 33,
                    },
                    apsFcFailure: {
                        ID: 275,
                        default: 0,
                        max: 65535,
                        name: "apsFcFailure",
                        type: 33,
                    },
                    apsUnauthorizedKey: {
                        ID: 276,
                        default: 0,
                        max: 65535,
                        name: "apsUnauthorizedKey",
                        type: 33,
                    },
                    averageMacRetryPerApsMessageSent: {
                        ID: 283,
                        default: 0,
                        max: 65535,
                        name: "averageMacRetryPerApsMessageSent",
                        type: 33,
                    },
                    childMoved: {
                        ID: 273,
                        default: 0,
                        max: 65535,
                        name: "childMoved",
                        type: 33,
                    },
                    joinIndication: {
                        ID: 272,
                        default: 0,
                        max: 65535,
                        name: "joinIndication",
                        type: 33,
                    },
                    lastMessageLqi: {
                        ID: 284,
                        default: 0,
                        max: 255,
                        name: "lastMessageLqi",
                        type: 32,
                    },
                    lastMessageRssi: {
                        ID: 285,
                        default: 0,
                        max: 127,
                        min: -127,
                        name: "lastMessageRssi",
                        type: 40,
                    },
                    macRxBcast: {
                        ID: 256,
                        default: 0,
                        max: 4294967295,
                        name: "macRxBcast",
                        type: 35,
                    },
                    macRxUcast: {
                        ID: 258,
                        default: 0,
                        max: 4294967295,
                        name: "macRxUcast",
                        type: 35,
                    },
                    macTxBcast: {
                        ID: 257,
                        default: 0,
                        max: 4294967295,
                        name: "macTxBcast",
                        type: 35,
                    },
                    macTxUcast: {
                        ID: 259,
                        default: 0,
                        max: 4294967295,
                        name: "macTxUcast",
                        type: 35,
                    },
                    macTxUcastFail: {
                        ID: 261,
                        default: 0,
                        max: 65535,
                        name: "macTxUcastFail",
                        type: 33,
                    },
                    macTxUcastRetry: {
                        ID: 260,
                        default: 0,
                        max: 65535,
                        name: "macTxUcastRetry",
                        type: 33,
                    },
                    neighborAdded: {
                        ID: 269,
                        default: 0,
                        max: 65535,
                        name: "neighborAdded",
                        type: 33,
                    },
                    neighborRemoved: {
                        ID: 270,
                        default: 0,
                        max: 65535,
                        name: "neighborRemoved",
                        type: 33,
                    },
                    neighborStale: {
                        ID: 271,
                        default: 0,
                        max: 65535,
                        name: "neighborStale",
                        type: 33,
                    },
                    numberOfResets: {
                        ID: 0,
                        default: 0,
                        max: 65535,
                        name: "numberOfResets",
                        type: 33,
                    },
                    nwkDecryptFailures: {
                        ID: 277,
                        default: 0,
                        max: 65535,
                        name: "nwkDecryptFailures",
                        type: 33,
                    },
                    nwkFcFailure: {
                        ID: 274,
                        default: 0,
                        max: 65535,
                        name: "nwkFcFailure",
                        type: 33,
                    },
                    packetBufferAllocateFailures: {
                        ID: 279,
                        default: 0,
                        max: 65535,
                        name: "packetBufferAllocateFailures",
                        type: 33,
                    },
                    packetValidateDropCount: {
                        ID: 282,
                        default: 0,
                        max: 65535,
                        name: "packetValidateDropCount",
                        type: 33,
                    },
                    persistentMemoryWrites: {
                        ID: 1,
                        default: 0,
                        max: 65535,
                        name: "persistentMemoryWrites",
                        type: 33,
                    },
                    phyToMacQueueLimitReached: {
                        ID: 281,
                        default: 0,
                        max: 65535,
                        name: "phyToMacQueueLimitReached",
                        type: 33,
                    },
                    relayedUcast: {
                        ID: 280,
                        default: 0,
                        max: 65535,
                        name: "relayedUcast",
                        type: 33,
                    },
                    routeDiscInitiated: {
                        ID: 268,
                        default: 0,
                        max: 65535,
                        name: "routeDiscInitiated",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "haDiagnostic",
            },
            haElectricalMeasurement: {
                ID: 2820,
                attributes: {
                    acActivePowerOverload: {
                        ID: 2051,
                        name: "acActivePowerOverload",
                        type: 41,
                    },
                    acAlarmsMask: {
                        ID: 2048,
                        default: 0,
                        name: "acAlarmsMask",
                        type: 25,
                        write: true,
                    },
                    acCurrentDivisor: {
                        ID: 1539,
                        default: 1,
                        min: 1,
                        name: "acCurrentDivisor",
                        report: true,
                        type: 33,
                    },
                    acCurrentMultiplier: {
                        ID: 1538,
                        default: 1,
                        min: 1,
                        name: "acCurrentMultiplier",
                        report: true,
                        type: 33,
                    },
                    acCurrentOverload: {
                        ID: 2050,
                        name: "acCurrentOverload",
                        type: 41,
                    },
                    acFrequency: {
                        ID: 768,
                        name: "acFrequency",
                        report: true,
                        type: 33,
                    },
                    acFrequencyDivisor: {
                        ID: 1025,
                        default: 1,
                        min: 1,
                        name: "acFrequencyDivisor",
                        report: true,
                        type: 33,
                    },
                    acFrequencyMax: {
                        ID: 770,
                        name: "acFrequencyMax",
                        type: 33,
                    },
                    acFrequencyMin: {
                        ID: 769,
                        name: "acFrequencyMin",
                        type: 33,
                    },
                    acFrequencyMultiplier: {
                        ID: 1024,
                        default: 1,
                        min: 1,
                        name: "acFrequencyMultiplier",
                        report: true,
                        type: 33,
                    },
                    acPowerDivisor: {
                        ID: 1541,
                        default: 1,
                        min: 1,
                        name: "acPowerDivisor",
                        report: true,
                        type: 33,
                    },
                    acPowerMultiplier: {
                        ID: 1540,
                        default: 1,
                        min: 1,
                        name: "acPowerMultiplier",
                        report: true,
                        type: 33,
                    },
                    acReactivePowerOverload: {
                        ID: 2052,
                        name: "acReactivePowerOverload",
                        type: 41,
                    },
                    acVoltageDivisor: {
                        ID: 1537,
                        default: 1,
                        min: 1,
                        name: "acVoltageDivisor",
                        report: true,
                        type: 33,
                    },
                    acVoltageMultiplier: {
                        ID: 1536,
                        default: 1,
                        min: 1,
                        name: "acVoltageMultiplier",
                        report: true,
                        type: 33,
                    },
                    acVoltageOverload: {
                        ID: 2049,
                        name: "acVoltageOverload",
                        type: 41,
                    },
                    activeCurrentPhB: {
                        ID: 2306,
                        name: "activeCurrentPhB",
                        report: true,
                        type: 41,
                    },
                    activeCurrentPhC: {
                        ID: 2562,
                        name: "activeCurrentPhC",
                        report: true,
                        type: 41,
                    },
                    activePower: {
                        ID: 1291,
                        name: "activePower",
                        report: true,
                        type: 41,
                    },
                    activePowerMax: {
                        ID: 1293,
                        name: "activePowerMax",
                        type: 41,
                    },
                    activePowerMaxPhB: {
                        ID: 2317,
                        name: "activePowerMaxPhB",
                        type: 41,
                    },
                    activePowerMaxPhC: {
                        ID: 2573,
                        name: "activePowerMaxPhC",
                        type: 41,
                    },
                    activePowerMin: {
                        ID: 1292,
                        name: "activePowerMin",
                        type: 41,
                    },
                    activePowerMinPhB: {
                        ID: 2316,
                        name: "activePowerMinPhB",
                        type: 41,
                    },
                    activePowerMinPhC: {
                        ID: 2572,
                        name: "activePowerMinPhC",
                        type: 41,
                    },
                    activePowerPhB: {
                        ID: 2315,
                        name: "activePowerPhB",
                        report: true,
                        type: 41,
                    },
                    activePowerPhC: {
                        ID: 2571,
                        name: "activePowerPhC",
                        report: true,
                        type: 41,
                    },
                    apparentPower: {
                        ID: 1295,
                        name: "apparentPower",
                        report: true,
                        type: 33,
                    },
                    apparentPowerPhB: {
                        ID: 2319,
                        name: "apparentPowerPhB",
                        report: true,
                        type: 33,
                    },
                    apparentPowerPhC: {
                        ID: 2575,
                        name: "apparentPowerPhC",
                        report: true,
                        type: 33,
                    },
                    averageRmsOverVoltage: {
                        ID: 2053,
                        name: "averageRmsOverVoltage",
                        type: 41,
                    },
                    averageRmsOverVoltageCounter: {
                        ID: 1298,
                        default: 0,
                        name: "averageRmsOverVoltageCounter",
                        type: 33,
                        write: true,
                    },
                    averageRmsOverVoltageCounterPhB: {
                        ID: 2322,
                        default: 0,
                        name: "averageRmsOverVoltageCounterPhB",
                        type: 33,
                        write: true,
                    },
                    averageRmsOverVoltageCounterPhC: {
                        ID: 2578,
                        default: 0,
                        name: "averageRmsOverVoltageCounterPhC",
                        type: 33,
                        write: true,
                    },
                    averageRmsUnderVoltage: {
                        ID: 2054,
                        name: "averageRmsUnderVoltage",
                        type: 41,
                    },
                    averageRmsUnderVoltageCounter: {
                        ID: 1299,
                        default: 0,
                        name: "averageRmsUnderVoltageCounter",
                        type: 33,
                        write: true,
                    },
                    averageRmsVoltageMeasPeriod: {
                        ID: 1297,
                        default: 0,
                        name: "averageRmsVoltageMeasPeriod",
                        type: 33,
                        write: true,
                    },
                    averageRmsVoltageMeasPeriodPhC: {
                        ID: 2577,
                        default: 0,
                        name: "averageRmsVoltageMeasPeriodPhC",
                        type: 33,
                        write: true,
                    },
                    averageRmsVoltageMeasurePeriodPhB: {
                        ID: 2321,
                        default: 0,
                        name: "averageRmsVoltageMeasurePeriodPhB",
                        type: 33,
                        write: true,
                    },
                    averageUnderVoltageCounterPhB: {
                        ID: 2323,
                        default: 0,
                        name: "averageUnderVoltageCounterPhB",
                        type: 33,
                        write: true,
                    },
                    averageUnderVoltageCounterPhC: {
                        ID: 2579,
                        default: 0,
                        name: "averageUnderVoltageCounterPhC",
                        type: 33,
                        write: true,
                    },
                    dcCurrent: {
                        ID: 259,
                        min: -32767,
                        name: "dcCurrent",
                        report: true,
                        type: 41,
                    },
                    dcCurrentDivisor: {
                        ID: 515,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcCurrentDivisor",
                        report: true,
                        type: 33,
                    },
                    dcCurrentMax: {
                        ID: 261,
                        min: -32767,
                        name: "dcCurrentMax",
                        type: 41,
                    },
                    dcCurrentMin: {
                        ID: 260,
                        min: -32767,
                        name: "dcCurrentMin",
                        type: 41,
                    },
                    dcCurrentMultiplier: {
                        ID: 514,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcCurrentMultiplier",
                        report: true,
                        type: 33,
                    },
                    dcCurrentOverload: {
                        ID: 1794,
                        name: "dcCurrentOverload",
                        type: 41,
                    },
                    dcOverloadAlarmsMask: {
                        ID: 1792,
                        default: 0,
                        name: "dcOverloadAlarmsMask",
                        type: 24,
                        write: true,
                    },
                    dcPower: {
                        ID: 262,
                        min: -32767,
                        name: "dcPower",
                        report: true,
                        type: 41,
                    },
                    dcPowerDivisor: {
                        ID: 517,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcPowerDivisor",
                        report: true,
                        type: 33,
                    },
                    dcPowerMax: {
                        ID: 264,
                        min: -32767,
                        name: "dcPowerMax",
                        type: 41,
                    },
                    dcPowerMin: {
                        ID: 263,
                        min: -32767,
                        name: "dcPowerMin",
                        type: 41,
                    },
                    dcPowerMultiplier: {
                        ID: 516,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcPowerMultiplier",
                        report: true,
                        type: 33,
                    },
                    dcVoltage: {
                        ID: 256,
                        min: -32767,
                        name: "dcVoltage",
                        report: true,
                        type: 41,
                    },
                    dcVoltageDivisor: {
                        ID: 513,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcVoltageDivisor",
                        report: true,
                        type: 33,
                    },
                    dcVoltageMin: {
                        ID: 257,
                        min: -32767,
                        name: "dcVoltageMin",
                        type: 41,
                    },
                    dcVoltageMultiplier: {
                        ID: 512,
                        default: 1,
                        max: 65535,
                        min: 1,
                        name: "dcVoltageMultiplier",
                        report: true,
                        type: 33,
                    },
                    dcVoltageOverload: {
                        ID: 1793,
                        name: "dcVoltageOverload",
                        type: 41,
                    },
                    dcvoltagemax: {
                        ID: 258,
                        min: -32767,
                        name: "dcvoltagemax",
                        type: 41,
                    },
                    harmonicCurrentMultiplier: {
                        ID: 1028,
                        default: 0,
                        min: -127,
                        name: "harmonicCurrentMultiplier",
                        report: true,
                        type: 40,
                    },
                    instantaneousActiveCurrent: {
                        ID: 1282,
                        name: "instantaneousActiveCurrent",
                        report: true,
                        type: 41,
                    },
                    instantaneousLineCurrent: {
                        ID: 1281,
                        name: "instantaneousLineCurrent",
                        report: true,
                        type: 33,
                    },
                    instantaneousPower: {
                        ID: 1284,
                        name: "instantaneousPower",
                        type: 41,
                    },
                    instantaneousReactiveCurrent: {
                        ID: 1283,
                        name: "instantaneousReactiveCurrent",
                        report: true,
                        type: 41,
                    },
                    instantaneousVoltage: {
                        ID: 1280,
                        name: "instantaneousVoltage",
                        type: 41,
                    },
                    lineCurrentPhB: {
                        ID: 2305,
                        name: "lineCurrentPhB",
                        report: true,
                        type: 33,
                    },
                    lineCurrentPhC: {
                        ID: 2561,
                        name: "lineCurrentPhC",
                        report: true,
                        type: 33,
                    },
                    meas11thHarmonicCurrent: {
                        ID: 780,
                        name: "meas11thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    meas1stHarmonicCurrent: {
                        ID: 775,
                        name: "meas1stHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    meas3rdHarmonicCurrent: {
                        ID: 776,
                        name: "meas3rdHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    meas5thHarmonicCurrent: {
                        ID: 777,
                        name: "meas5thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    meas7thHarmonicCurrent: {
                        ID: 778,
                        name: "meas7thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    meas9thHarmonicCurrent: {
                        ID: 779,
                        name: "meas9thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase11thHarmonicCurrent: {
                        ID: 786,
                        name: "measPhase11thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase1stHarmonicCurrent: {
                        ID: 781,
                        name: "measPhase1stHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase3rdHarmonicCurrent: {
                        ID: 782,
                        name: "measPhase3rdHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase5thHarmonicCurrent: {
                        ID: 783,
                        name: "measPhase5thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase7thHarmonicCurrent: {
                        ID: 784,
                        name: "measPhase7thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measPhase9thHarmonicCurrent: {
                        ID: 785,
                        name: "measPhase9thHarmonicCurrent",
                        report: true,
                        type: 41,
                    },
                    measurementType: {
                        ID: 0,
                        default: 0,
                        max: 4294967295,
                        name: "measurementType",
                        required: true,
                        type: 27,
                    },
                    neutralCurrent: {
                        ID: 771,
                        name: "neutralCurrent",
                        report: true,
                        type: 33,
                    },
                    phaseHarmonicCurrentMultiplier: {
                        ID: 1029,
                        default: 0,
                        min: -127,
                        name: "phaseHarmonicCurrentMultiplier",
                        report: true,
                        type: 40,
                    },
                    powerDivisor: {
                        ID: 1027,
                        default: 1,
                        max: 16777215,
                        name: "powerDivisor",
                        report: true,
                        type: 35,
                    },
                    powerFactor: {
                        ID: 1296,
                        default: 0,
                        max: 100,
                        min: -100,
                        name: "powerFactor",
                        type: 40,
                    },
                    powerFactorPhB: {
                        ID: 2320,
                        default: 0,
                        max: 100,
                        min: -100,
                        name: "powerFactorPhB",
                        type: 40,
                    },
                    powerFactorPhC: {
                        ID: 2576,
                        default: 0,
                        max: 100,
                        min: -100,
                        name: "powerFactorPhC",
                        type: 40,
                    },
                    powerMultiplier: {
                        ID: 1026,
                        default: 1,
                        max: 16777215,
                        name: "powerMultiplier",
                        report: true,
                        type: 35,
                    },
                    reactiveCurrentPhB: {
                        ID: 2307,
                        name: "reactiveCurrentPhB",
                        report: true,
                        type: 41,
                    },
                    reactiveCurrentPhC: {
                        ID: 2563,
                        name: "reactiveCurrentPhC",
                        report: true,
                        type: 41,
                    },
                    reactivePower: {
                        ID: 1294,
                        name: "reactivePower",
                        report: true,
                        type: 41,
                    },
                    reactivePowerPhB: {
                        ID: 2318,
                        name: "reactivePowerPhB",
                        report: true,
                        type: 41,
                    },
                    reactivePowerPhC: {
                        ID: 2574,
                        name: "reactivePowerPhC",
                        report: true,
                        type: 41,
                    },
                    rmsCurrent: {
                        ID: 1288,
                        name: "rmsCurrent",
                        report: true,
                        type: 33,
                    },
                    rmsCurrentMax: {
                        ID: 1290,
                        name: "rmsCurrentMax",
                        type: 33,
                    },
                    rmsCurrentMaxPhB: {
                        ID: 2314,
                        name: "rmsCurrentMaxPhB",
                        type: 33,
                    },
                    rmsCurrentMaxPhC: {
                        ID: 2570,
                        name: "rmsCurrentMaxPhC",
                        type: 33,
                    },
                    rmsCurrentMin: {
                        ID: 1289,
                        name: "rmsCurrentMin",
                        type: 33,
                    },
                    rmsCurrentMinPhB: {
                        ID: 2313,
                        name: "rmsCurrentMinPhB",
                        type: 33,
                    },
                    rmsCurrentMinPhC: {
                        ID: 2569,
                        name: "rmsCurrentMinPhC",
                        type: 33,
                    },
                    rmsCurrentPhB: {
                        ID: 2312,
                        name: "rmsCurrentPhB",
                        report: true,
                        type: 33,
                    },
                    rmsCurrentPhC: {
                        ID: 2568,
                        name: "rmsCurrentPhC",
                        report: true,
                        type: 33,
                    },
                    rmsExtremeOverVoltage: {
                        ID: 2055,
                        name: "rmsExtremeOverVoltage",
                        type: 41,
                        write: true,
                    },
                    rmsExtremeOverVoltagePeriod: {
                        ID: 1300,
                        default: 0,
                        name: "rmsExtremeOverVoltagePeriod",
                        type: 33,
                        write: true,
                    },
                    rmsExtremeOverVoltagePeriodPhB: {
                        ID: 2324,
                        default: 0,
                        name: "rmsExtremeOverVoltagePeriodPhB",
                        type: 33,
                        write: true,
                    },
                    rmsExtremeOverVoltagePeriodPhC: {
                        ID: 2580,
                        default: 0,
                        name: "rmsExtremeOverVoltagePeriodPhC",
                        type: 33,
                        write: true,
                    },
                    rmsExtremeUnderVoltage: {
                        ID: 2056,
                        name: "rmsExtremeUnderVoltage",
                        type: 41,
                        write: true,
                    },
                    rmsExtremeUnderVoltagePeriod: {
                        ID: 1301,
                        default: 0,
                        name: "rmsExtremeUnderVoltagePeriod",
                        type: 33,
                        write: true,
                    },
                    rmsExtremeUnderVoltagePeriodPhB: {
                        ID: 2325,
                        default: 0,
                        name: "rmsExtremeUnderVoltagePeriodPhB",
                        type: 33,
                        write: true,
                    },
                    rmsExtremeUnderVoltagePeriodPhC: {
                        ID: 2581,
                        default: 0,
                        name: "rmsExtremeUnderVoltagePeriodPhC",
                        type: 33,
                        write: true,
                    },
                    rmsVoltage: {
                        ID: 1285,
                        name: "rmsVoltage",
                        report: true,
                        type: 33,
                    },
                    rmsVoltageMax: {
                        ID: 1287,
                        name: "rmsVoltageMax",
                        type: 33,
                    },
                    rmsVoltageMaxPhB: {
                        ID: 2311,
                        default: 32768,
                        name: "rmsVoltageMaxPhB",
                        type: 33,
                    },
                    rmsVoltageMaxPhC: {
                        ID: 2567,
                        default: 32768,
                        name: "rmsVoltageMaxPhC",
                        type: 33,
                    },
                    rmsVoltageMin: {
                        ID: 1286,
                        name: "rmsVoltageMin",
                        type: 33,
                    },
                    rmsVoltageMinPhB: {
                        ID: 2310,
                        default: 32768,
                        name: "rmsVoltageMinPhB",
                        type: 33,
                    },
                    rmsVoltageMinPhC: {
                        ID: 2566,
                        default: 32768,
                        name: "rmsVoltageMinPhC",
                        type: 33,
                    },
                    rmsVoltagePhB: {
                        ID: 2309,
                        name: "rmsVoltagePhB",
                        report: true,
                        type: 33,
                    },
                    rmsVoltagePhC: {
                        ID: 2565,
                        name: "rmsVoltagePhC",
                        report: true,
                        type: 33,
                    },
                    rmsVoltageSag: {
                        ID: 2057,
                        name: "rmsVoltageSag",
                        type: 41,
                        write: true,
                    },
                    rmsVoltageSagPeriod: {
                        ID: 1302,
                        default: 0,
                        name: "rmsVoltageSagPeriod",
                        type: 33,
                        write: true,
                    },
                    rmsVoltageSagPeriodPhB: {
                        ID: 2326,
                        default: 0,
                        name: "rmsVoltageSagPeriodPhB",
                        type: 33,
                        write: true,
                    },
                    rmsVoltageSagPeriodPhC: {
                        ID: 2582,
                        default: 0,
                        name: "rmsVoltageSagPeriodPhC",
                        type: 33,
                        write: true,
                    },
                    rmsVoltageSwell: {
                        ID: 2058,
                        name: "rmsVoltageSwell",
                        type: 41,
                        write: true,
                    },
                    rmsVoltageSwellPeriod: {
                        ID: 1303,
                        default: 0,
                        name: "rmsVoltageSwellPeriod",
                        type: 33,
                        write: true,
                    },
                    rmsVoltageSwellPeriodPhB: {
                        ID: 2327,
                        default: 0,
                        name: "rmsVoltageSwellPeriodPhB",
                        type: 33,
                        write: true,
                    },
                    rmsVoltageSwellPeriodPhC: {
                        ID: 2583,
                        default: 0,
                        name: "rmsVoltageSwellPeriodPhC",
                        type: 33,
                        write: true,
                    },
                    totalActivePower: {
                        ID: 772,
                        max: 8388607,
                        min: -8388607,
                        name: "totalActivePower",
                        report: true,
                        type: 43,
                    },
                    totalApparentPower: {
                        ID: 774,
                        max: 16777215,
                        name: "totalApparentPower",
                        report: true,
                        type: 35,
                    },
                    totalReactivePower: {
                        ID: 773,
                        max: 8388607,
                        min: -8388607,
                        name: "totalReactivePower",
                        report: true,
                        type: 43,
                    },
                },
                commands: {
                    getMeasurementProfile: {
                        ID: 1,
                        name: "getMeasurementProfile",
                        parameters: [
                            {
                                name: "attrId",
                                type: 233,
                            },
                            {
                                name: "starttime",
                                type: 226,
                            },
                            {
                                name: "numofuntervals",
                                type: 32,
                            },
                        ],
                    },
                    getProfileInfo: {
                        ID: 0,
                        name: "getProfileInfo",
                        parameters: [],
                    },
                },
                commandsResponse: {
                    getMeasurementProfileRsp: {
                        ID: 1,
                        name: "getMeasurementProfileRsp",
                        parameters: [
                            {
                                name: "starttime",
                                type: 226,
                            },
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "profileintervalperiod",
                                type: 48,
                            },
                            {
                                name: "numofintervalsdeliv",
                                type: 32,
                            },
                            {
                                name: "attrId",
                                type: 233,
                            },
                            {
                                name: "intervals",
                                type: 1008,
                            },
                        ],
                    },
                    getProfileInfoRsp: {
                        ID: 0,
                        name: "getProfileInfoRsp",
                        parameters: [
                            {
                                name: "profilecount",
                                type: 32,
                            },
                            {
                                name: "profileintervalperiod",
                                type: 48,
                            },
                            {
                                name: "maxnumofintervals",
                                type: 32,
                            },
                            {
                                name: "numofattrs",
                                type: 32,
                            },
                            {
                                name: "listofattr",
                                type: 1002,
                            },
                        ],
                    },
                },
                name: "haElectricalMeasurement",
            },
            hvacDehumidificationCtrl: {
                ID: 515,
                attributes: {
                    dehumidCooling: {
                        ID: 1,
                        name: "dehumidCooling",
                        report: true,
                        required: true,
                        type: 32,
                    },
                    dehumidHysteresis: {
                        ID: 19,
                        default: 2,
                        max: 20,
                        min: 2,
                        name: "dehumidHysteresis",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    dehumidLockout: {
                        ID: 18,
                        default: 1,
                        name: "dehumidLockout",
                        type: 48,
                        write: true,
                    },
                    dehumidMaxCool: {
                        ID: 20,
                        default: 20,
                        max: 100,
                        min: 20,
                        name: "dehumidMaxCool",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    relativeHumidDisplay: {
                        ID: 21,
                        default: 0,
                        max: 1,
                        name: "relativeHumidDisplay",
                        type: 48,
                        write: true,
                    },
                    relativeHumidity: {
                        ID: 0,
                        max: 100,
                        name: "relativeHumidity",
                        type: 32,
                    },
                    relativeHumidityMode: {
                        ID: 17,
                        default: 0,
                        name: "relativeHumidityMode",
                        type: 48,
                        write: true,
                    },
                    rhDehumidSetpoint: {
                        ID: 16,
                        default: 50,
                        max: 100,
                        min: 30,
                        name: "rhDehumidSetpoint",
                        required: true,
                        type: 32,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "hvacDehumidificationCtrl",
            },
            hvacFanCtrl: {
                ID: 514,
                attributes: {
                    fanMode: {
                        ID: 0,
                        default: 5,
                        max: 6,
                        name: "fanMode",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    fanModeSequence: {
                        ID: 1,
                        default: 2,
                        max: 4,
                        name: "fanModeSequence",
                        required: true,
                        type: 48,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "hvacFanCtrl",
            },
            hvacPumpCfgCtrl: {
                ID: 512,
                attributes: {
                    alarmMask: {
                        ID: 34,
                        name: "alarmMask",
                        type: 25,
                    },
                    capacity: {
                        ID: 19,
                        max: 32767,
                        min: 0,
                        name: "capacity",
                        report: true,
                        required: true,
                        type: 41,
                    },
                    controlMode: {
                        ID: 33,
                        default: 0,
                        max: 254,
                        name: "controlMode",
                        type: 48,
                        write: true,
                    },
                    effectiveControlMode: {
                        ID: 18,
                        max: 254,
                        name: "effectiveControlMode",
                        required: true,
                        type: 48,
                    },
                    effectiveOperationMode: {
                        ID: 17,
                        max: 254,
                        name: "effectiveOperationMode",
                        required: true,
                        type: 48,
                    },
                    lifetimeEnergyConsumed: {
                        ID: 23,
                        default: 0,
                        max: 4294967294,
                        name: "lifetimeEnergyConsumed",
                        type: 35,
                    },
                    lifetimeRunningHours: {
                        ID: 21,
                        default: 0,
                        max: 16777214,
                        name: "lifetimeRunningHours",
                        type: 34,
                        write: true,
                    },
                    maxCompPressure: {
                        ID: 6,
                        max: 32767,
                        min: -32767,
                        name: "maxCompPressure",
                        type: 41,
                    },
                    maxConstFlow: {
                        ID: 10,
                        max: 65534,
                        name: "maxConstFlow",
                        type: 33,
                    },
                    maxConstPressure: {
                        ID: 4,
                        max: 32767,
                        min: -32767,
                        name: "maxConstPressure",
                        type: 41,
                    },
                    maxConstSpeed: {
                        ID: 8,
                        max: 65534,
                        name: "maxConstSpeed",
                        type: 33,
                    },
                    maxConstTemp: {
                        ID: 12,
                        max: 32767,
                        min: -27315,
                        name: "maxConstTemp",
                        type: 41,
                    },
                    maxFlow: {
                        ID: 2,
                        max: 65534,
                        name: "maxFlow",
                        required: true,
                        type: 33,
                    },
                    maxPressure: {
                        ID: 0,
                        max: 32767,
                        min: -32767,
                        name: "maxPressure",
                        required: true,
                        type: 41,
                    },
                    maxSpeed: {
                        ID: 1,
                        max: 65534,
                        name: "maxSpeed",
                        required: true,
                        type: 33,
                    },
                    minCompPressure: {
                        ID: 5,
                        max: 32767,
                        min: -32767,
                        name: "minCompPressure",
                        type: 41,
                    },
                    minConstFlow: {
                        ID: 9,
                        max: 65534,
                        name: "minConstFlow",
                        type: 33,
                    },
                    minConstPressure: {
                        ID: 3,
                        max: 32767,
                        min: -32767,
                        name: "minConstPressure",
                        type: 41,
                    },
                    minConstSpeed: {
                        ID: 7,
                        max: 65534,
                        name: "minConstSpeed",
                        type: 33,
                    },
                    minConstTemp: {
                        ID: 11,
                        max: 32767,
                        min: -27315,
                        name: "minConstTemp",
                        type: 41,
                    },
                    operationMode: {
                        ID: 32,
                        default: 0,
                        max: 254,
                        name: "operationMode",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    power: {
                        ID: 22,
                        max: 16777214,
                        name: "power",
                        type: 34,
                        write: true,
                    },
                    pumpStatus: {
                        ID: 16,
                        name: "pumpStatus",
                        report: true,
                        type: 25,
                    },
                    speed: {
                        ID: 20,
                        max: 65534,
                        name: "speed",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "hvacPumpCfgCtrl",
            },
            hvacThermostat: {
                ID: 513,
                attributes: {
                    absMaxCoolSetpointLimit: {
                        ID: 6,
                        default: 3200,
                        max: 32767,
                        min: -27315,
                        name: "absMaxCoolSetpointLimit",
                        type: 41,
                    },
                    absMaxHeatSetpointLimit: {
                        ID: 4,
                        default: 3000,
                        max: 32767,
                        min: -27315,
                        name: "absMaxHeatSetpointLimit",
                        type: 41,
                    },
                    absMinCoolSetpointLimit: {
                        ID: 5,
                        default: 1600,
                        max: 32767,
                        min: -27315,
                        name: "absMinCoolSetpointLimit",
                        type: 41,
                    },
                    absMinHeatSetpointLimit: {
                        ID: 3,
                        default: 700,
                        max: 32767,
                        min: -27315,
                        name: "absMinHeatSetpointLimit",
                        type: 41,
                    },
                    acCapacity: {
                        ID: 65,
                        default: 0,
                        max: 65535,
                        name: "acCapacity",
                        type: 33,
                        write: true,
                    },
                    acCapacityFormat: {
                        ID: 71,
                        default: 0,
                        name: "acCapacityFormat",
                        type: 48,
                        write: true,
                    },
                    acCollTemp: {
                        ID: 70,
                        max: 32767,
                        min: -27315,
                        name: "acCollTemp",
                        type: 41,
                    },
                    acConpressorType: {
                        ID: 67,
                        default: 0,
                        name: "acConpressorType",
                        type: 48,
                        write: true,
                    },
                    acErrorCode: {
                        ID: 68,
                        default: 0,
                        max: 4294967295,
                        name: "acErrorCode",
                        type: 27,
                        write: true,
                    },
                    acLouverPosition: {
                        ID: 69,
                        default: 0,
                        name: "acLouverPosition",
                        type: 48,
                        write: true,
                    },
                    acRefrigerantType: {
                        ID: 66,
                        default: 0,
                        name: "acRefrigerantType",
                        type: 48,
                        write: true,
                    },
                    acType: {
                        ID: 64,
                        default: 0,
                        name: "acType",
                        type: 48,
                        write: true,
                    },
                    alarmMask: {
                        ID: 29,
                        default: 0,
                        name: "alarmMask",
                        type: 24,
                    },
                    ctrlSeqeOfOper: {
                        ID: 27,
                        default: 4,
                        name: "ctrlSeqeOfOper",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    emergencyHeatDelta: {
                        ID: 58,
                        name: "emergencyHeatDelta",
                        type: 32,
                        write: true,
                    },
                    localTemp: {
                        ID: 0,
                        max: 32767,
                        min: -27315,
                        name: "localTemp",
                        report: true,
                        required: true,
                        type: 41,
                    },
                    localTemperatureCalibration: {
                        ID: 16,
                        default: 0,
                        max: 25,
                        min: -25,
                        name: "localTemperatureCalibration",
                        type: 40,
                        write: true,
                    },
                    maxCoolSetpointLimit: {
                        ID: 24,
                        default: 3200,
                        max: 32767,
                        min: -27315,
                        name: "maxCoolSetpointLimit",
                        type: 41,
                        write: true,
                    },
                    maxHeatSetpointLimit: {
                        ID: 22,
                        default: 3000,
                        max: 32767,
                        min: -27315,
                        name: "maxHeatSetpointLimit",
                        type: 41,
                        write: true,
                    },
                    minCoolSetpointLimit: {
                        ID: 23,
                        default: 1600,
                        max: 32767,
                        min: -27315,
                        name: "minCoolSetpointLimit",
                        type: 41,
                        write: true,
                    },
                    minHeatSetpointLimit: {
                        ID: 21,
                        default: 700,
                        max: 32767,
                        min: -27315,
                        name: "minHeatSetpointLimit",
                        type: 41,
                        write: true,
                    },
                    minSetpointDeadBand: {
                        ID: 25,
                        default: 25,
                        max: 25,
                        min: 10,
                        name: "minSetpointDeadBand",
                        type: 40,
                        write: true,
                        writeOptional: true,
                    },
                    numberOfDailyTrans: {
                        ID: 34,
                        default: 0,
                        max: 255,
                        name: "numberOfDailyTrans",
                        type: 32,
                    },
                    numberOfWeeklyTrans: {
                        ID: 33,
                        default: 0,
                        max: 255,
                        name: "numberOfWeeklyTrans",
                        type: 32,
                    },
                    occupancy: {
                        ID: 2,
                        default: 1,
                        name: "occupancy",
                        type: 24,
                    },
                    occupiedCoolingSetpoint: {
                        ID: 17,
                        default: 2600,
                        name: "occupiedCoolingSetpoint",
                        scene: true,
                        type: 41,
                        write: true,
                    },
                    occupiedHeatingSetpoint: {
                        ID: 18,
                        default: 2000,
                        name: "occupiedHeatingSetpoint",
                        scene: true,
                        type: 41,
                        write: true,
                    },
                    occupiedSetback: {
                        ID: 52,
                        name: "occupiedSetback",
                        type: 32,
                        write: true,
                    },
                    occupiedSetbackMax: {
                        ID: 54,
                        name: "occupiedSetbackMax",
                        type: 32,
                    },
                    occupiedSetbackMin: {
                        ID: 53,
                        min: 0,
                        name: "occupiedSetbackMin",
                        type: 32,
                    },
                    outdoorTemp: {
                        ID: 1,
                        max: 32767,
                        min: -27315,
                        name: "outdoorTemp",
                        type: 41,
                    },
                    pICoolingDemand: {
                        ID: 7,
                        max: 100,
                        name: "pICoolingDemand",
                        report: true,
                        type: 32,
                    },
                    pIHeatingDemand: {
                        ID: 8,
                        max: 100,
                        name: "pIHeatingDemand",
                        report: true,
                        type: 32,
                    },
                    programingOperMode: {
                        ID: 37,
                        default: 0,
                        name: "programingOperMode",
                        report: true,
                        type: 24,
                        write: true,
                    },
                    remoteSensing: {
                        ID: 26,
                        default: 0,
                        name: "remoteSensing",
                        type: 24,
                        write: true,
                    },
                    runningMode: {
                        ID: 30,
                        default: 0,
                        name: "runningMode",
                        type: 48,
                    },
                    runningState: {
                        ID: 41,
                        name: "runningState",
                        type: 25,
                    },
                    setpointChangeAmount: {
                        ID: 49,
                        max: 65535,
                        min: 0,
                        name: "setpointChangeAmount",
                        type: 41,
                    },
                    setpointChangeSource: {
                        ID: 48,
                        default: 0,
                        name: "setpointChangeSource",
                        type: 48,
                    },
                    setpointChangeSourceTimeStamp: {
                        ID: 50,
                        default: 0,
                        max: 4294967294,
                        name: "setpointChangeSourceTimeStamp",
                        type: 226,
                    },
                    startOfWeek: {
                        ID: 32,
                        name: "startOfWeek",
                        type: 48,
                    },
                    systemMode: {
                        ID: 28,
                        default: 1,
                        name: "systemMode",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    systemTypeConfig: {
                        ID: 9,
                        default: 0,
                        name: "systemTypeConfig",
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    tempSetpointHold: {
                        ID: 35,
                        default: 0,
                        name: "tempSetpointHold",
                        type: 48,
                        write: true,
                    },
                    tempSetpointHoldDuration: {
                        ID: 36,
                        max: 1440,
                        min: 0,
                        name: "tempSetpointHoldDuration",
                        type: 33,
                        write: true,
                    },
                    unoccupiedCoolingSetpoint: {
                        ID: 19,
                        default: 2600,
                        name: "unoccupiedCoolingSetpoint",
                        type: 41,
                        write: true,
                    },
                    unoccupiedHeatingSetpoint: {
                        ID: 20,
                        default: 2000,
                        name: "unoccupiedHeatingSetpoint",
                        type: 41,
                        write: true,
                    },
                    unoccupiedSetback: {
                        ID: 55,
                        name: "unoccupiedSetback",
                        type: 32,
                        write: true,
                    },
                    unoccupiedSetbackMax: {
                        ID: 57,
                        name: "unoccupiedSetbackMax",
                        type: 32,
                    },
                    unoccupiedSetbackMin: {
                        ID: 56,
                        min: 0,
                        name: "unoccupiedSetbackMin",
                        type: 32,
                    },
                },
                commands: {
                    clearWeeklySchedule: {
                        ID: 3,
                        name: "clearWeeklySchedule",
                        parameters: [],
                    },
                    getRelayStatusLog: {
                        ID: 4,
                        name: "getRelayStatusLog",
                        parameters: [],
                        response: 1,
                    },
                    getWeeklySchedule: {
                        ID: 2,
                        name: "getWeeklySchedule",
                        parameters: [
                            {
                                name: "daystoreturn",
                                type: 24,
                            },
                            {
                                name: "modetoreturn",
                                type: 24,
                            },
                        ],
                        response: 0,
                    },
                    setWeeklySchedule: {
                        ID: 1,
                        name: "setWeeklySchedule",
                        parameters: [
                            {
                                max: 10,
                                min: 0,
                                name: "numoftrans",
                                type: 32,
                            },
                            {
                                name: "dayofweek",
                                type: 24,
                            },
                            {
                                name: "mode",
                                type: 24,
                            },
                            {
                                name: "transitions",
                                type: 1007,
                            },
                        ],
                    },
                    setpointRaiseLower: {
                        ID: 0,
                        name: "setpointRaiseLower",
                        parameters: [
                            {
                                name: "mode",
                                type: 48,
                            },
                            {
                                name: "amount",
                                type: 40,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    getRelayStatusLogRsp: {
                        ID: 1,
                        name: "getRelayStatusLogRsp",
                        parameters: [
                            {
                                name: "timeofday",
                                type: 33,
                            },
                            {
                                name: "relaystatus",
                                type: 24,
                            },
                            {
                                name: "localtemp",
                                type: 41,
                            },
                            {
                                name: "humidity",
                                type: 32,
                            },
                            {
                                name: "setpoint",
                                type: 41,
                            },
                            {
                                name: "unreadentries",
                                type: 33,
                            },
                        ],
                    },
                    getWeeklyScheduleRsp: {
                        ID: 0,
                        name: "getWeeklyScheduleRsp",
                        parameters: [
                            {
                                max: 10,
                                min: 0,
                                name: "numoftrans",
                                type: 32,
                            },
                            {
                                name: "dayofweek",
                                type: 24,
                            },
                            {
                                name: "mode",
                                type: 24,
                            },
                            {
                                name: "transitions",
                                type: 1007,
                            },
                        ],
                    },
                },
                name: "hvacThermostat",
            },
            hvacUserInterfaceCfg: {
                ID: 516,
                attributes: {
                    keypadLockout: {
                        ID: 1,
                        default: 0,
                        max: 5,
                        name: "keypadLockout",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    programmingVisibility: {
                        ID: 2,
                        default: 0,
                        max: 1,
                        name: "programmingVisibility",
                        type: 48,
                        write: true,
                    },
                    tempDisplayMode: {
                        ID: 0,
                        default: 0,
                        max: 1,
                        name: "tempDisplayMode",
                        required: true,
                        type: 48,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "hvacUserInterfaceCfg",
            },
            keepAlive: {
                ID: 37,
                attributes: {
                    tcKeepAliveBase: {
                        ID: 0,
                        default: 10,
                        max: 255,
                        name: "tcKeepAliveBase",
                        required: true,
                        type: 32,
                    },
                    tcKeepAliveJitter: {
                        ID: 1,
                        default: 300,
                        max: 65535,
                        name: "tcKeepAliveJitter",
                        required: true,
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "keepAlive",
            },
            lightingBallastCfg: {
                ID: 769,
                attributes: {
                    ballastFactorAdjustment: {
                        ID: 21,
                        default: 255,
                        min: 100,
                        name: "ballastFactorAdjustment",
                        type: 32,
                        write: true,
                    },
                    ballastStatus: {
                        ID: 2,
                        default: 0,
                        name: "ballastStatus",
                        type: 24,
                    },
                    intrinsicBallastFactor: {
                        ID: 20,
                        max: 254,
                        name: "intrinsicBallastFactor",
                        type: 32,
                        write: true,
                    },
                    lampAlarmMode: {
                        ID: 52,
                        default: 0,
                        name: "lampAlarmMode",
                        type: 24,
                        write: true,
                    },
                    lampBurnHours: {
                        ID: 51,
                        default: 0,
                        max: 16777214,
                        name: "lampBurnHours",
                        type: 34,
                        write: true,
                    },
                    lampBurnHoursTripPoint: {
                        ID: 53,
                        default: 16777215,
                        max: 16777214,
                        name: "lampBurnHoursTripPoint",
                        type: 34,
                        write: true,
                    },
                    lampManufacturer: {
                        ID: 49,
                        default: "",
                        maxLen: 16,
                        name: "lampManufacturer",
                        type: 66,
                        write: true,
                    },
                    lampQuantity: {
                        ID: 32,
                        max: 254,
                        name: "lampQuantity",
                        type: 32,
                    },
                    lampRatedHours: {
                        ID: 50,
                        default: 16777215,
                        max: 16777214,
                        name: "lampRatedHours",
                        type: 34,
                        write: true,
                    },
                    lampType: {
                        ID: 48,
                        default: "",
                        maxLen: 16,
                        name: "lampType",
                        type: 66,
                        write: true,
                    },
                    maxLevel: {
                        ID: 17,
                        max: 254,
                        min: 1,
                        name: "maxLevel",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    minLevel: {
                        ID: 16,
                        max: 254,
                        min: 1,
                        name: "minLevel",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    physicalMaxLevel: {
                        ID: 1,
                        default: 254,
                        max: 254,
                        min: 1,
                        name: "physicalMaxLevel",
                        required: true,
                        type: 32,
                    },
                    physicalMinLevel: {
                        ID: 0,
                        default: 1,
                        max: 254,
                        min: 1,
                        name: "physicalMinLevel",
                        required: true,
                        type: 32,
                    },
                    powerOnFadeTime: {
                        ID: 19,
                        default: 0,
                        max: 65534,
                        name: "powerOnFadeTime",
                        type: 33,
                        write: true,
                    },
                    powerOnLevel: {
                        ID: 18,
                        max: 254,
                        name: "powerOnLevel",
                        type: 32,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "lightingBallastCfg",
            },
            lightingColorCtrl: {
                ID: 768,
                attributes: {
                    colorCapabilities: {
                        ID: 16394,
                        default: 0,
                        max: 31,
                        name: "colorCapabilities",
                        required: true,
                        type: 25,
                    },
                    colorLoopActive: {
                        ID: 16386,
                        default: 0,
                        max: 255,
                        name: "colorLoopActive",
                        scene: true,
                        type: 32,
                    },
                    colorLoopDirection: {
                        ID: 16387,
                        default: 0,
                        max: 255,
                        name: "colorLoopDirection",
                        scene: true,
                        type: 32,
                    },
                    colorLoopStartEnhancedHue: {
                        ID: 16389,
                        default: 8960,
                        max: 65535,
                        name: "colorLoopStartEnhancedHue",
                        type: 33,
                    },
                    colorLoopStoredEnhancedHue: {
                        ID: 16390,
                        default: 0,
                        max: 65535,
                        name: "colorLoopStoredEnhancedHue",
                        type: 33,
                    },
                    colorLoopTime: {
                        ID: 16388,
                        default: 25,
                        max: 65535,
                        name: "colorLoopTime",
                        scene: true,
                        type: 33,
                    },
                    colorMode: {
                        ID: 8,
                        default: 1,
                        max: 2,
                        name: "colorMode",
                        required: true,
                        type: 48,
                    },
                    colorPointBIntensity: {
                        ID: 60,
                        max: 255,
                        name: "colorPointBIntensity",
                        type: 32,
                        write: true,
                    },
                    colorPointBX: {
                        ID: 58,
                        max: 65279,
                        name: "colorPointBX",
                        type: 33,
                        write: true,
                    },
                    colorPointBY: {
                        ID: 59,
                        max: 65279,
                        name: "colorPointBY",
                        type: 33,
                        write: true,
                    },
                    colorPointGIntensity: {
                        ID: 56,
                        max: 255,
                        name: "colorPointGIntensity",
                        type: 32,
                        write: true,
                    },
                    colorPointGX: {
                        ID: 54,
                        max: 65279,
                        name: "colorPointGX",
                        type: 33,
                        write: true,
                    },
                    colorPointGY: {
                        ID: 55,
                        max: 65279,
                        name: "colorPointGY",
                        type: 33,
                        write: true,
                    },
                    colorPointRIntensity: {
                        ID: 52,
                        max: 255,
                        name: "colorPointRIntensity",
                        type: 32,
                        write: true,
                    },
                    colorPointRX: {
                        ID: 50,
                        max: 65279,
                        name: "colorPointRX",
                        type: 33,
                        write: true,
                    },
                    colorPointRY: {
                        ID: 51,
                        max: 65279,
                        name: "colorPointRY",
                        type: 33,
                        write: true,
                    },
                    colorTempPhysicalMax: {
                        ID: 16396,
                        default: 65279,
                        max: 65279,
                        name: "colorTempPhysicalMax",
                        type: 33,
                    },
                    colorTempPhysicalMin: {
                        ID: 16395,
                        default: 0,
                        max: 65279,
                        name: "colorTempPhysicalMin",
                        type: 33,
                    },
                    colorTemperature: {
                        ID: 7,
                        default: 250,
                        max: 65279,
                        name: "colorTemperature",
                        report: true,
                        scene: true,
                        special: { 0: "Undefined" },
                        type: 33,
                    },
                    compensationText: {
                        ID: 6,
                        maxLen: 254,
                        name: "compensationText",
                        type: 66,
                    },
                    coupleColorTempToLevelMin: {
                        ID: 16397,
                        name: "coupleColorTempToLevelMin",
                        type: 33,
                    },
                    currentHue: {
                        ID: 0,
                        default: 0,
                        max: 254,
                        name: "currentHue",
                        report: true,
                        type: 32,
                    },
                    currentSaturation: {
                        ID: 1,
                        default: 0,
                        max: 254,
                        name: "currentSaturation",
                        report: true,
                        scene: true,
                        type: 32,
                    },
                    currentX: {
                        ID: 3,
                        default: 24939,
                        max: 65279,
                        name: "currentX",
                        report: true,
                        scene: true,
                        type: 33,
                    },
                    currentY: {
                        ID: 4,
                        default: 24701,
                        max: 65279,
                        name: "currentY",
                        report: true,
                        scene: true,
                        type: 33,
                    },
                    driftCompensation: {
                        ID: 5,
                        max: 4,
                        name: "driftCompensation",
                        type: 48,
                    },
                    enhancedColorMode: {
                        ID: 16385,
                        default: 1,
                        max: 255,
                        name: "enhancedColorMode",
                        required: true,
                        type: 48,
                    },
                    enhancedCurrentHue: {
                        ID: 16384,
                        default: 0,
                        max: 65535,
                        name: "enhancedCurrentHue",
                        scene: true,
                        type: 33,
                    },
                    numPrimaries: {
                        ID: 16,
                        max: 6,
                        name: "numPrimaries",
                        required: true,
                        type: 32,
                    },
                    options: {
                        ID: 15,
                        default: 0,
                        name: "options",
                        required: true,
                        type: 24,
                        write: true,
                    },
                    primary1Intensity: {
                        ID: 19,
                        max: 255,
                        name: "primary1Intensity",
                        type: 32,
                    },
                    primary1X: {
                        ID: 17,
                        max: 65279,
                        name: "primary1X",
                        type: 33,
                    },
                    primary1Y: {
                        ID: 18,
                        max: 65279,
                        name: "primary1Y",
                        type: 33,
                    },
                    primary2Intensity: {
                        ID: 23,
                        name: "primary2Intensity",
                        type: 32,
                    },
                    primary2X: {
                        ID: 21,
                        max: 65279,
                        name: "primary2X",
                        type: 33,
                    },
                    primary2Y: {
                        ID: 22,
                        max: 65279,
                        name: "primary2Y",
                        type: 33,
                    },
                    primary3Intensity: {
                        ID: 27,
                        max: 255,
                        name: "primary3Intensity",
                        type: 32,
                    },
                    primary3X: {
                        ID: 25,
                        max: 65279,
                        name: "primary3X",
                        type: 33,
                    },
                    primary3Y: {
                        ID: 26,
                        max: 65279,
                        name: "primary3Y",
                        type: 33,
                    },
                    primary4Intensity: {
                        ID: 34,
                        max: 255,
                        name: "primary4Intensity",
                        type: 32,
                    },
                    primary4X: {
                        ID: 32,
                        max: 65279,
                        name: "primary4X",
                        type: 33,
                    },
                    primary4Y: {
                        ID: 33,
                        max: 65279,
                        name: "primary4Y",
                        type: 33,
                    },
                    primary5Intensity: {
                        ID: 38,
                        max: 255,
                        name: "primary5Intensity",
                        type: 32,
                    },
                    primary5X: {
                        ID: 36,
                        max: 65279,
                        name: "primary5X",
                        type: 33,
                    },
                    primary5Y: {
                        ID: 37,
                        max: 65279,
                        name: "primary5Y",
                        type: 33,
                    },
                    primary6Intensity: {
                        ID: 42,
                        max: 255,
                        name: "primary6Intensity",
                        type: 32,
                    },
                    primary6X: {
                        ID: 40,
                        max: 65279,
                        name: "primary6X",
                        type: 33,
                    },
                    primary6Y: {
                        ID: 41,
                        max: 65279,
                        name: "primary6Y",
                        type: 33,
                    },
                    remainingTime: {
                        ID: 2,
                        default: 0,
                        max: 65534,
                        name: "remainingTime",
                        type: 33,
                    },
                    startUpColorTemperature: {
                        ID: 16400,
                        max: 65279,
                        name: "startUpColorTemperature",
                        special: { 65535: "SetColorTempToPreviousValue" },
                        type: 33,
                        write: true,
                    },
                    whitePointX: {
                        ID: 48,
                        max: 65279,
                        name: "whitePointX",
                        type: 33,
                        write: true,
                    },
                    whitePointY: {
                        ID: 49,
                        max: 65279,
                        name: "whitePointY",
                        type: 33,
                        write: true,
                    },
                },
                commands: {
                    colorLoopSet: {
                        ID: 68,
                        name: "colorLoopSet",
                        parameters: [
                            {
                                name: "updateflags",
                                type: 24,
                            },
                            {
                                name: "action",
                                type: 48,
                            },
                            {
                                name: "direction",
                                type: 48,
                            },
                            {
                                name: "time",
                                type: 33,
                            },
                            {
                                name: "starthue",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    enhancedMoveHue: {
                        ID: 65,
                        name: "enhancedMoveHue",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    enhancedMoveToHue: {
                        ID: 64,
                        name: "enhancedMoveToHue",
                        parameters: [
                            {
                                name: "enhancehue",
                                type: 33,
                            },
                            {
                                name: "direction",
                                type: 48,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    enhancedMoveToHueAndSaturation: {
                        ID: 67,
                        name: "enhancedMoveToHueAndSaturation",
                        parameters: [
                            {
                                name: "enhancehue",
                                type: 33,
                            },
                            {
                                name: "saturation",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    enhancedStepHue: {
                        ID: 66,
                        name: "enhancedStepHue",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 33,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveColor: {
                        ID: 8,
                        name: "moveColor",
                        parameters: [
                            {
                                name: "ratex",
                                type: 41,
                            },
                            {
                                name: "ratey",
                                type: 41,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveColorTemp: {
                        ID: 75,
                        name: "moveColorTemp",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 33,
                            },
                            {
                                name: "minimum",
                                type: 33,
                            },
                            {
                                name: "maximum",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveHue: {
                        ID: 1,
                        name: "moveHue",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveSaturation: {
                        ID: 4,
                        name: "moveSaturation",
                        parameters: [
                            {
                                name: "movemode",
                                type: 48,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveToColor: {
                        ID: 7,
                        name: "moveToColor",
                        parameters: [
                            {
                                name: "colorx",
                                type: 33,
                            },
                            {
                                name: "colory",
                                type: 33,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveToColorTemp: {
                        ID: 10,
                        name: "moveToColorTemp",
                        parameters: [
                            {
                                name: "colortemp",
                                type: 33,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveToHue: {
                        ID: 0,
                        name: "moveToHue",
                        parameters: [
                            {
                                name: "hue",
                                type: 32,
                            },
                            {
                                name: "direction",
                                type: 48,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveToHueAndSaturation: {
                        ID: 6,
                        name: "moveToHueAndSaturation",
                        parameters: [
                            {
                                name: "hue",
                                type: 32,
                            },
                            {
                                name: "saturation",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    moveToSaturation: {
                        ID: 3,
                        name: "moveToSaturation",
                        parameters: [
                            {
                                name: "saturation",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    stepColor: {
                        ID: 9,
                        name: "stepColor",
                        parameters: [
                            {
                                name: "stepx",
                                type: 41,
                            },
                            {
                                name: "stepy",
                                type: 41,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    stepColorTemp: {
                        ID: 76,
                        name: "stepColorTemp",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 33,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                name: "minimum",
                                type: 33,
                            },
                            {
                                name: "maximum",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    stepHue: {
                        ID: 2,
                        name: "stepHue",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    stepSaturation: {
                        ID: 5,
                        name: "stepSaturation",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 48,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                    stopMoveStep: {
                        ID: 71,
                        name: "stopMoveStep",
                        parameters: [
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                    },
                },
                commandsResponse: {},
                name: "lightingColorCtrl",
            },
            manuSpecificAmazonWWAH: {
                ID: 64599,
                attributes: {
                    clusterRevision: {
                        ID: 65533,
                        max: 65535,
                        name: "clusterRevision",
                        type: 33,
                        write: true,
                    },
                    configurationModeEnabled: {
                        ID: 13,
                        name: "configurationModeEnabled",
                        type: 16,
                        write: true,
                    },
                    currentDebugReportID: {
                        ID: 14,
                        max: 255,
                        name: "currentDebugReportID",
                        type: 32,
                        write: true,
                    },
                    disableOTADowngrades: {
                        ID: 2,
                        name: "disableOTADowngrades",
                        type: 16,
                        write: true,
                    },
                    macPollFailureWaitTime: {
                        ID: 12,
                        max: 255,
                        name: "macPollFailureWaitTime",
                        type: 32,
                        write: true,
                    },
                    macRetryCount: {
                        ID: 5,
                        max: 255,
                        name: "macRetryCount",
                        type: 32,
                        write: true,
                    },
                    mgmtLeaveWithoutRejoinEnabled: {
                        ID: 3,
                        name: "mgmtLeaveWithoutRejoinEnabled",
                        type: 16,
                        write: true,
                    },
                    nwkRetryCount: {
                        ID: 4,
                        max: 255,
                        name: "nwkRetryCount",
                        type: 32,
                        write: true,
                    },
                    otaMaxOfflineDuration: {
                        ID: 19,
                        max: 65535,
                        name: "otaMaxOfflineDuration",
                        type: 33,
                        write: true,
                    },
                    pendingNetworkUpdateChannel: {
                        ID: 17,
                        max: 255,
                        name: "pendingNetworkUpdateChannel",
                        type: 32,
                        write: true,
                    },
                    pendingNetworkUpdatePANID: {
                        ID: 18,
                        max: 65535,
                        name: "pendingNetworkUpdatePANID",
                        type: 33,
                        write: true,
                    },
                    routerCheckInEnabled: {
                        ID: 6,
                        name: "routerCheckInEnabled",
                        type: 16,
                        write: true,
                    },
                    tcSecurityOnNwkKeyRotationEnabled: {
                        ID: 15,
                        name: "tcSecurityOnNwkKeyRotationEnabled",
                        type: 16,
                        write: true,
                    },
                    touchlinkInterpanEnabled: {
                        ID: 7,
                        name: "touchlinkInterpanEnabled",
                        type: 16,
                        write: true,
                    },
                    wwahAppEventRetryEnabled: {
                        ID: 9,
                        name: "wwahAppEventRetryEnabled",
                        type: 16,
                        write: true,
                    },
                    wwahAppEventRetryQueueSize: {
                        ID: 10,
                        max: 255,
                        name: "wwahAppEventRetryQueueSize",
                        type: 32,
                        write: true,
                    },
                    wwahBadParentRecoveryEnabled: {
                        ID: 16,
                        name: "wwahBadParentRecoveryEnabled",
                        type: 16,
                        write: true,
                    },
                    wwahParentClassificationEnabled: {
                        ID: 8,
                        name: "wwahParentClassificationEnabled",
                        type: 16,
                        write: true,
                    },
                    wwahRejoinEnabled: {
                        ID: 11,
                        name: "wwahRejoinEnabled",
                        type: 16,
                        write: true,
                    },
                },
                commands: {
                    clearBindingTable: {
                        ID: 10,
                        name: "clearBindingTable",
                        parameters: [],
                    },
                },
                commandsResponse: {},
                manufacturerCode: 4631,
                name: "manuSpecificAmazonWWAH",
            },
            manuSpecificTuya: {
                ID: 61184,
                attributes: {},
                commands: {
                    dataQuery: {
                        ID: 3,
                        name: "dataQuery",
                        parameters: [],
                    },
                    dataRequest: {
                        ID: 0,
                        name: "dataRequest",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    mcuGatewayConnectionStatus: {
                        ID: 37,
                        name: "mcuGatewayConnectionStatus",
                        parameters: [
                            {
                                max: 65535,
                                name: "payloadSize",
                                type: 33,
                            },
                            {
                                max: 255,
                                name: "payload",
                                type: 32,
                            },
                        ],
                    },
                    mcuOtaBlockDataResponse: {
                        ID: 20,
                        name: "mcuOtaBlockDataResponse",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                max: 255,
                                name: "status",
                                type: 32,
                            },
                            {
                                max: 4294967295,
                                name: "key_hi",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "key_lo",
                                type: 35,
                            },
                            {
                                max: 255,
                                name: "version",
                                type: 32,
                            },
                            {
                                max: 4294967295,
                                name: "offset",
                                type: 35,
                            },
                            {
                                name: "imageData",
                                type: 1001,
                            },
                        ],
                    },
                    mcuOtaNotify: {
                        ID: 18,
                        name: "mcuOtaNotify",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                max: 4294967295,
                                name: "key_hi",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "key_lo",
                                type: 35,
                            },
                            {
                                max: 255,
                                name: "version",
                                type: 32,
                            },
                            {
                                max: 4294967295,
                                name: "imageSize",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "crc",
                                type: 35,
                            },
                        ],
                    },
                    mcuSyncTime: {
                        ID: 36,
                        name: "mcuSyncTime",
                        parameters: [
                            {
                                max: 65535,
                                name: "payloadSize",
                                type: 33,
                            },
                            {
                                name: "payload",
                                type: 1001,
                            },
                        ],
                    },
                    mcuVersionRequest: {
                        ID: 16,
                        name: "mcuVersionRequest",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                        ],
                    },
                    sendData: {
                        ID: 4,
                        name: "sendData",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    tuyaWeatherSync: {
                        ID: 97,
                        name: "tuyaWeatherSync",
                        parameters: [
                            {
                                name: "payload",
                                type: 1008,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    activeStatusReport: {
                        ID: 6,
                        name: "activeStatusReport",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    activeStatusReportAlt: {
                        ID: 5,
                        name: "activeStatusReportAlt",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    dataReport: {
                        ID: 2,
                        name: "dataReport",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    dataResponse: {
                        ID: 1,
                        name: "dataResponse",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                name: "dpValues",
                                type: 1011,
                            },
                        ],
                    },
                    mcuGatewayConnectionStatus: {
                        ID: 37,
                        name: "mcuGatewayConnectionStatus",
                        parameters: [
                            {
                                max: 65535,
                                name: "payloadSize",
                                type: 33,
                            },
                        ],
                    },
                    mcuOtaBlockDataRequest: {
                        ID: 19,
                        name: "mcuOtaBlockDataRequest",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                max: 4294967295,
                                name: "key_hi",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "key_lo",
                                type: 35,
                            },
                            {
                                max: 255,
                                name: "version",
                                type: 32,
                            },
                            {
                                max: 4294967295,
                                name: "offset",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "size",
                                type: 35,
                            },
                        ],
                    },
                    mcuOtaResult: {
                        ID: 21,
                        name: "mcuOtaResult",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                max: 255,
                                name: "status",
                                type: 32,
                            },
                            {
                                max: 4294967295,
                                name: "key_hi",
                                type: 35,
                            },
                            {
                                max: 4294967295,
                                name: "key_lo",
                                type: 35,
                            },
                            {
                                max: 255,
                                name: "version",
                                type: 32,
                            },
                        ],
                    },
                    mcuSyncTime: {
                        ID: 36,
                        name: "mcuSyncTime",
                        parameters: [
                            {
                                max: 65535,
                                name: "payloadSize",
                                type: 33,
                            },
                        ],
                    },
                    mcuVersionResponse: {
                        ID: 17,
                        name: "mcuVersionResponse",
                        parameters: [
                            {
                                max: 65535,
                                name: "seq",
                                type: 33,
                            },
                            {
                                max: 255,
                                name: "version",
                                type: 32,
                            },
                        ],
                    },
                    tuyaWeatherRequest: {
                        ID: 96,
                        name: "tuyaWeatherRequest",
                        parameters: [
                            {
                                name: "payload",
                                type: 1008,
                            },
                        ],
                    },
                },
                name: "manuSpecificTuya",
            },
            mobileDeviceCfg: {
                ID: 34,
                attributes: {
                    keepAliveTime: {
                        ID: 0,
                        default: 15,
                        max: 65535,
                        min: 1,
                        name: "keepAliveTime",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    rejoinTimeout: {
                        ID: 1,
                        default: 65535,
                        max: 65535,
                        name: "rejoinTimeout",
                        required: true,
                        special: { 65535: "Never" },
                        type: 33,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {
                    keepAliveNotification: {
                        ID: 0,
                        name: "keepAliveNotification",
                        parameters: [
                            {
                                name: "keepAliveTime",
                                type: 33,
                            },
                            {
                                name: "rejoinTimeout",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                },
                name: "mobileDeviceCfg",
            },
            msBromate: {
                ID: 1048,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msBromate",
            },
            msBromodichloromethane: {
                ID: 1061,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msBromodichloromethane",
            },
            msBromoform: {
                ID: 1062,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msBromoform",
            },
            msCO2: {
                ID: 1037,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msCO2",
            },
            msCarbonMonoxide: {
                ID: 1036,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msCarbonMonoxide",
            },
            msChloramines: {
                ID: 1049,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msChloramines",
            },
            msChlorine: {
                ID: 1050,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msChlorine",
            },
            msChlorodibromomethane: {
                ID: 1063,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msChlorodibromomethane",
            },
            msChloroform: {
                ID: 1064,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msChloroform",
            },
            msCopper: {
                ID: 1057,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msCopper",
            },
            msDissolvedOxygen: {
                ID: 1047,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msDissolvedOxygen",
            },
            msElectricalConductivity: {
                ID: 1034,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 65534,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 65533,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 100,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msElectricalConductivity",
            },
            msEthylene: {
                ID: 1038,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msEthylene",
            },
            msEthyleneOxide: {
                ID: 1039,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msEthyleneOxide",
            },
            msFecalColiformAndEColi: {
                ID: 1051,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msFecalColiformAndEColi",
            },
            msFlowMeasurement: {
                ID: 1028,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 65534,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 65533,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msFlowMeasurement",
            },
            msFluoride: {
                ID: 1052,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msFluoride",
            },
            msFormaldehyde: {
                ID: 1067,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msFormaldehyde",
            },
            msHaloaceticAcids: {
                ID: 1053,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msHaloaceticAcids",
            },
            msHydrogen: {
                ID: 1040,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msHydrogen",
            },
            msHydrogenSulfide: {
                ID: 1041,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msHydrogenSulfide",
            },
            msIlluminanceLevelSensing: {
                ID: 1025,
                attributes: {
                    illuminanceTargetLevel: {
                        ID: 16,
                        max: 65534,
                        name: "illuminanceTargetLevel",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    levelStatus: {
                        ID: 0,
                        max: 254,
                        name: "levelStatus",
                        report: true,
                        required: true,
                        type: 48,
                    },
                    lightSensorType: {
                        ID: 1,
                        max: 254,
                        name: "lightSensorType",
                        type: 48,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msIlluminanceLevelSensing",
            },
            msIlluminanceMeasurement: {
                ID: 1024,
                attributes: {
                    lightSensorType: {
                        ID: 4,
                        default: 255,
                        name: "lightSensorType",
                        special: { 255: "Unknown" },
                        type: 48,
                    },
                    maxMeasuredValue: {
                        ID: 2,
                        max: 65534,
                        min: 2,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        default: 0,
                        max: 65534,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        special: {
                            0: "TooLowToBeMeasured",
                            65535: "Invalid",
                        },
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 65533,
                        min: 1,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msIlluminanceMeasurement",
            },
            msLead: {
                ID: 1058,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msLead",
            },
            msLeafWetness: {
                ID: 1031,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 10000,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 9999,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msLeafWetness",
            },
            msManganese: {
                ID: 1059,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msManganese",
            },
            msNitricOxide: {
                ID: 1042,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msNitricOxide",
            },
            msNitrogenDioxide: {
                ID: 1043,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msNitrogenDioxide",
            },
            msOccupancySensing: {
                ID: 1030,
                attributes: {
                    contactOToUDelay: {
                        ID: 48,
                        default: 0,
                        max: 65534,
                        name: "contactOToUDelay",
                        type: 33,
                        write: true,
                    },
                    contactUToODelay: {
                        ID: 49,
                        default: 0,
                        max: 65534,
                        name: "contactUToODelay",
                        type: 33,
                        write: true,
                    },
                    contactUToOThreshold: {
                        ID: 50,
                        default: 1,
                        max: 254,
                        min: 1,
                        name: "contactUToOThreshold",
                        type: 32,
                        write: true,
                    },
                    occupancy: {
                        ID: 0,
                        name: "occupancy",
                        report: true,
                        required: true,
                        type: 24,
                    },
                    occupancySensorType: {
                        ID: 1,
                        default: 0,
                        name: "occupancySensorType",
                        required: true,
                        type: 48,
                    },
                    occupancySensorTypeBitmap: {
                        ID: 2,
                        name: "occupancySensorTypeBitmap",
                        required: true,
                        type: 24,
                    },
                    pirOToUDelay: {
                        ID: 16,
                        default: 0,
                        max: 65534,
                        name: "pirOToUDelay",
                        type: 33,
                        write: true,
                    },
                    pirUToODelay: {
                        ID: 17,
                        default: 0,
                        max: 65534,
                        name: "pirUToODelay",
                        type: 33,
                        write: true,
                    },
                    pirUToOThreshold: {
                        ID: 18,
                        default: 1,
                        max: 254,
                        min: 1,
                        name: "pirUToOThreshold",
                        type: 32,
                        write: true,
                    },
                    ultrasonicOToUDelay: {
                        ID: 32,
                        default: 0,
                        max: 65534,
                        name: "ultrasonicOToUDelay",
                        type: 33,
                        write: true,
                    },
                    ultrasonicUToODelay: {
                        ID: 33,
                        default: 0,
                        max: 65534,
                        name: "ultrasonicUToODelay",
                        type: 33,
                        write: true,
                    },
                    ultrasonicUToOThreshold: {
                        ID: 34,
                        default: 1,
                        max: 254,
                        min: 1,
                        name: "ultrasonicUToOThreshold",
                        type: 32,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msOccupancySensing",
            },
            msOxygen: {
                ID: 1044,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msOxygen",
            },
            msOzone: {
                ID: 1045,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msOzone",
            },
            msPressureMeasurement: {
                ID: 1027,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 32767,
                        min: -32766,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 41,
                    },
                    maxScaledValue: {
                        ID: 18,
                        max: 32767,
                        min: -32766,
                        name: "maxScaledValue",
                        type: 41,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 41,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 32766,
                        min: -32767,
                        name: "minMeasuredValue",
                        required: true,
                        type: 41,
                    },
                    minScaledValue: {
                        ID: 17,
                        max: 32766,
                        min: -32767,
                        name: "minScaledValue",
                        type: 41,
                    },
                    scale: {
                        ID: 20,
                        max: 127,
                        min: -127,
                        name: "scale",
                        type: 40,
                    },
                    scaledTolerance: {
                        ID: 19,
                        max: 2048,
                        name: "scaledTolerance",
                        type: 33,
                    },
                    scaledValue: {
                        ID: 16,
                        default: 0,
                        name: "scaledValue",
                        type: 41,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msPressureMeasurement",
            },
            msRelativeHumidity: {
                ID: 1029,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 10000,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 9999,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msRelativeHumidity",
            },
            msSodium: {
                ID: 1065,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msSodium",
            },
            msSoilMoisture: {
                ID: 1032,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 10000,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 9999,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msSoilMoisture",
            },
            msSulfate: {
                ID: 1060,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msSulfate",
            },
            msSulfurDioxide: {
                ID: 1046,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msSulfurDioxide",
            },
            msTemperatureMeasurement: {
                ID: 1026,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 32767,
                        min: -27314,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 41,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 41,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 32766,
                        min: -27315,
                        name: "minMeasuredValue",
                        required: true,
                        type: 41,
                    },
                    tolerance: {
                        ID: 3,
                        max: 2048,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msTemperatureMeasurement",
            },
            msTotalColiformBacteria: {
                ID: 1055,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msTotalColiformBacteria",
            },
            msTotalTrihalomethanes: {
                ID: 1054,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msTotalTrihalomethanes",
            },
            msTurbidity: {
                ID: 1056,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        min: 0,
                        name: "minMeasuredValue",
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msTurbidity",
            },
            msWindSpeed: {
                ID: 1035,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 65534,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 65533,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        default: 0,
                        max: 776,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "msWindSpeed",
            },
            nearestGateway: {
                ID: 36,
                attributes: {
                    nearestGateway: {
                        ID: 0,
                        default: 0,
                        max: 65528,
                        name: "nearestGateway",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    newMobileNode: {
                        ID: 1,
                        default: 0,
                        max: 65528,
                        name: "newMobileNode",
                        read: false,
                        required: true,
                        type: 33,
                        write: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "nearestGateway",
            },
            neighborCleaning: {
                ID: 35,
                attributes: {
                    neighborCleaningTimeout: {
                        ID: 0,
                        default: 30,
                        max: 65535,
                        min: 1,
                        name: "neighborCleaningTimeout",
                        required: true,
                        type: 33,
                        write: true,
                    },
                },
                commands: {
                    purgeEntries: {
                        ID: 0,
                        name: "purgeEntries",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "neighborCleaning",
            },
            pHMeasurement: {
                ID: 1033,
                attributes: {
                    maxMeasuredValue: {
                        ID: 2,
                        max: 1400,
                        min: 1,
                        name: "maxMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    minMeasuredValue: {
                        ID: 1,
                        max: 1399,
                        name: "minMeasuredValue",
                        required: true,
                        type: 33,
                    },
                    tolerance: {
                        ID: 3,
                        max: 200,
                        name: "tolerance",
                        type: 33,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "pHMeasurement",
            },
            pi11073ProtocolTunnel: {
                ID: 1556,
                attributes: {
                    connected: {
                        ID: 3,
                        name: "connected",
                        type: 16,
                    },
                    deviceidList: {
                        ID: 0,
                        default: 65535,
                        name: "deviceidList",
                        type: 72,
                    },
                    idleTimeout: {
                        ID: 5,
                        default: 0,
                        max: 65535,
                        min: 1,
                        name: "idleTimeout",
                        type: 33,
                    },
                    managerEndpoint: {
                        ID: 2,
                        max: 255,
                        min: 1,
                        name: "managerEndpoint",
                        type: 32,
                    },
                    managerTarget: {
                        ID: 1,
                        name: "managerTarget",
                        type: 240,
                    },
                    preemptible: {
                        ID: 4,
                        name: "preemptible",
                        type: 16,
                    },
                },
                commands: {
                    connectRequest: {
                        ID: 1,
                        name: "connectRequest",
                        parameters: [
                            {
                                name: "control",
                                type: 24,
                            },
                            {
                                name: "idleTimeout",
                                type: 33,
                            },
                            {
                                name: "managerTarget",
                                type: 240,
                            },
                            {
                                name: "managerEndpoint",
                                type: 32,
                            },
                        ],
                    },
                    connectStatusNotification: {
                        ID: 3,
                        name: "connectStatusNotification",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                    },
                    disconnectRequest: {
                        ID: 2,
                        name: "disconnectRequest",
                        parameters: [
                            {
                                name: "managerTarget",
                                type: 240,
                            },
                        ],
                    },
                    transferApdu: {
                        ID: 0,
                        name: "transferApdu",
                        parameters: [
                            {
                                name: "apdu",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "pi11073ProtocolTunnel",
            },
            piAnalogInputExt: {
                ID: 1539,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    deadband: {
                        ID: 25,
                        default: 0,
                        name: "deadband",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        type: 72,
                    },
                    highLimit: {
                        ID: 45,
                        default: 0,
                        name: "highLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    limitEnable: {
                        ID: 52,
                        default: 0,
                        max: 17,
                        name: "limitEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    lowLimit: {
                        ID: 59,
                        default: 0,
                        name: "lowLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {
                    connectReq: {
                        ID: 1,
                        name: "connectReq",
                        parameters: [],
                    },
                    connectStatusNoti: {
                        ID: 3,
                        name: "connectStatusNoti",
                        parameters: [],
                    },
                    disconnectReq: {
                        ID: 2,
                        name: "disconnectReq",
                        parameters: [],
                    },
                    transferApdu: {
                        ID: 0,
                        name: "transferApdu",
                        parameters: [],
                    },
                },
                commandsResponse: {},
                name: "piAnalogInputExt",
            },
            piAnalogInputReg: {
                ID: 1538,
                attributes: {
                    covIncrement: {
                        ID: 22,
                        name: "covIncrement",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    objectId: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectId",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                    updateInterval: {
                        ID: 118,
                        name: "updateInterval",
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piAnalogInputReg",
            },
            piAnalogOutputExt: {
                ID: 1541,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    deadband: {
                        ID: 25,
                        default: 0,
                        name: "deadband",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        type: 72,
                    },
                    highLimit: {
                        ID: 45,
                        default: 0,
                        name: "highLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    limitEnable: {
                        ID: 52,
                        default: 0,
                        max: 17,
                        name: "limitEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    lowLimit: {
                        ID: 59,
                        default: 0,
                        name: "lowLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piAnalogOutputExt",
            },
            piAnalogOutputReg: {
                ID: 1540,
                attributes: {
                    covIncrement: {
                        ID: 22,
                        default: 0,
                        name: "covIncrement",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    objectId: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectId",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piAnalogOutputReg",
            },
            piAnalogValueExt: {
                ID: 1543,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    deadband: {
                        ID: 25,
                        default: 0,
                        name: "deadband",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    highLimit: {
                        ID: 45,
                        default: 0,
                        name: "highLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    limitEnable: {
                        ID: 52,
                        default: 0,
                        max: 17,
                        name: "limitEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    lowLimit: {
                        ID: 59,
                        default: 0,
                        name: "lowLimit",
                        required: true,
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piAnalogValueExt",
            },
            piAnalogValueReg: {
                ID: 1542,
                attributes: {
                    covIncrement: {
                        ID: 22,
                        default: 0,
                        name: "covIncrement",
                        type: 57,
                        write: true,
                        writeOptional: true,
                    },
                    objectId: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectId",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piAnalogValueReg",
            },
            piBacnetProtocolTunnel: {
                ID: 1537,
                attributes: {},
                commands: {
                    transferNpdu: {
                        ID: 0,
                        name: "transferNpdu",
                        parameters: [
                            {
                                name: "npdu",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "piBacnetProtocolTunnel",
            },
            piBinaryInputExt: {
                ID: 1545,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    alarmValue: {
                        ID: 6,
                        name: "alarmValue",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryInputExt",
            },
            piBinaryInputReg: {
                ID: 1544,
                attributes: {
                    changeOfStateCount: {
                        ID: 15,
                        default: 4294967295,
                        name: "changeOfStateCount",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    changeOfStateTime: {
                        ID: 16,
                        name: "changeOfStateTime",
                        type: 76,
                    },
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    elapsedActiveTime: {
                        ID: 33,
                        default: 4294967295,
                        name: "elapsedActiveTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                    timeOfATReset: {
                        ID: 114,
                        name: "timeOfATReset",
                        type: 76,
                    },
                    timeOfSCReset: {
                        ID: 115,
                        name: "timeOfSCReset",
                        type: 76,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryInputReg",
            },
            piBinaryOutputExt: {
                ID: 1547,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        type: 72,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryOutputExt",
            },
            piBinaryOutputReg: {
                ID: 1546,
                attributes: {
                    changeOfStateCount: {
                        ID: 15,
                        default: 4294967295,
                        name: "changeOfStateCount",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    changeOfStateTime: {
                        ID: 16,
                        name: "changeOfStateTime",
                        type: 76,
                    },
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    elapsedActiveTime: {
                        ID: 33,
                        default: 4294967295,
                        name: "elapsedActiveTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    feedBackValue: {
                        ID: 40,
                        default: 0,
                        max: 1,
                        name: "feedBackValue",
                        type: 48,
                    },
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                    timeOfATReset: {
                        ID: 114,
                        name: "timeOfATReset",
                        type: 76,
                    },
                    timeOfSCReset: {
                        ID: 115,
                        name: "timeOfSCReset",
                        type: 76,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryOutputReg",
            },
            piBinaryValueExt: {
                ID: 1549,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    alarmValue: {
                        ID: 6,
                        name: "alarmValue",
                        required: true,
                        type: 16,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryValueExt",
            },
            piBinaryValueReg: {
                ID: 1548,
                attributes: {
                    changeOfStateCount: {
                        ID: 15,
                        default: 4294967295,
                        name: "changeOfStateCount",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    changeOfStateTime: {
                        ID: 16,
                        name: "changeOfStateTime",
                        type: 76,
                    },
                    elapsedActiveTime: {
                        ID: 33,
                        default: 4294967295,
                        name: "elapsedActiveTime",
                        type: 35,
                        write: true,
                        writeOptional: true,
                    },
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                    timeOfATReset: {
                        ID: 114,
                        name: "timeOfATReset",
                        type: 76,
                    },
                    timeOfSCReset: {
                        ID: 115,
                        name: "timeOfSCReset",
                        type: 76,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piBinaryValueReg",
            },
            piGenericTunnel: {
                ID: 1536,
                attributes: {
                    maxIncomeTransSize: {
                        ID: 1,
                        max: 65535,
                        name: "maxIncomeTransSize",
                        required: true,
                        type: 33,
                    },
                    maxOutgoTransSize: {
                        ID: 2,
                        max: 65535,
                        name: "maxOutgoTransSize",
                        required: true,
                        type: 33,
                    },
                    protocolAddr: {
                        ID: 3,
                        default: "\u0000",
                        maxLen: 255,
                        minLen: 0,
                        name: "protocolAddr",
                        required: true,
                        type: 65,
                    },
                },
                commands: {
                    matchProtocolAddr: {
                        ID: 0,
                        name: "matchProtocolAddr",
                        parameters: [
                            {
                                name: "protocoladdr",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    advertiseProtocolAddr: {
                        ID: 1,
                        name: "advertiseProtocolAddr",
                        parameters: [
                            {
                                name: "protocoladdr",
                                type: 65,
                            },
                        ],
                    },
                    matchProtocolAddrRsp: {
                        ID: 0,
                        name: "matchProtocolAddrRsp",
                        parameters: [
                            {
                                name: "devieeeaddr",
                                type: 240,
                            },
                            {
                                name: "protocoladdr",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                name: "piGenericTunnel",
            },
            piIso7818ProtocolTunnel: {
                ID: 1557,
                attributes: {
                    status: {
                        ID: 0,
                        default: 0,
                        max: 1,
                        name: "status",
                        required: true,
                        type: 32,
                    },
                },
                commands: {
                    extractSmartCard: {
                        ID: 2,
                        name: "extractSmartCard",
                        parameters: [],
                        required: true,
                    },
                    insertSmartCard: {
                        ID: 1,
                        name: "insertSmartCard",
                        parameters: [],
                        required: true,
                    },
                    transferApdu: {
                        ID: 0,
                        name: "transferApdu",
                        parameters: [
                            {
                                name: "apdu",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    transferApdu: {
                        ID: 0,
                        name: "transferApdu",
                        parameters: [
                            {
                                name: "apdu",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                name: "piIso7818ProtocolTunnel",
            },
            piMultistateInputExt: {
                ID: 1551,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    alarmValues: {
                        ID: 6,
                        max: 65535,
                        name: "alarmValues",
                        required: true,
                        type: 80,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    faultValues: {
                        ID: 37,
                        default: 0,
                        max: 65535,
                        name: "faultValues",
                        required: true,
                        type: 80,
                        write: true,
                        writeOptional: true,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateInputExt",
            },
            piMultistateInputReg: {
                ID: 1550,
                attributes: {
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateInputReg",
            },
            piMultistateOutputExt: {
                ID: 1553,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        default: 0,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateOutputExt",
            },
            piMultistateOutputReg: {
                ID: 1552,
                attributes: {
                    deviceType: {
                        ID: 31,
                        default: "\u0000",
                        name: "deviceType",
                        type: 66,
                    },
                    feedBackValue: {
                        ID: 40,
                        max: 1,
                        name: "feedBackValue",
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateOutputReg",
            },
            piMultistateValueExt: {
                ID: 1555,
                attributes: {
                    ackedTransitions: {
                        ID: 0,
                        default: 0,
                        name: "ackedTransitions",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    alarmValues: {
                        ID: 6,
                        max: 65535,
                        name: "alarmValues",
                        required: true,
                        type: 80,
                        write: true,
                        writeOptional: true,
                    },
                    eventEnable: {
                        ID: 35,
                        default: 0,
                        name: "eventEnable",
                        required: true,
                        type: 24,
                        write: true,
                        writeOptional: true,
                    },
                    eventState: {
                        ID: 36,
                        name: "eventState",
                        type: 48,
                    },
                    eventTimeStamps: {
                        ID: 130,
                        name: "eventTimeStamps",
                        required: true,
                        type: 72,
                    },
                    faultValues: {
                        ID: 37,
                        default: 0,
                        max: 65535,
                        name: "faultValues",
                        required: true,
                        type: 80,
                        write: true,
                        writeOptional: true,
                    },
                    notificationClass: {
                        ID: 17,
                        default: 0,
                        max: 65535,
                        name: "notificationClass",
                        required: true,
                        type: 33,
                        write: true,
                        writeOptional: true,
                    },
                    notifyType: {
                        ID: 72,
                        default: 0,
                        name: "notifyType",
                        required: true,
                        type: 48,
                        write: true,
                        writeOptional: true,
                    },
                    timeDelay: {
                        ID: 113,
                        default: 0,
                        name: "timeDelay",
                        required: true,
                        type: 32,
                        write: true,
                        writeOptional: true,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateValueExt",
            },
            piMultistateValueReg: {
                ID: 1554,
                attributes: {
                    objectIdentifier: {
                        ID: 75,
                        max: 4294967295,
                        name: "objectIdentifier",
                        required: true,
                        type: 234,
                    },
                    objectName: {
                        ID: 77,
                        default: "\u0000",
                        name: "objectName",
                        required: true,
                        type: 66,
                    },
                    objectType: {
                        ID: 79,
                        name: "objectType",
                        required: true,
                        type: 49,
                    },
                    profileName: {
                        ID: 168,
                        default: "\u0000",
                        name: "profileName",
                        type: 66,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "piMultistateValueReg",
            },
            piPartition: {
                ID: 22,
                attributes: {
                    interframeDelay: {
                        ID: 6,
                        max: 255,
                        name: "interframeDelay",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    largeFrameSize: {
                        ID: 3,
                        default: 1280,
                        max: 65535,
                        name: "largeFrameSize",
                        required: true,
                        type: 33,
                        write: true,
                    },
                    maximumIncomingTransferSize: {
                        ID: 0,
                        default: 1280,
                        max: 65535,
                        name: "maximumIncomingTransferSize",
                        required: true,
                        type: 33,
                    },
                    maximumOutgoingTransferSize: {
                        ID: 1,
                        default: 1280,
                        max: 65535,
                        name: "maximumOutgoingTransferSize",
                        required: true,
                        type: 33,
                    },
                    nackTimeout: {
                        ID: 5,
                        max: 65535,
                        name: "nackTimeout",
                        required: true,
                        type: 33,
                    },
                    numberOfAckFrame: {
                        ID: 4,
                        default: 100,
                        max: 255,
                        name: "numberOfAckFrame",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    numberOfSendRetries: {
                        ID: 7,
                        default: 3,
                        max: 255,
                        name: "numberOfSendRetries",
                        required: true,
                        type: 32,
                    },
                    partionedFrameSize: {
                        ID: 2,
                        default: 80,
                        max: 255,
                        name: "partionedFrameSize",
                        required: true,
                        type: 32,
                        write: true,
                    },
                    receiverTimeout: {
                        ID: 9,
                        max: 65535,
                        name: "receiverTimeout",
                        required: true,
                        type: 33,
                    },
                    senderTimeout: {
                        ID: 8,
                        max: 65535,
                        name: "senderTimeout",
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    readHandshakeParam: {
                        ID: 1,
                        name: "readHandshakeParam",
                        parameters: [
                            {
                                name: "partitionedClusterId",
                                type: 232,
                            },
                            {
                                name: "attributeIds",
                                type: 1002,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                    transferPartionedFrame: {
                        ID: 0,
                        name: "transferPartionedFrame",
                        parameters: [
                            {
                                name: "fragmentionOptions",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "fragmentationOptions",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "partitionIndicator",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "fragmentationOptions",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "partitionIndicator",
                                type: 33,
                            },
                            {
                                name: "partitionedFrame",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                    writeHandshakeParam: {
                        ID: 2,
                        name: "writeHandshakeParam",
                        parameters: [
                            {
                                name: "partitionedClusterId",
                                type: 232,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    multipleAck: {
                        ID: 0,
                        name: "multipleAck",
                        parameters: [
                            {
                                name: "ackOptions",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fragmentationOptions",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "firstFrameId",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fragmentationOptions",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "firstFrameId",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fragmentationOptions",
                                        reversed: true,
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "nackId",
                                type: 1001,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "fragmentationOptions",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "nackId",
                                type: 1002,
                            },
                        ],
                        required: true,
                    },
                    readHandshakeParamResponse: {
                        ID: 1,
                        name: "readHandshakeParamResponse",
                        parameters: [
                            {
                                name: "partitionedClusterId",
                                type: 232,
                            },
                        ],
                        required: true,
                    },
                },
                name: "piPartition",
            },
            pm25Measurement: {
                ID: 1066,
                attributes: {
                    measuredMaxValue: {
                        ID: 2,
                        max: 1,
                        name: "measuredMaxValue",
                        required: true,
                        type: 57,
                    },
                    measuredMinValue: {
                        ID: 1,
                        min: 0,
                        name: "measuredMinValue",
                        required: true,
                        type: 57,
                    },
                    measuredValue: {
                        ID: 0,
                        name: "measuredValue",
                        report: true,
                        required: true,
                        type: 57,
                    },
                    tolerance: {
                        ID: 3,
                        name: "tolerance",
                        type: 57,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "pm25Measurement",
            },
            powerProfile: {
                ID: 26,
                attributes: {
                    energyFormatting: {
                        ID: 2,
                        default: 1,
                        name: "energyFormatting",
                        required: true,
                        type: 24,
                    },
                    energyRemote: {
                        ID: 3,
                        default: 0,
                        name: "energyRemote",
                        required: true,
                        type: 16,
                    },
                    multipleScheduling: {
                        ID: 1,
                        default: 0,
                        name: "multipleScheduling",
                        required: true,
                        type: 16,
                    },
                    scheduleMode: {
                        ID: 4,
                        default: 0,
                        name: "scheduleMode",
                        report: true,
                        required: true,
                        type: 24,
                        write: true,
                    },
                    totalProfileNum: {
                        ID: 0,
                        default: 1,
                        max: 254,
                        min: 1,
                        name: "totalProfileNum",
                        required: true,
                        type: 32,
                    },
                },
                commands: {
                    energyPhasesScheduleNotification: {
                        ID: 4,
                        name: "energyPhasesScheduleNotification",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numScheduledPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    energyPhasesScheduleResponse: {
                        ID: 5,
                        name: "energyPhasesScheduleResponse",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numScheduledPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    energyPhasesScheduleStateRequest: {
                        ID: 7,
                        name: "energyPhasesScheduleStateRequest",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    getOverallSchedulePriceResponse: {
                        ID: 3,
                        name: "getOverallSchedulePriceResponse",
                        parameters: [
                            {
                                name: "currency",
                                type: 33,
                            },
                            {
                                name: "price",
                                type: 35,
                            },
                            {
                                name: "priceTrailingDigit",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    getPowerProfilePriceExtendedResponse: {
                        ID: 8,
                        name: "getPowerProfilePriceExtendedResponse",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "currency",
                                type: 33,
                            },
                            {
                                name: "price",
                                type: 35,
                            },
                            {
                                name: "priceTrailingDigit",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    getPowerProfilePriceResponse: {
                        ID: 2,
                        name: "getPowerProfilePriceResponse",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "currency",
                                type: 33,
                            },
                            {
                                name: "price",
                                type: 35,
                            },
                            {
                                name: "priceTrailingDigit",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfileRequest: {
                        ID: 0,
                        name: "powerProfileRequest",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfileScheduleConstraintsRequest: {
                        ID: 6,
                        name: "powerProfileScheduleConstraintsRequest",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfileStateRequest: {
                        ID: 1,
                        name: "powerProfileStateRequest",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {
                    energyPhasesScheduleRequest: {
                        ID: 6,
                        name: "energyPhasesScheduleRequest",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    energyPhasesScheduleStateNotification: {
                        ID: 8,
                        name: "energyPhasesScheduleStateNotification",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numScheduledPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    energyPhasesScheduleStateResponse: {
                        ID: 7,
                        name: "energyPhasesScheduleStateResponse",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numScheduledPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    getOverallSchedulePrice: {
                        ID: 5,
                        name: "getOverallSchedulePrice",
                        parameters: [],
                    },
                    getPowerProfilePrice: {
                        ID: 3,
                        name: "getPowerProfilePrice",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                        ],
                    },
                    getPowerProfilePriceExtended: {
                        ID: 11,
                        name: "getPowerProfilePriceExtended",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 2,
                                    },
                                ],
                                name: "powerProfileStartTime",
                                type: 33,
                            },
                        ],
                    },
                    powerProfileNotification: {
                        ID: 0,
                        name: "powerProfileNotification",
                        parameters: [
                            {
                                name: "totalProfileNum",
                                type: 32,
                            },
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numTransferredPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfileResponse: {
                        ID: 1,
                        name: "powerProfileResponse",
                        parameters: [
                            {
                                name: "totalProfileNum",
                                type: 32,
                            },
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "numTransferredPhases",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfileScheduleConstraintsNotification: {
                        ID: 9,
                        name: "powerProfileScheduleConstraintsNotification",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "startAfter",
                                type: 33,
                            },
                            {
                                name: "stopBefore",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    powerProfileScheduleConstraintsResponse: {
                        ID: 10,
                        name: "powerProfileScheduleConstraintsResponse",
                        parameters: [
                            {
                                name: "powerProfileId",
                                type: 32,
                            },
                            {
                                name: "startAfter",
                                type: 33,
                            },
                            {
                                name: "stopBefore",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    powerProfileStateResponse: {
                        ID: 2,
                        name: "powerProfileStateResponse",
                        parameters: [
                            {
                                name: "powerProfileCount",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    powerProfilesStateNotification: {
                        ID: 4,
                        name: "powerProfilesStateNotification",
                        parameters: [
                            {
                                name: "powerProfileCount",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                },
                name: "powerProfile",
            },
            pulseWidthModulation: {
                ID: 28,
                attributes: {
                    currentFrequency: {
                        ID: 4,
                        default: 0,
                        name: "currentFrequency",
                        report: true,
                        required: true,
                        type: 33,
                    },
                    currentLevel: {
                        ID: 0,
                        default: 255,
                        name: "currentLevel",
                        report: true,
                        required: true,
                        scene: true,
                        type: 32,
                    },
                    defaultMoveRate: {
                        ID: 20,
                        max: 254,
                        name: "defaultMoveRate",
                        type: 32,
                        write: true,
                    },
                    maxFrequency: {
                        ID: 6,
                        default: 0,
                        max: 65535,
                        name: "maxFrequency",
                        required: true,
                        type: 33,
                    },
                    maxLevel: {
                        ID: 3,
                        default: 100,
                        max: 100,
                        name: "maxLevel",
                        required: true,
                        type: 32,
                    },
                    minFrequency: {
                        ID: 5,
                        default: 0,
                        name: "minFrequency",
                        required: true,
                        type: 33,
                    },
                    minLevel: {
                        ID: 2,
                        default: 0,
                        name: "minLevel",
                        required: true,
                        type: 32,
                    },
                    offTransitionTime: {
                        ID: 19,
                        default: 65535,
                        max: 65534,
                        name: "offTransitionTime",
                        type: 33,
                        write: true,
                    },
                    onLevel: {
                        ID: 17,
                        default: 255,
                        name: "onLevel",
                        type: 32,
                        write: true,
                    },
                    onOffTransitionTime: {
                        ID: 16,
                        default: 0,
                        max: 65535,
                        name: "onOffTransitionTime",
                        type: 33,
                        write: true,
                    },
                    onTransitionTime: {
                        ID: 18,
                        default: 65535,
                        max: 65534,
                        name: "onTransitionTime",
                        type: 33,
                        write: true,
                    },
                    options: {
                        ID: 15,
                        default: 0,
                        name: "options",
                        type: 24,
                        write: true,
                    },
                    remainingTime: {
                        ID: 1,
                        default: 0,
                        max: 65535,
                        name: "remainingTime",
                        type: 33,
                    },
                    startUpCurrentLevel: {
                        ID: 16384,
                        max: 255,
                        name: "startUpCurrentLevel",
                        special: {
                            0: "MinimumDeviceValuePermitted",
                            255: "SetToPreviousValue",
                        },
                        type: 32,
                        write: true,
                    },
                },
                commands: {
                    move: {
                        ID: 1,
                        name: "move",
                        parameters: [
                            {
                                name: "movemode",
                                type: 32,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveToClosestFrequency: {
                        ID: 8,
                        name: "moveToClosestFrequency",
                        parameters: [
                            {
                                name: "frequency",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    moveToLevel: {
                        ID: 0,
                        name: "moveToLevel",
                        parameters: [
                            {
                                name: "level",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveToLevelWithOnOff: {
                        ID: 4,
                        name: "moveToLevelWithOnOff",
                        parameters: [
                            {
                                name: "level",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    moveWithOnOff: {
                        ID: 5,
                        name: "moveWithOnOff",
                        parameters: [
                            {
                                name: "movemode",
                                type: 32,
                            },
                            {
                                name: "rate",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    step: {
                        ID: 2,
                        name: "step",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 32,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stepWithOnOff: {
                        ID: 6,
                        name: "stepWithOnOff",
                        parameters: [
                            {
                                name: "stepmode",
                                type: 32,
                            },
                            {
                                name: "stepsize",
                                type: 32,
                            },
                            {
                                name: "transtime",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stop: {
                        ID: 3,
                        name: "stop",
                        parameters: [
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    stopWithOnOff: {
                        ID: 7,
                        name: "stopWithOnOff",
                        parameters: [
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsMask",
                                type: 24,
                            },
                            {
                                conditions: [
                                    {
                                        type: "minimumRemainingBufferBytes",
                                        value: 1,
                                    },
                                ],
                                name: "optionsOverride",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "pulseWidthModulation",
            },
            retailTunnel: {
                ID: 1559,
                attributes: {
                    manufacturerCode: {
                        ID: 0,
                        max: 4351,
                        min: 4096,
                        name: "manufacturerCode",
                        required: true,
                        type: 33,
                    },
                    msProfile: {
                        ID: 1,
                        max: 65535,
                        min: 49152,
                        name: "msProfile",
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    transferApdu: {
                        ID: 0,
                        name: "transferApdu",
                        parameters: [
                            {
                                name: "apdu",
                                type: 65,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "retailTunnel",
            },
            seMeterIdentification: {
                ID: 2817,
                attributes: {
                    availablePower: {
                        ID: 13,
                        max: 16777215,
                        name: "availablePower",
                        required: true,
                        type: 42,
                    },
                    companyName: {
                        ID: 0,
                        maxLen: 16,
                        minLen: 0,
                        name: "companyName",
                        required: true,
                        type: 66,
                    },
                    customerName: {
                        ID: 5,
                        maxLen: 16,
                        minLen: 0,
                        name: "customerName",
                        type: 66,
                        write: true,
                    },
                    dataQualityId: {
                        ID: 4,
                        max: 65535,
                        name: "dataQualityId",
                        required: true,
                        type: 33,
                    },
                    meterTypeId: {
                        ID: 1,
                        max: 65535,
                        name: "meterTypeId",
                        required: true,
                        type: 33,
                    },
                    model: {
                        ID: 6,
                        maxLen: 16,
                        minLen: 0,
                        name: "model",
                        type: 65,
                    },
                    partNumber: {
                        ID: 7,
                        maxLen: 16,
                        minLen: 0,
                        name: "partNumber",
                        type: 65,
                    },
                    pod: {
                        ID: 12,
                        maxLen: 16,
                        minLen: 0,
                        name: "pod",
                        required: true,
                        type: 66,
                    },
                    powerThreshold: {
                        ID: 14,
                        max: 16777215,
                        name: "powerThreshold",
                        required: true,
                        type: 42,
                    },
                    productRevision: {
                        ID: 8,
                        maxLen: 6,
                        minLen: 0,
                        name: "productRevision",
                        type: 65,
                    },
                    softwareRevision: {
                        ID: 10,
                        maxLen: 6,
                        minLen: 0,
                        name: "softwareRevision",
                        type: 65,
                    },
                    utilityName: {
                        ID: 11,
                        maxLen: 16,
                        minLen: 0,
                        name: "utilityName",
                        type: 66,
                    },
                },
                commands: {},
                commandsResponse: {},
                name: "seMeterIdentification",
            },
            seMetering: {
                ID: 1794,
                attributes: {
                    DFTSummationReceived: {
                        ID: 31,
                        max: 281474976710655,
                        name: "DFTSummationReceived",
                        type: 37,
                    },
                    activeRegisterTierDelivered: {
                        ID: 32,
                        max: 48,
                        name: "activeRegisterTierDelivered",
                        type: 48,
                    },
                    activeRegisterTierReceived: {
                        ID: 33,
                        max: 48,
                        name: "activeRegisterTierReceived",
                        type: 48,
                    },
                    alternativeConsumptionFormatting: {
                        ID: 786,
                        max: 255,
                        name: "alternativeConsumptionFormatting",
                        type: 24,
                    },
                    alternativeDemandFormatting: {
                        ID: 786,
                        max: 255,
                        name: "alternativeDemandFormatting",
                        type: 24,
                    },
                    alternativeUnitOfMeasure: {
                        ID: 786,
                        default: 0,
                        name: "alternativeUnitOfMeasure",
                        type: 48,
                    },
                    ambientConsumptionIndicator: {
                        ID: 519,
                        max: 2,
                        name: "ambientConsumptionIndicator",
                        type: 48,
                    },
                    billDeliveredTrailingDigit: {
                        ID: 2564,
                        name: "billDeliveredTrailingDigit",
                        type: 24,
                    },
                    billReceivedTrailingDigit: {
                        ID: 2580,
                        name: "billReceivedTrailingDigit",
                        type: 24,
                    },
                    billToDateDelivered: {
                        ID: 2560,
                        default: 0,
                        max: 4294967295,
                        name: "billToDateDelivered",
                        type: 35,
                    },
                    billToDateReceived: {
                        ID: 2576,
                        default: 0,
                        max: 4294967295,
                        name: "billToDateReceived",
                        type: 35,
                    },
                    billToDateTimeStampDelivered: {
                        ID: 2561,
                        default: 0,
                        name: "billToDateTimeStampDelivered",
                        type: 226,
                    },
                    billToDateTimeStampReceived: {
                        ID: 2577,
                        default: 0,
                        name: "billToDateTimeStampReceived",
                        type: 226,
                    },
                    controlTempreature: {
                        ID: 25,
                        max: 8388607,
                        min: -8388607,
                        name: "controlTempreature",
                        type: 42,
                    },
                    cpp1SummationDelivered: {
                        ID: 508,
                        max: 281474976710655,
                        name: "cpp1SummationDelivered",
                        type: 37,
                    },
                    cpp2SummationDelivered: {
                        ID: 510,
                        max: 281474976710655,
                        name: "cpp2SummationDelivered",
                        type: 37,
                    },
                    curMonthMaxEnergyCarrDemand: {
                        ID: 1043,
                        max: 8388607,
                        min: -8388607,
                        name: "curMonthMaxEnergyCarrDemand",
                        type: 42,
                    },
                    curMonthMinEnergyCarrDemand: {
                        ID: 1044,
                        max: 8388607,
                        min: -8388607,
                        name: "curMonthMinEnergyCarrDemand",
                        type: 42,
                    },
                    curPartProfileIntStartTimeDelivered: {
                        ID: 1029,
                        name: "curPartProfileIntStartTimeDelivered",
                        type: 226,
                    },
                    curPartProfileIntStartTimeReceived: {
                        ID: 1030,
                        name: "curPartProfileIntStartTimeReceived",
                        type: 226,
                    },
                    curPartProfileIntValueDelivered: {
                        ID: 1031,
                        max: 16777215,
                        name: "curPartProfileIntValueDelivered",
                        type: 34,
                    },
                    curPartProfileIntValueReceived: {
                        ID: 1032,
                        max: 16777215,
                        name: "curPartProfileIntValueReceived",
                        type: 34,
                    },
                    curYearMaxEnergyCarrDemand: {
                        ID: 1045,
                        max: 8388607,
                        min: -8388607,
                        name: "curYearMaxEnergyCarrDemand",
                        type: 42,
                    },
                    curYearMinEnergyCarrDemand: {
                        ID: 1046,
                        max: 8388607,
                        min: -8388607,
                        name: "curYearMinEnergyCarrDemand",
                        type: 42,
                    },
                    currentBlock: {
                        ID: 14,
                        max: 16,
                        name: "currentBlock",
                        type: 48,
                    },
                    currentBlockPeriodConsumpDelivered: {
                        ID: 12,
                        max: 281474976710655,
                        name: "currentBlockPeriodConsumpDelivered",
                        type: 37,
                    },
                    currentBlockPeriodConsumpReceived: {
                        ID: 29,
                        max: 281474976710655,
                        name: "currentBlockPeriodConsumpReceived",
                        type: 37,
                    },
                    currentBlockReceived: {
                        ID: 30,
                        max: 255,
                        name: "currentBlockReceived",
                        type: 48,
                    },
                    currentDayConsumpDelivered: {
                        ID: 1025,
                        max: 16777215,
                        name: "currentDayConsumpDelivered",
                        type: 34,
                    },
                    currentDayConsumpReceived: {
                        ID: 1026,
                        max: 16777215,
                        name: "currentDayConsumpReceived",
                        type: 34,
                    },
                    currentDayMaxDemand: {
                        ID: 1037,
                        max: 8388607,
                        min: -8388607,
                        name: "currentDayMaxDemand",
                        type: 42,
                    },
                    currentDayMaxEnergyCarrDemand: {
                        ID: 1041,
                        max: 8388607,
                        min: -8388607,
                        name: "currentDayMaxEnergyCarrDemand",
                        type: 42,
                    },
                    currentDayMaxPressure: {
                        ID: 1033,
                        max: 281474976710655,
                        name: "currentDayMaxPressure",
                        type: 37,
                    },
                    currentDayMinPressure: {
                        ID: 1034,
                        max: 281474976710655,
                        name: "currentDayMinPressure",
                        type: 37,
                    },
                    currentDemandDelivered: {
                        ID: 1536,
                        max: 16777215,
                        name: "currentDemandDelivered",
                        type: 34,
                    },
                    currentInEnergyCarrierDemand: {
                        ID: 26,
                        max: 8388607,
                        min: -8388607,
                        name: "currentInEnergyCarrierDemand",
                        type: 42,
                    },
                    currentInEnergyCarrierSumm: {
                        ID: 21,
                        max: 281474976710655,
                        name: "currentInEnergyCarrierSumm",
                        type: 37,
                    },
                    currentMaxDemandDeliverdTime: {
                        ID: 8,
                        name: "currentMaxDemandDeliverdTime",
                        type: 226,
                    },
                    currentMaxDemandDelivered: {
                        ID: 2,
                        max: 281474976710655,
                        name: "currentMaxDemandDelivered",
                        type: 37,
                    },
                    currentMaxDemandReceived: {
                        ID: 3,
                        max: 281474976710655,
                        name: "currentMaxDemandReceived",
                        type: 37,
                    },
                    currentMaxDemandReceivedTime: {
                        ID: 9,
                        name: "currentMaxDemandReceivedTime",
                        type: 226,
                    },
                    currentMeterId: {
                        ID: 518,
                        name: "currentMeterId",
                        type: 65,
                    },
                    currentMonthConsumptionDelivered: {
                        ID: 1088,
                        max: 4294967295,
                        name: "currentMonthConsumptionDelivered",
                        type: 35,
                    },
                    currentMonthConsumptionReceived: {
                        ID: 1089,
                        max: 4294967295,
                        name: "currentMonthConsumptionReceived",
                        type: 35,
                    },
                    currentMonthMaxDemand: {
                        ID: 1039,
                        max: 8388607,
                        min: -8388607,
                        name: "currentMonthMaxDemand",
                        type: 42,
                    },
                    currentOutEnergyCarrierDemand: {
                        ID: 27,
                        max: 8388607,
                        min: -8388607,
                        name: "currentOutEnergyCarrierDemand",
                        type: 42,
                    },
                    currentOutEnergyCarrierSumm: {
                        ID: 22,
                        max: 281474976710655,
                        name: "currentOutEnergyCarrierSumm",
                        type: 37,
                    },
                    currentSummDelivered: {
                        ID: 0,
                        max: 281474976710655,
                        name: "currentSummDelivered",
                        required: true,
                        type: 37,
                    },
                    currentSummReceived: {
                        ID: 1,
                        max: 281474976710655,
                        name: "currentSummReceived",
                        type: 37,
                    },
                    currentTier10SummDelivered: {
                        ID: 274,
                        max: 281474976710655,
                        name: "currentTier10SummDelivered",
                        type: 37,
                    },
                    currentTier10SummReceived: {
                        ID: 275,
                        max: 281474976710655,
                        name: "currentTier10SummReceived",
                        type: 37,
                    },
                    currentTier11SummDelivered: {
                        ID: 276,
                        max: 281474976710655,
                        name: "currentTier11SummDelivered",
                        type: 37,
                    },
                    currentTier11SummReceived: {
                        ID: 277,
                        max: 281474976710655,
                        name: "currentTier11SummReceived",
                        type: 37,
                    },
                    currentTier12SummDelivered: {
                        ID: 278,
                        max: 281474976710655,
                        name: "currentTier12SummDelivered",
                        type: 37,
                    },
                    currentTier12SummReceived: {
                        ID: 279,
                        max: 281474976710655,
                        name: "currentTier12SummReceived",
                        type: 37,
                    },
                    currentTier13SummDelivered: {
                        ID: 280,
                        max: 281474976710655,
                        name: "currentTier13SummDelivered",
                        type: 37,
                    },
                    currentTier13SummReceived: {
                        ID: 281,
                        max: 281474976710655,
                        name: "currentTier13SummReceived",
                        type: 37,
                    },
                    currentTier14SummDelivered: {
                        ID: 282,
                        max: 281474976710655,
                        name: "currentTier14SummDelivered",
                        type: 37,
                    },
                    currentTier14SummReceived: {
                        ID: 283,
                        max: 281474976710655,
                        name: "currentTier14SummReceived",
                        type: 37,
                    },
                    currentTier15SummDelivered: {
                        ID: 284,
                        max: 281474976710655,
                        name: "currentTier15SummDelivered",
                        type: 37,
                    },
                    currentTier15SummReceived: {
                        ID: 285,
                        max: 281474976710655,
                        name: "currentTier15SummReceived",
                        type: 37,
                    },
                    currentTier1SummDelivered: {
                        ID: 256,
                        max: 281474976710655,
                        name: "currentTier1SummDelivered",
                        type: 37,
                    },
                    currentTier1SummReceived: {
                        ID: 257,
                        max: 281474976710655,
                        name: "currentTier1SummReceived",
                        type: 37,
                    },
                    currentTier2SummDelivered: {
                        ID: 258,
                        max: 281474976710655,
                        name: "currentTier2SummDelivered",
                        type: 37,
                    },
                    currentTier2SummReceived: {
                        ID: 259,
                        max: 281474976710655,
                        name: "currentTier2SummReceived",
                        type: 37,
                    },
                    currentTier3SummDelivered: {
                        ID: 260,
                        max: 281474976710655,
                        name: "currentTier3SummDelivered",
                        type: 37,
                    },
                    currentTier3SummReceived: {
                        ID: 261,
                        max: 281474976710655,
                        name: "currentTier3SummReceived",
                        type: 37,
                    },
                    currentTier4SummDelivered: {
                        ID: 262,
                        max: 281474976710655,
                        name: "currentTier4SummDelivered",
                        type: 37,
                    },
                    currentTier4SummReceived: {
                        ID: 263,
                        max: 281474976710655,
                        name: "currentTier4SummReceived",
                        type: 37,
                    },
                    currentTier5SummDelivered: {
                        ID: 264,
                        max: 281474976710655,
                        name: "currentTier5SummDelivered",
                        type: 37,
                    },
                    currentTier5SummReceived: {
                        ID: 265,
                        max: 281474976710655,
                        name: "currentTier5SummReceived",
                        type: 37,
                    },
                    currentTier6SummDelivered: {
                        ID: 266,
                        max: 281474976710655,
                        name: "currentTier6SummDelivered",
                        type: 37,
                    },
                    currentTier6SummReceived: {
                        ID: 267,
                        max: 281474976710655,
                        name: "currentTier6SummReceived",
                        type: 37,
                    },
                    currentTier7SummDelivered: {
                        ID: 268,
                        max: 281474976710655,
                        name: "currentTier7SummDelivered",
                        type: 37,
                    },
                    currentTier7SummReceived: {
                        ID: 269,
                        max: 281474976710655,
                        name: "currentTier7SummReceived",
                        type: 37,
                    },
                    currentTier8SummDelivered: {
                        ID: 270,
                        max: 281474976710655,
                        name: "currentTier8SummDelivered",
                        type: 37,
                    },
                    currentTier8SummReceived: {
                        ID: 271,
                        max: 281474976710655,
                        name: "currentTier8SummReceived",
                        type: 37,
                    },
                    currentTier9SummDelivered: {
                        ID: 272,
                        max: 281474976710655,
                        name: "currentTier9SummDelivered",
                        type: 37,
                    },
                    currentTier9SummReceived: {
                        ID: 273,
                        max: 281474976710655,
                        name: "currentTier9SummReceived",
                        type: 37,
                    },
                    currentWeekConsumptionDelivered: {
                        ID: 1072,
                        max: 16777215,
                        name: "currentWeekConsumptionDelivered",
                        type: 34,
                    },
                    currentWeekConsumptionReceived: {
                        ID: 1073,
                        max: 16777215,
                        name: "currentWeekConsumptionReceived",
                        type: 34,
                    },
                    currentYearMaxDemand: {
                        ID: 1040,
                        max: 8388607,
                        min: -8388607,
                        name: "currentYearMaxDemand",
                        type: 42,
                    },
                    customIdNumber: {
                        ID: 785,
                        maxLen: 25,
                        minLen: 1,
                        name: "customIdNumber",
                        type: 65,
                    },
                    dailyConsumpTarget: {
                        ID: 13,
                        max: 16777215,
                        name: "dailyConsumpTarget",
                        type: 34,
                    },
                    dailyFreezeTime: {
                        ID: 5,
                        default: 0,
                        max: 5947,
                        name: "dailyFreezeTime",
                        type: 33,
                    },
                    defaultUpdatePeriod: {
                        ID: 10,
                        default: 30,
                        max: 255,
                        name: "defaultUpdatePeriod",
                        type: 32,
                    },
                    demandFormatting: {
                        ID: 772,
                        max: 255,
                        name: "demandFormatting",
                        type: 24,
                    },
                    demandIntegrationPeriod: {
                        ID: 1538,
                        max: 255,
                        min: 1,
                        name: "demandIntegrationPeriod",
                        type: 32,
                    },
                    demandLimit: {
                        ID: 1537,
                        max: 16777215,
                        name: "demandLimit",
                        type: 34,
                    },
                    demandLimitArmDuration: {
                        ID: 1540,
                        default: 60,
                        max: 65535,
                        name: "demandLimitArmDuration",
                        type: 33,
                    },
                    dftSumm: {
                        ID: 4,
                        max: 281474976710655,
                        name: "dftSumm",
                        type: 37,
                    },
                    divisor: {
                        ID: 770,
                        max: 16777215,
                        name: "divisor",
                        type: 34,
                    },
                    electricityAlarmMask: {
                        ID: 2049,
                        default: 4294967295,
                        max: 4294967295,
                        name: "electricityAlarmMask",
                        type: 27,
                    },
                    energyCarrierDemandFormatting: {
                        ID: 779,
                        max: 255,
                        name: "energyCarrierDemandFormatting",
                        type: 24,
                    },
                    energyCarrierSummFormatting: {
                        ID: 778,
                        max: 255,
                        name: "energyCarrierSummFormatting",
                        type: 24,
                    },
                    energyCarrierUnitOfMeas: {
                        ID: 777,
                        max: 255,
                        name: "energyCarrierUnitOfMeas",
                        type: 48,
                    },
                    extendedGenericAlarmMask: {
                        ID: 2054,
                        default: 281474976710655,
                        max: 281474976710655,
                        name: "extendedGenericAlarmMask",
                        type: 29,
                    },
                    extendedStatus: {
                        ID: 516,
                        name: "extendedStatus",
                        type: 31,
                    },
                    fastPollUpdatePeriod: {
                        ID: 11,
                        default: 5,
                        max: 255,
                        name: "fastPollUpdatePeriod",
                        type: 32,
                    },
                    flowRestriction: {
                        ID: 19,
                        max: 255,
                        name: "flowRestriction",
                        type: 32,
                    },
                    gasSpecificAlarmMask: {
                        ID: 2053,
                        default: 65535,
                        max: 65535,
                        name: "gasSpecificAlarmMask",
                        type: 25,
                    },
                    genFlowPressureAlarmMask: {
                        ID: 2050,
                        default: 65535,
                        max: 65535,
                        name: "genFlowPressureAlarmMask",
                        type: 25,
                    },
                    genericAlarmMask: {
                        ID: 2048,
                        default: 65535,
                        max: 65535,
                        name: "genericAlarmMask",
                        type: 25,
                    },
                    heatCoolSpecificAlarmMASK: {
                        ID: 2052,
                        default: 65535,
                        max: 65535,
                        name: "heatCoolSpecificAlarmMASK",
                        type: 25,
                    },
                    historicalConsumpFormatting: {
                        ID: 773,
                        max: 255,
                        name: "historicalConsumpFormatting",
                        type: 24,
                    },
                    historicalFreezeTime: {
                        ID: 1116,
                        default: 0,
                        max: 5947,
                        name: "historicalFreezeTime",
                        type: 33,
                    },
                    hoursInFault: {
                        ID: 515,
                        max: 16777215,
                        name: "hoursInFault",
                        type: 34,
                    },
                    hoursInOperation: {
                        ID: 514,
                        max: 16777215,
                        name: "hoursInOperation",
                        type: 34,
                    },
                    inletTempreature: {
                        ID: 23,
                        max: 8388607,
                        min: -8388607,
                        name: "inletTempreature",
                        type: 42,
                    },
                    instantaneousDemand: {
                        ID: 1024,
                        default: 0,
                        max: 8388607,
                        min: -8388607,
                        name: "instantaneousDemand",
                        type: 42,
                    },
                    lastBlockSwitchTime: {
                        ID: 34,
                        name: "lastBlockSwitchTime",
                        type: 226,
                    },
                    loadLimitCounter: {
                        ID: 1542,
                        default: 1,
                        max: 255,
                        name: "loadLimitCounter",
                        type: 32,
                    },
                    loadLimitSupplyState: {
                        ID: 1541,
                        default: 0,
                        max: 255,
                        name: "loadLimitSupplyState",
                        type: 48,
                    },
                    manufactureAlarmMask: {
                        ID: 2055,
                        default: 65535,
                        max: 65535,
                        name: "manufactureAlarmMask",
                        type: 25,
                    },
                    maxNumberOfPeriodsDelivered: {
                        ID: 1280,
                        default: 24,
                        max: 255,
                        name: "maxNumberOfPeriodsDelivered",
                        type: 32,
                    },
                    meterSerialNumber: {
                        ID: 776,
                        maxLen: 25,
                        minLen: 1,
                        name: "meterSerialNumber",
                        type: 65,
                    },
                    meteringDeviceType: {
                        ID: 774,
                        max: 255,
                        name: "meteringDeviceType",
                        type: 24,
                    },
                    moduleSerialNumber: {
                        ID: 782,
                        maxLen: 25,
                        minLen: 1,
                        name: "moduleSerialNumber",
                        type: 65,
                    },
                    multiplier: {
                        ID: 769,
                        max: 16777215,
                        name: "multiplier",
                        type: 34,
                    },
                    numberOfDemandSubintervals: {
                        ID: 1539,
                        max: 255,
                        min: 1,
                        name: "numberOfDemandSubintervals",
                        type: 32,
                    },
                    operatingTariffLevelDelivered: {
                        ID: 783,
                        maxLen: 25,
                        minLen: 1,
                        name: "operatingTariffLevelDelivered",
                        type: 65,
                    },
                    operatingTariffLevelReceived: {
                        ID: 784,
                        maxLen: 25,
                        minLen: 1,
                        name: "operatingTariffLevelReceived",
                        type: 65,
                    },
                    outletTempreature: {
                        ID: 24,
                        max: 8388607,
                        min: -8388607,
                        name: "outletTempreature",
                        type: 42,
                    },
                    powerFactor: {
                        ID: 6,
                        default: 0,
                        max: 100,
                        min: -100,
                        name: "powerFactor",
                        type: 40,
                    },
                    presetReadingTime: {
                        ID: 17,
                        default: 0,
                        max: 5947,
                        name: "presetReadingTime",
                        type: 33,
                    },
                    previousBlockPeriodConsumpReceived: {
                        ID: 28,
                        max: 281474976710655,
                        name: "previousBlockPeriodConsumpReceived",
                        type: 37,
                    },
                    previousDay2ConsumptionDelivered: {
                        ID: 1056,
                        max: 16777215,
                        name: "previousDay2ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay2ConsumptionReceived: {
                        ID: 1057,
                        max: 16777215,
                        name: "previousDay2ConsumptionReceived",
                        type: 34,
                    },
                    previousDay3ConsumptionDelivered: {
                        ID: 1058,
                        max: 16777215,
                        name: "previousDay3ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay3ConsumptionReceived: {
                        ID: 1059,
                        max: 16777215,
                        name: "previousDay3ConsumptionReceived",
                        type: 34,
                    },
                    previousDay4ConsumptionDelivered: {
                        ID: 1060,
                        max: 16777215,
                        name: "previousDay4ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay4ConsumptionReceived: {
                        ID: 1061,
                        max: 16777215,
                        name: "previousDay4ConsumptionReceived",
                        type: 34,
                    },
                    previousDay5ConsumptionDelivered: {
                        ID: 1062,
                        max: 16777215,
                        name: "previousDay5ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay5ConsumptionReceived: {
                        ID: 1063,
                        max: 16777215,
                        name: "previousDay5ConsumptionReceived",
                        type: 34,
                    },
                    previousDay6ConsumptionDelivered: {
                        ID: 1064,
                        max: 16777215,
                        name: "previousDay6ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay6ConsumptionReceived: {
                        ID: 1056,
                        max: 16777215,
                        name: "previousDay6ConsumptionReceived",
                        type: 34,
                    },
                    previousDay7ConsumptionDelivered: {
                        ID: 1066,
                        max: 16777215,
                        name: "previousDay7ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay7ConsumptionReceived: {
                        ID: 1067,
                        max: 16777215,
                        name: "previousDay7ConsumptionReceived",
                        type: 34,
                    },
                    previousDay8ConsumptionDelivered: {
                        ID: 1068,
                        max: 16777215,
                        name: "previousDay8ConsumptionDelivered",
                        type: 34,
                    },
                    previousDay8ConsumptionReceived: {
                        ID: 1069,
                        max: 16777215,
                        name: "previousDay8ConsumptionReceived",
                        type: 34,
                    },
                    previousDayConsumpDelivered: {
                        ID: 1027,
                        max: 16777215,
                        name: "previousDayConsumpDelivered",
                        type: 34,
                    },
                    previousDayConsumpReceived: {
                        ID: 1028,
                        max: 16777215,
                        name: "previousDayConsumpReceived",
                        type: 34,
                    },
                    previousDayMaxDemand: {
                        ID: 1038,
                        max: 8388607,
                        min: -8388607,
                        name: "previousDayMaxDemand",
                        type: 42,
                    },
                    previousDayMaxEnergyCarrDemand: {
                        ID: 1042,
                        max: 8388607,
                        min: -8388607,
                        name: "previousDayMaxEnergyCarrDemand",
                        type: 42,
                    },
                    previousDayMaxPressure: {
                        ID: 1035,
                        max: 281474976710655,
                        name: "previousDayMaxPressure",
                        type: 37,
                    },
                    previousDayMinPressure: {
                        ID: 1036,
                        max: 281474976710655,
                        name: "previousDayMinPressure",
                        type: 37,
                    },
                    previousMonth10ConsumptionDelivered: {
                        ID: 1108,
                        max: 4294967295,
                        name: "previousMonth10ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth10ConsumptionReceived: {
                        ID: 1109,
                        max: 4294967295,
                        name: "previousMonth10ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth11ConsumptionDelivered: {
                        ID: 1110,
                        max: 4294967295,
                        name: "previousMonth11ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth11ConsumptionReceived: {
                        ID: 1111,
                        max: 4294967295,
                        name: "previousMonth11ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth12ConsumptionDelivered: {
                        ID: 1112,
                        max: 4294967295,
                        name: "previousMonth12ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth12ConsumptionReceived: {
                        ID: 1113,
                        max: 4294967295,
                        name: "previousMonth12ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth13ConsumptionDelivered: {
                        ID: 1114,
                        max: 4294967295,
                        name: "previousMonth13ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth13ConsumptionReceived: {
                        ID: 1115,
                        max: 4294967295,
                        name: "previousMonth13ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth2ConsumptionDelivered: {
                        ID: 1092,
                        max: 4294967295,
                        name: "previousMonth2ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth2ConsumptionReceived: {
                        ID: 1093,
                        max: 4294967295,
                        name: "previousMonth2ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth3ConsumptionDelivered: {
                        ID: 1094,
                        max: 4294967295,
                        name: "previousMonth3ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth3ConsumptionReceived: {
                        ID: 1095,
                        max: 4294967295,
                        name: "previousMonth3ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth4ConsumptionDelivered: {
                        ID: 1096,
                        max: 4294967295,
                        name: "previousMonth4ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth4ConsumptionReceived: {
                        ID: 1097,
                        max: 4294967295,
                        name: "previousMonth4ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth5ConsumptionDelivered: {
                        ID: 1098,
                        max: 4294967295,
                        name: "previousMonth5ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth5ConsumptionReceived: {
                        ID: 1099,
                        max: 4294967295,
                        name: "previousMonth5ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth6ConsumptionDelivered: {
                        ID: 1100,
                        max: 4294967295,
                        name: "previousMonth6ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth6ConsumptionReceived: {
                        ID: 1101,
                        max: 4294967295,
                        name: "previousMonth6ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth7ConsumptionDelivered: {
                        ID: 1102,
                        max: 4294967295,
                        name: "previousMonth7ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth7ConsumptionReceived: {
                        ID: 1103,
                        max: 4294967295,
                        name: "previousMonth7ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth8ConsumptionDelivered: {
                        ID: 1104,
                        max: 4294967295,
                        name: "previousMonth8ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth8ConsumptionReceived: {
                        ID: 1105,
                        max: 4294967295,
                        name: "previousMonth8ConsumptionReceived",
                        type: 35,
                    },
                    previousMonth9ConsumptionDelivered: {
                        ID: 1106,
                        max: 4294967295,
                        name: "previousMonth9ConsumptionDelivered",
                        type: 35,
                    },
                    previousMonth9ConsumptionReceived: {
                        ID: 1107,
                        max: 4294967295,
                        name: "previousMonth9ConsumptionReceived",
                        type: 35,
                    },
                    previousMonthConsumptionDelivered: {
                        ID: 1090,
                        max: 4294967295,
                        name: "previousMonthConsumptionDelivered",
                        type: 35,
                    },
                    previousMonthConsumptionReceived: {
                        ID: 1091,
                        max: 4294967295,
                        name: "previousMonthConsumptionReceived",
                        type: 35,
                    },
                    previousWeek2ConsumptionDelivered: {
                        ID: 1076,
                        max: 16777215,
                        name: "previousWeek2ConsumptionDelivered",
                        type: 34,
                    },
                    previousWeek2ConsumptionReceived: {
                        ID: 1077,
                        max: 16777215,
                        name: "previousWeek2ConsumptionReceived",
                        type: 34,
                    },
                    previousWeek3ConsumptionDelivered: {
                        ID: 1078,
                        max: 16777215,
                        name: "previousWeek3ConsumptionDelivered",
                        type: 34,
                    },
                    previousWeek3ConsumptionReceived: {
                        ID: 1079,
                        max: 16777215,
                        name: "previousWeek3ConsumptionReceived",
                        type: 34,
                    },
                    previousWeek4ConsumptionDelivered: {
                        ID: 1080,
                        max: 16777215,
                        name: "previousWeek4ConsumptionDelivered",
                        type: 34,
                    },
                    previousWeek4ConsumptionReceived: {
                        ID: 1081,
                        max: 16777215,
                        name: "previousWeek4ConsumptionReceived",
                        type: 34,
                    },
                    previousWeek5ConsumptionDelivered: {
                        ID: 1082,
                        max: 16777215,
                        name: "previousWeek5ConsumptionDelivered",
                        type: 34,
                    },
                    previousWeek5ConsumptionReceived: {
                        ID: 1083,
                        max: 16777215,
                        name: "previousWeek5ConsumptionReceived",
                        type: 34,
                    },
                    previousWeekConsumptionDelivered: {
                        ID: 1074,
                        max: 16777215,
                        name: "previousWeekConsumptionDelivered",
                        type: 34,
                    },
                    previousWeekConsumptionReceived: {
                        ID: 1075,
                        max: 16777215,
                        name: "previousWeekConsumptionReceived",
                        type: 34,
                    },
                    profileIntervalPeriod: {
                        ID: 15,
                        max: 255,
                        name: "profileIntervalPeriod",
                        type: 48,
                    },
                    projectedBillDelivered: {
                        ID: 2562,
                        default: 0,
                        max: 4294967295,
                        name: "projectedBillDelivered",
                        type: 35,
                    },
                    projectedBillReceived: {
                        ID: 2578,
                        default: 0,
                        max: 4294967295,
                        name: "projectedBillReceived",
                        type: 35,
                    },
                    projectedBillTimeStampDelivered: {
                        ID: 2563,
                        default: 0,
                        name: "projectedBillTimeStampDelivered",
                        type: 226,
                    },
                    projectedBillTimeStampReceived: {
                        ID: 2579,
                        default: 0,
                        name: "projectedBillTimeStampReceived",
                        type: 226,
                    },
                    readingSnapshotTime: {
                        ID: 7,
                        name: "readingSnapshotTime",
                        type: 226,
                    },
                    remainingBattLife: {
                        ID: 513,
                        max: 255,
                        name: "remainingBattLife",
                        type: 32,
                    },
                    remainingBattLifeInDays: {
                        ID: 517,
                        max: 65535,
                        name: "remainingBattLifeInDays",
                        type: 33,
                    },
                    siteId: {
                        ID: 775,
                        maxLen: 33,
                        minLen: 1,
                        name: "siteId",
                        type: 65,
                    },
                    status: {
                        ID: 512,
                        default: 0,
                        max: 255,
                        name: "status",
                        required: true,
                        type: 24,
                    },
                    summaFormatting: {
                        ID: 771,
                        max: 255,
                        name: "summaFormatting",
                        required: true,
                        type: 24,
                    },
                    supplyDepletionState: {
                        ID: 1544,
                        default: 0,
                        max: 255,
                        name: "supplyDepletionState",
                        type: 48,
                    },
                    supplyStatus: {
                        ID: 20,
                        max: 255,
                        name: "supplyStatus",
                        type: 48,
                    },
                    supplyTamperState: {
                        ID: 1543,
                        default: 0,
                        max: 255,
                        name: "supplyTamperState",
                        type: 48,
                    },
                    supplyUncontrolledFlowState: {
                        ID: 1545,
                        default: 0,
                        max: 255,
                        name: "supplyUncontrolledFlowState",
                        type: 48,
                    },
                    temperatureFormatting: {
                        ID: 781,
                        max: 255,
                        name: "temperatureFormatting",
                        type: 24,
                    },
                    temperatureUnitOfMeas: {
                        ID: 780,
                        max: 255,
                        name: "temperatureUnitOfMeas",
                        type: 48,
                    },
                    unitOfMeasure: {
                        ID: 768,
                        default: 0,
                        max: 255,
                        name: "unitOfMeasure",
                        required: true,
                        type: 48,
                    },
                    volumePerReport: {
                        ID: 18,
                        max: 65535,
                        name: "volumePerReport",
                        type: 33,
                    },
                    waterSpecificAlarmMask: {
                        ID: 2051,
                        default: 65535,
                        max: 65535,
                        name: "waterSpecificAlarmMask",
                        type: 25,
                    },
                },
                commands: {
                    changeSupply: {
                        ID: 11,
                        name: "changeSupply",
                        parameters: [
                            {
                                name: "providerId",
                                type: 35,
                            },
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "requestDateTime",
                                type: 226,
                            },
                            {
                                name: "implDateTime",
                                type: 226,
                            },
                            {
                                name: "proposedSupplyStatusAfterImpl",
                                type: 48,
                            },
                            {
                                name: "SupplyControlBits",
                                type: 24,
                            },
                        ],
                    },
                    getProfile: {
                        ID: 0,
                        name: "getProfile",
                        parameters: [
                            {
                                name: "intervalChannel",
                                type: 48,
                            },
                            {
                                name: "endTime",
                                type: 226,
                            },
                            {
                                name: "numberOfPeriods",
                                type: 32,
                            },
                        ],
                        response: 0,
                    },
                    getSampledData: {
                        ID: 8,
                        name: "getSampledData",
                        parameters: [
                            {
                                name: "sampleId",
                                type: 33,
                            },
                            {
                                name: "earliestSampleTime",
                                type: 226,
                            },
                            {
                                name: "type",
                                type: 48,
                            },
                            {
                                name: "numberOfSamples",
                                type: 33,
                            },
                        ],
                        response: 7,
                    },
                    getSnapshot: {
                        ID: 6,
                        name: "getSnapshot",
                        parameters: [
                            {
                                name: "earliestStartTime",
                                type: 226,
                            },
                            {
                                name: "latestEndTime",
                                type: 226,
                            },
                            {
                                name: "offset",
                                type: 32,
                            },
                            {
                                name: "cause",
                                type: 27,
                            },
                        ],
                    },
                    localChangeSupply: {
                        ID: 12,
                        name: "localChangeSupply",
                        parameters: [
                            {
                                name: "proposedSupplyStatus",
                                type: 48,
                            },
                        ],
                    },
                    mirrorRemoved: {
                        ID: 2,
                        name: "mirrorRemoved",
                        parameters: [
                            {
                                name: "removedEndpointId",
                                type: 33,
                            },
                        ],
                        response: 2,
                    },
                    mirrorReportAttributeRsp: {
                        ID: 9,
                        name: "mirrorReportAttributeRsp",
                        parameters: [
                            {
                                name: "notificationScheme",
                                type: 32,
                            },
                            {
                                name: "notificationFlags",
                                type: 27,
                            },
                        ],
                    },
                    requestFastPollMode: {
                        ID: 3,
                        name: "requestFastPollMode",
                        parameters: [
                            {
                                name: "fastPollUpdatePeriod",
                                type: 32,
                            },
                            {
                                name: "duration",
                                type: 32,
                            },
                        ],
                        response: 3,
                    },
                    requestMirrorRsp: {
                        ID: 1,
                        name: "requestMirrorRsp",
                        parameters: [
                            {
                                name: "endpointId",
                                type: 33,
                            },
                        ],
                        response: 1,
                    },
                    resetLoadLimitCounter: {
                        ID: 10,
                        name: "resetLoadLimitCounter",
                        parameters: [
                            {
                                name: "providerId",
                                type: 35,
                            },
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                        ],
                    },
                    schneduleSnapshot: {
                        ID: 4,
                        name: "schneduleSnapshot",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "commandIndex",
                                type: 32,
                            },
                            {
                                name: "totalNumberOfCommands",
                                type: 32,
                            },
                        ],
                        response: 4,
                    },
                    setSupplyStatus: {
                        ID: 13,
                        name: "setSupplyStatus",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "tamperState",
                                type: 48,
                            },
                            {
                                name: "depletionState",
                                type: 48,
                            },
                            {
                                name: "uncontrolledFlowState",
                                type: 48,
                            },
                            {
                                name: "loadLimitSupplyState",
                                type: 48,
                            },
                        ],
                    },
                    setUncontrolledFlowThreshold: {
                        ID: 14,
                        name: "setUncontrolledFlowThreshold",
                        parameters: [
                            {
                                name: "providerId",
                                type: 35,
                            },
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "uncontrolledFlowThreshold",
                                type: 33,
                            },
                            {
                                name: "unitOfMeasure",
                                type: 48,
                            },
                            {
                                name: "multiplier",
                                type: 33,
                            },
                            {
                                name: "divisor",
                                type: 33,
                            },
                            {
                                name: "stabilisationPeriod",
                                type: 32,
                            },
                            {
                                name: "measurementPeriod",
                                type: 33,
                            },
                        ],
                    },
                    startSampling: {
                        ID: 7,
                        name: "startSampling",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "startTime",
                                type: 226,
                            },
                            {
                                name: "type",
                                type: 48,
                            },
                            {
                                name: "requestInterval",
                                type: 33,
                            },
                            {
                                name: "maxNumberOfSamples",
                                type: 33,
                            },
                        ],
                        response: 13,
                    },
                    takeSnapshot: {
                        ID: 5,
                        name: "takeSnapshot",
                        parameters: [
                            {
                                name: "cause",
                                type: 27,
                            },
                        ],
                        response: 5,
                    },
                },
                commandsResponse: {
                    configureMirror: {
                        ID: 8,
                        name: "configureMirror",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "reportingInterval",
                                type: 34,
                            },
                            {
                                name: "mirrorNotificationReporting",
                                type: 16,
                            },
                            {
                                name: "notificationScheme",
                                type: 32,
                            },
                        ],
                    },
                    configureNotificationFlag: {
                        ID: 10,
                        name: "configureNotificationFlag",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "notificationScheme",
                                type: 32,
                            },
                            {
                                name: "notificationFlagAttributeId",
                                type: 33,
                            },
                            {
                                name: "clusterId",
                                type: 232,
                            },
                            {
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                name: "numberOfCommands",
                                type: 32,
                            },
                            {
                                name: "commandIds",
                                type: 1001,
                            },
                        ],
                    },
                    configureNotificationScheme: {
                        ID: 9,
                        name: "configureNotificationScheme",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "notificationScheme",
                                type: 32,
                            },
                            {
                                name: "notificationFlagOrder",
                                type: 27,
                            },
                        ],
                    },
                    getNotifiedMessage: {
                        ID: 11,
                        name: "getNotifiedMessage",
                        parameters: [
                            {
                                name: "notificationScheme",
                                type: 32,
                            },
                            {
                                name: "notificationFlagAttributeId",
                                type: 33,
                            },
                            {
                                name: "notificationFlags",
                                type: 27,
                            },
                        ],
                    },
                    getProfileRsp: {
                        ID: 0,
                        name: "getProfileRsp",
                        parameters: [
                            {
                                name: "endTime",
                                type: 226,
                            },
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "profileIntervalPeriod",
                                type: 48,
                            },
                            {
                                name: "numberOfPeriodsDelivered",
                                type: 32,
                            },
                            {
                                name: "intervals",
                                type: 1003,
                            },
                        ],
                    },
                    getSampledDataRsp: {
                        ID: 7,
                        name: "getSampledDataRsp",
                        parameters: [
                            {
                                name: "id",
                                type: 33,
                            },
                            {
                                name: "startTime",
                                type: 226,
                            },
                            {
                                name: "type",
                                type: 48,
                            },
                            {
                                name: "requestInterval",
                                type: 33,
                            },
                            {
                                name: "numberOfSamples",
                                type: 33,
                            },
                            {
                                name: "samples",
                                type: 1003,
                            },
                        ],
                    },
                    publishSnapshot: {
                        ID: 6,
                        name: "publishSnapshot",
                        parameters: [
                            {
                                name: "id",
                                type: 35,
                            },
                            {
                                name: "time",
                                type: 226,
                            },
                            {
                                name: "totalSnapshotsFound",
                                type: 32,
                            },
                            {
                                name: "commandIndex",
                                type: 32,
                            },
                            {
                                name: "totalNumberOfCommands",
                                type: 32,
                            },
                            {
                                name: "cause",
                                type: 27,
                            },
                            {
                                name: "payloadType",
                                type: 48,
                            },
                        ],
                    },
                    removeMirror: {
                        ID: 2,
                        name: "removeMirror",
                        parameters: [],
                    },
                    requestFastPollModeRsp: {
                        ID: 3,
                        name: "requestFastPollModeRsp",
                        parameters: [
                            {
                                name: "appliedUpdatePeriod",
                                type: 32,
                            },
                            {
                                name: "fastPollModeEndTime",
                                type: 226,
                            },
                        ],
                    },
                    requestMirror: {
                        ID: 1,
                        name: "requestMirror",
                        parameters: [],
                    },
                    scheduleSnapshotRsp: {
                        ID: 4,
                        name: "scheduleSnapshotRsp",
                        parameters: [
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                        ],
                    },
                    startSamplingRsp: {
                        ID: 13,
                        name: "startSamplingRsp",
                        parameters: [
                            {
                                name: "sampleId",
                                type: 33,
                            },
                        ],
                    },
                    supplyStatusRsp: {
                        ID: 12,
                        name: "supplyStatusRsp",
                        parameters: [
                            {
                                name: "providerId",
                                type: 35,
                            },
                            {
                                name: "issuerEventId",
                                type: 35,
                            },
                            {
                                name: "implDateTime",
                                type: 226,
                            },
                            {
                                name: "supplyStatusAfterImpl",
                                type: 48,
                            },
                        ],
                    },
                    takeSnapshotRsp: {
                        ID: 5,
                        name: "takeSnapshotRsp",
                        parameters: [
                            {
                                name: "id",
                                type: 35,
                            },
                            {
                                name: "confirmation",
                                type: 32,
                            },
                        ],
                    },
                },
                name: "seMetering",
            },
            seTunneling: {
                ID: 1796,
                attributes: {
                    closeTunnelTimeout: {
                        ID: 0,
                        default: 65535,
                        min: 1,
                        name: "closeTunnelTimeout",
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    ackTransferData: {
                        ID: 4,
                        name: "ackTransferData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "numberOfBytesLeft",
                                type: 33,
                            },
                        ],
                    },
                    closeTunnel: {
                        ID: 1,
                        name: "closeTunnel",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    getSupportedTunnelProtocols: {
                        ID: 6,
                        name: "getSupportedTunnelProtocols",
                        parameters: [
                            {
                                name: "protocolOffset",
                                type: 32,
                            },
                        ],
                    },
                    readyData: {
                        ID: 5,
                        name: "readyData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "numberOfOctetsLeft",
                                type: 33,
                            },
                        ],
                    },
                    requestTunnel: {
                        ID: 0,
                        name: "requestTunnel",
                        parameters: [
                            {
                                max: 255,
                                min: 1,
                                name: "protocolId",
                                type: 48,
                            },
                            {
                                max: 65535,
                                name: "manufacturerCode",
                                type: 33,
                            },
                            {
                                name: "flowControl",
                                type: 16,
                            },
                            {
                                max: 65535,
                                name: "maxIncomingTransferSize",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    transferData: {
                        ID: 2,
                        name: "transferData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "data",
                                type: 1008,
                            },
                        ],
                        required: true,
                    },
                    transferDataError: {
                        ID: 3,
                        name: "transferDataError",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {
                    ackTransferData: {
                        ID: 3,
                        name: "ackTransferData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "numberOfBytesLeft",
                                type: 33,
                            },
                        ],
                    },
                    closureNotification: {
                        ID: 6,
                        name: "closureNotification",
                        parameters: [
                            {
                                name: "tunnelId",
                                type: 33,
                            },
                        ],
                    },
                    readyData: {
                        ID: 4,
                        name: "readyData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "numberOfOctetsLeft",
                                type: 33,
                            },
                        ],
                    },
                    requestTunnelRsp: {
                        ID: 0,
                        name: "requestTunnelRsp",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                            {
                                name: "maxIncomingTransferSize",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    supportedProtocolsRsp: {
                        ID: 5,
                        name: "supportedProtocolsRsp",
                        parameters: [
                            {
                                name: "listComplete",
                                type: 16,
                            },
                            {
                                name: "count",
                                type: 32,
                            },
                        ],
                    },
                    transferData: {
                        ID: 1,
                        name: "transferData",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "data",
                                type: 1008,
                            },
                        ],
                        required: true,
                    },
                    transferDataError: {
                        ID: 2,
                        name: "transferDataError",
                        parameters: [
                            {
                                max: 65535,
                                name: "tunnelId",
                                type: 33,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                },
                name: "seTunneling",
            },
            ssIasAce: {
                ID: 1281,
                attributes: {},
                commands: {
                    arm: {
                        ID: 0,
                        name: "arm",
                        parameters: [
                            {
                                name: "armmode",
                                type: 48,
                            },
                            {
                                name: "code",
                                type: 66,
                            },
                            {
                                name: "zoneid",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    bypass: {
                        ID: 1,
                        name: "bypass",
                        parameters: [
                            {
                                name: "numofzones",
                                type: 32,
                            },
                            {
                                name: "zoneidlist",
                                type: 1001,
                            },
                            {
                                name: "armDisarmCode",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    emergency: {
                        ID: 2,
                        name: "emergency",
                        parameters: [],
                        required: true,
                    },
                    fire: {
                        ID: 3,
                        name: "fire",
                        parameters: [],
                        required: true,
                    },
                    getBypassedZoneList: {
                        ID: 8,
                        name: "getBypassedZoneList",
                        parameters: [],
                        required: true,
                    },
                    getPanelStatus: {
                        ID: 7,
                        name: "getPanelStatus",
                        parameters: [],
                        required: true,
                        response: 5,
                    },
                    getZoneIDMap: {
                        ID: 5,
                        name: "getZoneIDMap",
                        parameters: [],
                        required: true,
                        response: 1,
                    },
                    getZoneInfo: {
                        ID: 6,
                        name: "getZoneInfo",
                        parameters: [
                            {
                                name: "zoneid",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 2,
                    },
                    getZoneStatus: {
                        ID: 9,
                        name: "getZoneStatus",
                        parameters: [
                            {
                                name: "startzoneid",
                                type: 32,
                            },
                            {
                                name: "maxnumzoneid",
                                type: 32,
                            },
                            {
                                name: "zonestatusmaskflag",
                                type: 16,
                            },
                            {
                                name: "zonestatusmask",
                                type: 25,
                            },
                        ],
                        required: true,
                        response: 8,
                    },
                    panic: {
                        ID: 4,
                        name: "panic",
                        parameters: [],
                        required: true,
                    },
                },
                commandsResponse: {
                    armRsp: {
                        ID: 0,
                        name: "armRsp",
                        parameters: [
                            {
                                name: "armnotification",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    bypassRsp: {
                        ID: 7,
                        name: "bypassRsp",
                        parameters: [
                            {
                                name: "numofzones",
                                type: 32,
                            },
                            {
                                name: "bypassresult",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                    getPanelStatusRsp: {
                        ID: 5,
                        name: "getPanelStatusRsp",
                        parameters: [
                            {
                                name: "panelstatus",
                                type: 48,
                            },
                            {
                                name: "secondsremain",
                                type: 32,
                            },
                            {
                                name: "audiblenotif",
                                type: 48,
                            },
                            {
                                name: "alarmstatus",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    getZoneIDMapRsp: {
                        ID: 1,
                        name: "getZoneIDMapRsp",
                        parameters: [
                            {
                                name: "zoneidmapsection0",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection1",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection2",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection3",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection4",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection5",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection6",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection7",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection8",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection9",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection10",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection11",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection12",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection13",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection14",
                                type: 25,
                            },
                            {
                                name: "zoneidmapsection15",
                                type: 25,
                            },
                        ],
                        required: true,
                    },
                    getZoneInfoRsp: {
                        ID: 2,
                        name: "getZoneInfoRsp",
                        parameters: [
                            {
                                name: "zoneid",
                                type: 32,
                            },
                            {
                                name: "zonetype",
                                type: 49,
                            },
                            {
                                name: "ieeeaddr",
                                type: 240,
                            },
                            {
                                name: "zonelabel",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    getZoneStatusRsp: {
                        ID: 8,
                        name: "getZoneStatusRsp",
                        parameters: [
                            {
                                name: "zonestatuscomplete",
                                type: 16,
                            },
                            {
                                name: "numofzones",
                                type: 32,
                            },
                            {
                                name: "zoneinfo",
                                type: 1005,
                            },
                        ],
                        required: true,
                    },
                    panelStatusChanged: {
                        ID: 4,
                        name: "panelStatusChanged",
                        parameters: [
                            {
                                name: "panelstatus",
                                type: 48,
                            },
                            {
                                name: "secondsremain",
                                type: 32,
                            },
                            {
                                name: "audiblenotif",
                                type: 48,
                            },
                            {
                                name: "alarmstatus",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    setBypassedZoneList: {
                        ID: 6,
                        name: "setBypassedZoneList",
                        parameters: [
                            {
                                name: "numofzones",
                                type: 32,
                            },
                            {
                                name: "zoneid",
                                type: 1001,
                            },
                        ],
                        required: true,
                    },
                    zoneStatusChanged: {
                        ID: 3,
                        name: "zoneStatusChanged",
                        parameters: [
                            {
                                name: "zoneid",
                                type: 32,
                            },
                            {
                                name: "zonestatus",
                                type: 49,
                            },
                            {
                                name: "audiblenotif",
                                type: 48,
                            },
                            {
                                name: "zonelabel",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                },
                name: "ssIasAce",
            },
            ssIasWd: {
                ID: 1282,
                attributes: {
                    maxDuration: {
                        ID: 0,
                        default: 240,
                        max: 65534,
                        name: "maxDuration",
                        required: true,
                        type: 33,
                        write: true,
                    },
                },
                commands: {
                    squawk: {
                        ID: 1,
                        name: "squawk",
                        parameters: [
                            {
                                name: "squawkinfo",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    startWarning: {
                        ID: 0,
                        name: "startWarning",
                        parameters: [
                            {
                                name: "startwarninginfo",
                                type: 24,
                            },
                            {
                                name: "warningduration",
                                type: 33,
                            },
                            {
                                max: 100,
                                name: "strobedutycycle",
                                type: 32,
                            },
                            {
                                name: "strobelevel",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                },
                commandsResponse: {},
                name: "ssIasWd",
            },
            ssIasZone: {
                ID: 1280,
                attributes: {
                    currentZoneSensitivityLevel: {
                        ID: 19,
                        default: 0,
                        max: 255,
                        name: "currentZoneSensitivityLevel",
                        type: 32,
                        write: true,
                    },
                    iasCieAddr: {
                        ID: 16,
                        name: "iasCieAddr",
                        required: true,
                        type: 240,
                        write: true,
                    },
                    numZoneSensitivityLevelsSupported: {
                        ID: 18,
                        default: 2,
                        max: 255,
                        min: 2,
                        name: "numZoneSensitivityLevelsSupported",
                        type: 32,
                    },
                    zoneId: {
                        ID: 17,
                        default: 255,
                        max: 255,
                        name: "zoneId",
                        required: true,
                        type: 32,
                    },
                    zoneState: {
                        ID: 0,
                        default: 0,
                        name: "zoneState",
                        required: true,
                        type: 48,
                    },
                    zoneStatus: {
                        ID: 2,
                        default: 0,
                        name: "zoneStatus",
                        required: true,
                        type: 25,
                    },
                    zoneType: {
                        ID: 1,
                        name: "zoneType",
                        required: true,
                        type: 49,
                    },
                },
                commands: {
                    enrollRsp: {
                        ID: 0,
                        name: "enrollRsp",
                        parameters: [
                            {
                                name: "enrollrspcode",
                                type: 48,
                            },
                            {
                                name: "zoneid",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    initNormalOpMode: {
                        ID: 1,
                        name: "initNormalOpMode",
                        parameters: [],
                    },
                    initTestMode: {
                        ID: 2,
                        name: "initTestMode",
                        parameters: [
                            {
                                name: "testModeDuration",
                                type: 32,
                            },
                            {
                                name: "currentZoneSensitivityLevel",
                                type: 32,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    enrollReq: {
                        ID: 1,
                        name: "enrollReq",
                        parameters: [
                            {
                                name: "zonetype",
                                type: 49,
                            },
                            {
                                name: "manucode",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    statusChangeNotification: {
                        ID: 0,
                        name: "statusChangeNotification",
                        parameters: [
                            {
                                name: "zonestatus",
                                type: 25,
                            },
                            {
                                name: "extendedstatus",
                                type: 24,
                            },
                            {
                                name: "zoneID",
                                type: 32,
                            },
                            {
                                name: "delay",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                },
                name: "ssIasZone",
            },
            telecommunicationsChatting: {
                ID: 2309,
                attributes: {
                    cID: {
                        ID: 16,
                        max: 65535,
                        name: "cID",
                        required: true,
                        type: 33,
                    },
                    enableAddChat: {
                        ID: 18,
                        name: "enableAddChat",
                        type: 16,
                    },
                    name: {
                        ID: 17,
                        name: "name",
                        required: true,
                        type: 66,
                    },
                    nickname: {
                        ID: 1,
                        name: "nickname",
                        required: true,
                        type: 66,
                    },
                    uID: {
                        ID: 0,
                        max: 65535,
                        name: "uID",
                        required: true,
                        type: 33,
                    },
                },
                commands: {
                    chatMessage: {
                        ID: 5,
                        name: "chatMessage",
                        parameters: [
                            {
                                name: "destUID",
                                type: 33,
                            },
                            {
                                name: "srcUID",
                                type: 33,
                            },
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "nickname",
                                type: 66,
                            },
                            {
                                name: "message",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    getNodeInfoReq: {
                        ID: 6,
                        name: "getNodeInfoReq",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                        ],
                        response: 8,
                    },
                    joinChatReq: {
                        ID: 0,
                        name: "joinChatReq",
                        parameters: [
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "nickname",
                                type: 66,
                            },
                            {
                                name: "cID",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                    leaveChatReq: {
                        ID: 1,
                        name: "leaveChatReq",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    searchChatReq: {
                        ID: 2,
                        name: "searchChatReq",
                        parameters: [],
                        required: true,
                        response: 4,
                    },
                    startChatReq: {
                        ID: 4,
                        name: "startChatReq",
                        parameters: [
                            {
                                name: "name",
                                type: 66,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "nickname",
                                type: 66,
                            },
                        ],
                        response: 0,
                    },
                    switchCharmanRsp: {
                        ID: 3,
                        name: "switchCharmanRsp",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    getNodeInfoRsp: {
                        ID: 8,
                        name: "getNodeInfoRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "address",
                                type: 9,
                            },
                            {
                                name: "endpoint",
                                type: 32,
                            },
                            {
                                name: "nickName",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    joinChatRsp: {
                        ID: 1,
                        name: "joinChatRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "cID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    searchChatRsp: {
                        ID: 4,
                        name: "searchChatRsp",
                        parameters: [
                            {
                                name: "options",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                    startChatRsp: {
                        ID: 0,
                        name: "startChatRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "cID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    switchChairmanConfirm: {
                        ID: 6,
                        name: "switchChairmanConfirm",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    switchChairmanNotification: {
                        ID: 7,
                        name: "switchChairmanNotification",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "address",
                                type: 9,
                            },
                            {
                                name: "endpoint",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    switchChairmanReq: {
                        ID: 5,
                        name: "switchChairmanReq",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    userJoined: {
                        ID: 3,
                        name: "userJoined",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "nickName",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                    userLeft: {
                        ID: 2,
                        name: "userLeft",
                        parameters: [
                            {
                                name: "cID",
                                type: 33,
                            },
                            {
                                name: "uID",
                                type: 33,
                            },
                            {
                                name: "nickName",
                                type: 66,
                            },
                        ],
                        required: true,
                    },
                },
                name: "telecommunicationsChatting",
            },
            telecommunicationsInformation: {
                ID: 2304,
                attributes: {
                    contentRootID: {
                        ID: 17,
                        max: 65535,
                        name: "contentRootID",
                        type: 33,
                    },
                    deliveryEnable: {
                        ID: 1,
                        name: "deliveryEnable",
                        required: true,
                        type: 16,
                    },
                    enableSecureConfiguration: {
                        ID: 3,
                        name: "enableSecureConfiguration",
                        required: true,
                        type: 16,
                    },
                    nodeDescription: {
                        ID: 0,
                        name: "nodeDescription",
                        required: true,
                        type: 66,
                    },
                    numberOfContents: {
                        ID: 16,
                        max: 65535,
                        name: "numberOfContents",
                        type: 33,
                    },
                    pushInformationTimer: {
                        ID: 2,
                        name: "pushInformationTimer",
                        type: 35,
                    },
                },
                commands: {
                    configureDeliveryEnable: {
                        ID: 7,
                        name: "configureDeliveryEnable",
                        parameters: [],
                    },
                    configureNodeDescription: {
                        ID: 6,
                        name: "configureNodeDescription",
                        parameters: [],
                    },
                    configurePushInfoTimer: {
                        ID: 8,
                        name: "configurePushInfoTimer",
                        parameters: [],
                    },
                    configureSetRootId: {
                        ID: 9,
                        name: "configureSetRootId",
                        parameters: [],
                    },
                    delete: {
                        ID: 5,
                        name: "delete",
                        parameters: [],
                        response: 6,
                    },
                    pushInfoResponse: {
                        ID: 1,
                        name: "pushInfoResponse",
                        parameters: [],
                        required: true,
                    },
                    requestInfo: {
                        ID: 0,
                        name: "requestInfo",
                        parameters: [],
                        required: true,
                        response: 0,
                    },
                    requestPreferenceRsp: {
                        ID: 3,
                        name: "requestPreferenceRsp",
                        parameters: [],
                    },
                    sendPreference: {
                        ID: 2,
                        name: "sendPreference",
                        parameters: [],
                        response: 2,
                    },
                    update: {
                        ID: 4,
                        name: "update",
                        parameters: [],
                        response: 5,
                    },
                },
                commandsResponse: {
                    deleteRsp: {
                        ID: 6,
                        name: "deleteRsp",
                        parameters: [],
                        required: true,
                    },
                    pushInfo: {
                        ID: 1,
                        name: "pushInfo",
                        parameters: [],
                        required: true,
                    },
                    requestInfoRsp: {
                        ID: 0,
                        name: "requestInfoRsp",
                        parameters: [],
                        required: true,
                    },
                    requestPreferenceConfirmation: {
                        ID: 4,
                        name: "requestPreferenceConfirmation",
                        parameters: [],
                        required: true,
                    },
                    sendPreferenceRsp: {
                        ID: 2,
                        name: "sendPreferenceRsp",
                        parameters: [],
                        required: true,
                    },
                    serverRequestPreference: {
                        ID: 3,
                        name: "serverRequestPreference",
                        parameters: [],
                        required: true,
                    },
                    updateRsp: {
                        ID: 5,
                        name: "updateRsp",
                        parameters: [],
                        required: true,
                    },
                },
                name: "telecommunicationsInformation",
            },
            telecommunicationsVoiceOverZigbee: {
                ID: 2308,
                attributes: {
                    codecType: {
                        ID: 0,
                        name: "codecType",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    codecTypeSub1: {
                        ID: 4,
                        name: "codecTypeSub1",
                        type: 48,
                        write: true,
                    },
                    codecTypeSub2: {
                        ID: 5,
                        name: "codecTypeSub2",
                        type: 48,
                        write: true,
                    },
                    codecTypeSub3: {
                        ID: 6,
                        name: "codecTypeSub3",
                        type: 48,
                        write: true,
                    },
                    codecrate: {
                        ID: 2,
                        name: "codecrate",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    compressionRate: {
                        ID: 8,
                        name: "compressionRate",
                        type: 48,
                    },
                    compressionType: {
                        ID: 7,
                        name: "compressionType",
                        type: 48,
                    },
                    establishmentTimeout: {
                        ID: 3,
                        max: 255,
                        min: 1,
                        name: "establishmentTimeout",
                        required: true,
                        type: 32,
                    },
                    optionFlags: {
                        ID: 9,
                        max: 255,
                        name: "optionFlags",
                        type: 24,
                        write: true,
                    },
                    samplingFrequency: {
                        ID: 1,
                        name: "samplingFrequency",
                        required: true,
                        type: 48,
                        write: true,
                    },
                    threshold: {
                        ID: 10,
                        max: 255,
                        name: "threshold",
                        type: 32,
                        write: true,
                    },
                },
                commands: {
                    controlResponse: {
                        ID: 0,
                        name: "controlResponse",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                        ],
                    },
                    establishmentRequest: {
                        ID: 0,
                        name: "establishmentRequest",
                        parameters: [
                            {
                                name: "flag",
                                type: 24,
                            },
                            {
                                name: "codecType",
                                type: 48,
                            },
                            {
                                name: "sampFreq",
                                type: 48,
                            },
                            {
                                name: "codecRate",
                                type: 48,
                            },
                            {
                                name: "serviceType",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 1,
                                        param: "flag",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "codecTypeS1",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 2,
                                        param: "flag",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "codecTypeS2",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 4,
                                        param: "flag",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "codecTypeS3",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 8,
                                        param: "flag",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "compType",
                                type: 48,
                            },
                            {
                                conditions: [
                                    {
                                        mask: 8,
                                        param: "flag",
                                        type: "bitMaskSet",
                                    },
                                ],
                                name: "compRate",
                                type: 48,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                    voiceTransmission: {
                        ID: 0,
                        name: "voiceTransmission",
                        parameters: [
                            {
                                name: "voiceData",
                                type: 255,
                            },
                        ],
                        required: true,
                    },
                    voiceTransmissionCompletion: {
                        ID: 0,
                        name: "voiceTransmissionCompletion",
                        parameters: [
                            {
                                name: "zclHeader",
                                type: 255,
                            },
                        ],
                    },
                },
                commandsResponse: {
                    control: {
                        ID: 2,
                        name: "control",
                        parameters: [
                            {
                                name: "controlType",
                                type: 48,
                            },
                        ],
                    },
                    establishmentRsp: {
                        ID: 0,
                        name: "establishmentRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                name: "codecType",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                    voiceTransmissionRsp: {
                        ID: 1,
                        name: "voiceTransmissionRsp",
                        parameters: [
                            {
                                name: "zclHeaderSeqNum",
                                type: 32,
                            },
                            {
                                name: "errorFlag",
                                type: 48,
                            },
                        ],
                        required: true,
                    },
                },
                name: "telecommunicationsVoiceOverZigbee",
            },
            touchlink: {
                ID: 4096,
                attributes: {},
                commands: {
                    deviceInformation: {
                        ID: 2,
                        name: "deviceInformation",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                        ],
                        required: true,
                        response: 3,
                    },
                    getEndpointList: {
                        ID: 66,
                        name: "getEndpointList",
                        parameters: [
                            {
                                name: "startIndex",
                                type: 32,
                            },
                        ],
                        response: 66,
                    },
                    getGroupIdentifiers: {
                        ID: 65,
                        name: "getGroupIdentifiers",
                        parameters: [
                            {
                                name: "startIndex",
                                type: 32,
                            },
                        ],
                        response: 65,
                    },
                    identifyRequest: {
                        ID: 6,
                        name: "identifyRequest",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                max: 65535,
                                name: "duration",
                                special: {
                                    0: "ExitIdentifyMode",
                                    65535: "IdentifyForReceiverKnownTime",
                                },
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    networkJoinEndDevice: {
                        ID: 20,
                        name: "networkJoinEndDevice",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "extendedPANID",
                                type: 240,
                            },
                            {
                                max: 15,
                                name: "keyIndex",
                                type: 32,
                            },
                            {
                                name: "encryptedNetworkKey",
                                type: 241,
                            },
                            {
                                name: "networkUpdateID",
                                type: 32,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                max: 65534,
                                min: 1,
                                name: "panID",
                                type: 33,
                            },
                            {
                                max: 65527,
                                min: 1,
                                name: "nwkAddr",
                                type: 33,
                            },
                            {
                                name: "groupIDsBegin",
                                type: 33,
                            },
                            {
                                name: "groupIDsEnd",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeEnd",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeEnd",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 21,
                    },
                    networkJoinRouter: {
                        ID: 18,
                        name: "networkJoinRouter",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "extendedPANID",
                                type: 240,
                            },
                            {
                                max: 15,
                                name: "keyIndex",
                                type: 32,
                            },
                            {
                                name: "encryptedNetworkKey",
                                type: 241,
                            },
                            {
                                name: "networkUpdateID",
                                type: 32,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                max: 65534,
                                min: 1,
                                name: "panID",
                                type: 33,
                            },
                            {
                                max: 65527,
                                min: 1,
                                name: "nwkAddr",
                                type: 33,
                            },
                            {
                                name: "groupIDsBegin",
                                type: 33,
                            },
                            {
                                name: "groupIDsEnd",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeEnd",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeEnd",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 19,
                    },
                    networkStart: {
                        ID: 16,
                        name: "networkStart",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "extendedPANID",
                                type: 240,
                            },
                            {
                                max: 15,
                                name: "keyIndex",
                                type: 32,
                            },
                            {
                                name: "encryptedNetworkKey",
                                type: 241,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                max: 65534,
                                name: "panID",
                                type: 33,
                            },
                            {
                                max: 65527,
                                min: 1,
                                name: "nwkAddr",
                                type: 33,
                            },
                            {
                                name: "groupIDsBegin",
                                type: 33,
                            },
                            {
                                name: "groupIDsEnd",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeNwkAddrRangeEnd",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeBegin",
                                type: 33,
                            },
                            {
                                name: "freeGroupIDRangeEnd",
                                type: 33,
                            },
                            {
                                name: "initiatorIEEE",
                                type: 240,
                            },
                            {
                                name: "initiatorNwkAddr",
                                type: 33,
                            },
                        ],
                        required: true,
                        response: 17,
                    },
                    networkUpdate: {
                        ID: 22,
                        name: "networkUpdate",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "extendedPANID",
                                type: 240,
                            },
                            {
                                name: "networkUpdateID",
                                type: 32,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                max: 65534,
                                min: 1,
                                name: "panID",
                                type: 33,
                            },
                            {
                                max: 65527,
                                min: 1,
                                name: "nwkAddr",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    resetToFactoryNew: {
                        ID: 7,
                        name: "resetToFactoryNew",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                        ],
                        required: true,
                    },
                    scanRequest: {
                        ID: 0,
                        name: "scanRequest",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "zigbeeInformation",
                                type: 24,
                            },
                            {
                                name: "touchlinkInformation",
                                type: 24,
                            },
                        ],
                        required: true,
                        response: 1,
                    },
                },
                commandsResponse: {
                    deviceInformation: {
                        ID: 3,
                        name: "deviceInformation",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "numberOfSubDevices",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                max: 5,
                                name: "deviceInfoCount",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    endpointInformation: {
                        ID: 64,
                        name: "endpointInformation",
                        parameters: [
                            {
                                name: "ieeeAddress",
                                type: 240,
                            },
                            {
                                name: "networkAddress",
                                type: 33,
                            },
                            {
                                name: "endpointID",
                                type: 32,
                            },
                            {
                                name: "profileID",
                                type: 33,
                            },
                            {
                                name: "deviceID",
                                type: 33,
                            },
                            {
                                name: "version",
                                type: 32,
                            },
                        ],
                    },
                    getEndpointList: {
                        ID: 66,
                        name: "getEndpointList",
                        parameters: [
                            {
                                name: "total",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                name: "count",
                                type: 32,
                            },
                        ],
                    },
                    getGroupIdentifiers: {
                        ID: 65,
                        name: "getGroupIdentifiers",
                        parameters: [
                            {
                                name: "total",
                                type: 32,
                            },
                            {
                                name: "startIndex",
                                type: 32,
                            },
                            {
                                name: "count",
                                type: 32,
                            },
                        ],
                    },
                    networkJoinEndDevice: {
                        ID: 21,
                        name: "networkJoinEndDevice",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    networkJoinRouter: {
                        ID: 19,
                        name: "networkJoinRouter",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                    networkStart: {
                        ID: 17,
                        name: "networkStart",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                name: "status",
                                type: 32,
                            },
                            {
                                name: "extendedPANID",
                                type: 240,
                            },
                            {
                                name: "networkUpdateID",
                                type: 32,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                name: "panID",
                                type: 33,
                            },
                        ],
                        required: true,
                    },
                    scanResponse: {
                        ID: 1,
                        name: "scanResponse",
                        parameters: [
                            {
                                min: 1,
                                name: "transactionID",
                                type: 35,
                            },
                            {
                                max: 20,
                                min: 0,
                                name: "rssiCorrection",
                                type: 32,
                            },
                            {
                                name: "zigbeeInformation",
                                type: 24,
                            },
                            {
                                name: "touchlinkInformation",
                                type: 24,
                            },
                            {
                                name: "keyBitmask",
                                type: 25,
                            },
                            {
                                name: "responseID",
                                type: 35,
                            },
                            {
                                name: "extendedPanID",
                                type: 240,
                            },
                            {
                                name: "networkUpdateID",
                                type: 32,
                            },
                            {
                                name: "logicalChannel",
                                type: 32,
                            },
                            {
                                name: "panID",
                                type: 33,
                            },
                            {
                                max: 65527,
                                min: 1,
                                name: "networkAddress",
                                type: 33,
                            },
                            {
                                name: "numberOfSubDevices",
                                type: 32,
                            },
                            {
                                name: "totalGroupIdentifiers",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "numberOfSubDevices",
                                        type: "fieldEquals",
                                        value: 1,
                                    },
                                ],
                                name: "endpointID",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "numberOfSubDevices",
                                        type: "fieldEquals",
                                        value: 1,
                                    },
                                ],
                                name: "profileID",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "numberOfSubDevices",
                                        type: "fieldEquals",
                                        value: 1,
                                    },
                                ],
                                name: "deviceID",
                                type: 33,
                            },
                            {
                                conditions: [
                                    {
                                        field: "numberOfSubDevices",
                                        type: "fieldEquals",
                                        value: 1,
                                    },
                                ],
                                name: "version",
                                type: 32,
                            },
                            {
                                conditions: [
                                    {
                                        field: "numberOfSubDevices",
                                        type: "fieldEquals",
                                        value: 1,
                                    },
                                ],
                                name: "groupIDCount",
                                type: 32,
                            },
                        ],
                        required: true,
                    },
                },
                name: "touchlink",
            },
            zigbeeDirectConfiguration: {
                ID: 61,
                attributes: {
                    anonymousJoinTimeout: {
                        ID: 1,
                        max: 1048576,
                        name: "anonymousJoinTimeout",
                        required: true,
                        type: 34,
                    },
                    interfaceState: {
                        ID: 0,
                        max: 255,
                        name: "interfaceState",
                        required: true,
                        type: 24,
                    },
                },
                commands: {
                    configureAnonymousJoinTimeout: {
                        ID: 1,
                        name: "configureAnonymousJoinTimeout",
                        parameters: [
                            {
                                max: 1048576,
                                name: "anonymousJoinTimeout",
                                type: 34,
                            },
                        ],
                        required: true,
                    },
                    configureInterface: {
                        ID: 0,
                        name: "configureInterface",
                        parameters: [
                            {
                                max: 255,
                                name: "interfaceState",
                                type: 24,
                            },
                        ],
                        required: true,
                        response: 0,
                    },
                },
                commandsResponse: {
                    configureInterfaceRsp: {
                        ID: 0,
                        name: "configureInterfaceRsp",
                        parameters: [
                            {
                                name: "status",
                                type: 48,
                            },
                            {
                                max: 255,
                                name: "interfaceState",
                                type: 24,
                            },
                        ],
                        required: true,
                    },
                },
                name: "zigbeeDirectConfiguration",
            },
        },
        custom_clusters: {
            "0x44e2f8fffe0c0ea6": {
                customClusterEwelink: {
                    name: "customClusterEwelink",
                    ID: 64529,
                    attributes: {
                        acCurrentCurrentValue: {
                            name: "acCurrentCurrentValue",
                            ID: 28676,
                            type: 35,
                        },
                        acCurrentPowerValue: {
                            name: "acCurrentPowerValue",
                            ID: 28678,
                            type: 35,
                        },
                        acCurrentVoltageValue: {
                            name: "acCurrentVoltageValue",
                            ID: 28677,
                            type: 35,
                        },
                        backLight: {
                            name: "backLight",
                            ID: 2,
                            type: 16,
                        },
                        delayedPowerOnState: {
                            name: "delayedPowerOnState",
                            ID: 20,
                            type: 16,
                        },
                        delayedPowerOnTime: {
                            name: "delayedPowerOnTime",
                            ID: 21,
                            type: 33,
                        },
                        detachRelayMode: {
                            name: "detachRelayMode",
                            ID: 23,
                            type: 16,
                        },
                        detachRelayMode2: {
                            name: "detachRelayMode2",
                            ID: 25,
                            type: 24,
                        },
                        deviceWorkMode: {
                            name: "deviceWorkMode",
                            ID: 24,
                            type: 32,
                        },
                        energyMonth: {
                            name: "energyMonth",
                            ID: 28682,
                            type: 35,
                        },
                        energyToday: {
                            name: "energyToday",
                            ID: 28681,
                            type: 35,
                        },
                        energyYesterday: {
                            name: "energyYesterday",
                            ID: 28683,
                            type: 35,
                        },
                        externalTriggerMode: {
                            name: "externalTriggerMode",
                            ID: 22,
                            type: 32,
                        },
                        faultCode: {
                            name: "faultCode",
                            ID: 16,
                            type: 43,
                        },
                        lackWaterCloseValveTimeout: {
                            name: "lackWaterCloseValveTimeout",
                            ID: 20497,
                            type: 33,
                        },
                        networkLed: {
                            name: "networkLed",
                            ID: 1,
                            type: 16,
                        },
                        outlet_control_protect: {
                            name: "outlet_control_protect",
                            ID: 28679,
                            type: 32,
                        },
                        radioPower: {
                            name: "radioPower",
                            ID: 18,
                            type: 41,
                        },
                        radioPowerWithManuCode: {
                            name: "radioPowerWithManuCode",
                            ID: 18,
                            manufacturerCode: 4742,
                            type: 41,
                        },
                    },
                    commands: {
                        protocolData: {
                            name: "protocolData",
                            ID: 1,
                            parameters: [
                                {
                                    name: "data",
                                    type: 1001,
                                },
                            ],
                        },
                    },
                    commandsResponse: {},
                },
            },
            "0x94a081fffe57bbf6": {
                manuSpecificIkeaUnknown: {
                    name: "manuSpecificIkeaUnknown",
                    ID: 64636,
                    attributes: {},
                    commands: {},
                    commandsResponse: {},
                    manufacturerCode: 4476,
                },
            },
            "0x00123456789abcde": {
                hvacThermostat: {
                    name: "hvacThermostat",
                    ID: 513,
                    attributes: {
                        SinopeAuxCycleOutput: {
                            name: "SinopeAuxCycleOutput",
                            ID: 1028,
                            manufacturerCode: 4508,
                            type: 33,
                        },
                        SinopeBacklight: {
                            name: "SinopeBacklight",
                            ID: 1026,
                            manufacturerCode: 4508,
                            type: 48,
                        },
                        SinopeMainCycleOutput: {
                            name: "SinopeMainCycleOutput",
                            ID: 1025,
                            manufacturerCode: 4508,
                            type: 33,
                        },
                        SinopeOccupancy: {
                            name: "SinopeOccupancy",
                            ID: 1024,
                            manufacturerCode: 4508,
                            type: 48,
                        },
                        StelproOutdoorTemp: {
                            name: "StelproOutdoorTemp",
                            ID: 16385,
                            type: 41,
                        },
                        StelproSystemMode: {
                            name: "StelproSystemMode",
                            ID: 16412,
                            type: 48,
                        },
                        absMaxCoolSetpointLimit: {
                            name: "absMaxCoolSetpointLimit",
                            ID: 6,
                            type: 41,
                        },
                        absMaxHeatSetpointLimit: {
                            name: "absMaxHeatSetpointLimit",
                            ID: 4,
                            type: 41,
                        },
                        absMinCoolSetpointLimit: {
                            name: "absMinCoolSetpointLimit",
                            ID: 5,
                            type: 41,
                        },
                        absMinHeatSetpointLimit: {
                            name: "absMinHeatSetpointLimit",
                            ID: 3,
                            type: 41,
                        },
                        acCapacity: {
                            name: "acCapacity",
                            ID: 65,
                            type: 33,
                        },
                        acCapacityFormat: {
                            name: "acCapacityFormat",
                            ID: 71,
                            type: 48,
                        },
                        acCollTemp: {
                            name: "acCollTemp",
                            ID: 70,
                            type: 41,
                        },
                        acConpressorType: {
                            name: "acConpressorType",
                            ID: 67,
                            type: 48,
                        },
                        acErrorCode: {
                            name: "acErrorCode",
                            ID: 68,
                            type: 27,
                        },
                        acLouverPosition: {
                            name: "acLouverPosition",
                            ID: 69,
                            type: 48,
                        },
                        acRefrigerantType: {
                            name: "acRefrigerantType",
                            ID: 66,
                            type: 48,
                        },
                        acType: {
                            name: "acType",
                            ID: 64,
                            type: 48,
                        },
                        alarmMask: {
                            name: "alarmMask",
                            ID: 29,
                            type: 24,
                        },
                        automaticValveAdapt: {
                            name: "automaticValveAdapt",
                            ID: 20496,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        boostHeating: {
                            name: "boostHeating",
                            ID: 16451,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        cableSensorMode: {
                            name: "cableSensorMode",
                            ID: 16482,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        cableSensorTemperature: {
                            name: "cableSensorTemperature",
                            ID: 16466,
                            manufacturerCode: 4617,
                            type: 41,
                        },
                        ctrlSeqeOfOper: {
                            name: "ctrlSeqeOfOper",
                            ID: 27,
                            type: 48,
                        },
                        danfossAdaptionRunControl: {
                            name: "danfossAdaptionRunControl",
                            ID: 16460,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossAdaptionRunSettings: {
                            name: "danfossAdaptionRunSettings",
                            ID: 16462,
                            manufacturerCode: 4678,
                            type: 24,
                        },
                        danfossAdaptionRunStatus: {
                            name: "danfossAdaptionRunStatus",
                            ID: 16461,
                            manufacturerCode: 4678,
                            type: 24,
                        },
                        danfossAlgorithmScaleFactor: {
                            name: "danfossAlgorithmScaleFactor",
                            ID: 16416,
                            manufacturerCode: 4678,
                            type: 32,
                        },
                        danfossDayOfWeek: {
                            name: "danfossDayOfWeek",
                            ID: 16400,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossExternalMeasuredRoomSensor: {
                            name: "danfossExternalMeasuredRoomSensor",
                            ID: 16405,
                            manufacturerCode: 4678,
                            type: 41,
                        },
                        danfossFloorMaxSetpoint: {
                            name: "danfossFloorMaxSetpoint",
                            ID: 16674,
                            manufacturerCode: 4678,
                            type: 41,
                        },
                        danfossFloorMinSetpoint: {
                            name: "danfossFloorMinSetpoint",
                            ID: 16673,
                            manufacturerCode: 4678,
                            type: 41,
                        },
                        danfossHeatAvailable: {
                            name: "danfossHeatAvailable",
                            ID: 16432,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossHeatRequired: {
                            name: "danfossHeatRequired",
                            ID: 16433,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossIcon2PreHeat: {
                            name: "danfossIcon2PreHeat",
                            ID: 16689,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossIcon2PreHeatStatus: {
                            name: "danfossIcon2PreHeatStatus",
                            ID: 16719,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossLoadBalancingEnable: {
                            name: "danfossLoadBalancingEnable",
                            ID: 16434,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossLoadEstimate: {
                            name: "danfossLoadEstimate",
                            ID: 16458,
                            manufacturerCode: 4678,
                            type: 41,
                        },
                        danfossLoadRoomMean: {
                            name: "danfossLoadRoomMean",
                            ID: 16448,
                            manufacturerCode: 4678,
                            type: 41,
                        },
                        danfossMountedModeActive: {
                            name: "danfossMountedModeActive",
                            ID: 16402,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossMountedModeControl: {
                            name: "danfossMountedModeControl",
                            ID: 16403,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossOutputStatus: {
                            name: "danfossOutputStatus",
                            ID: 16656,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossPreheatStatus: {
                            name: "danfossPreheatStatus",
                            ID: 16463,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossPreheatTime: {
                            name: "danfossPreheatTime",
                            ID: 16464,
                            manufacturerCode: 4678,
                            type: 35,
                        },
                        danfossRadiatorCovered: {
                            name: "danfossRadiatorCovered",
                            ID: 16406,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossRegulationSetpointOffset: {
                            name: "danfossRegulationSetpointOffset",
                            ID: 16459,
                            manufacturerCode: 4678,
                            type: 40,
                        },
                        danfossRoomFloorSensorMode: {
                            name: "danfossRoomFloorSensorMode",
                            ID: 16672,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossRoomStatusCode: {
                            name: "danfossRoomStatusCode",
                            ID: 16640,
                            manufacturerCode: 4678,
                            type: 25,
                        },
                        danfossScheduleTypeUsed: {
                            name: "danfossScheduleTypeUsed",
                            ID: 16688,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        danfossThermostatOrientation: {
                            name: "danfossThermostatOrientation",
                            ID: 16404,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossTriggerTime: {
                            name: "danfossTriggerTime",
                            ID: 16401,
                            manufacturerCode: 4678,
                            type: 33,
                        },
                        danfossWindowOpenExternal: {
                            name: "danfossWindowOpenExternal",
                            ID: 16387,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossWindowOpenFeatureEnable: {
                            name: "danfossWindowOpenFeatureEnable",
                            ID: 16465,
                            manufacturerCode: 4678,
                            type: 16,
                        },
                        danfossWindowOpenInternal: {
                            name: "danfossWindowOpenInternal",
                            ID: 16384,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        elkoCalibration: {
                            name: "elkoCalibration",
                            ID: 1047,
                            type: 40,
                        },
                        elkoChildLock: {
                            name: "elkoChildLock",
                            ID: 1043,
                            type: 16,
                        },
                        elkoDateTime: {
                            name: "elkoDateTime",
                            ID: 1031,
                            type: 65,
                        },
                        elkoDisplayText: {
                            name: "elkoDisplayText",
                            ID: 1026,
                            type: 66,
                        },
                        elkoExternalTemp: {
                            name: "elkoExternalTemp",
                            ID: 1033,
                            type: 41,
                        },
                        elkoFrostGuard: {
                            name: "elkoFrostGuard",
                            ID: 1042,
                            type: 16,
                        },
                        elkoLastMessageId: {
                            name: "elkoLastMessageId",
                            ID: 1048,
                            type: 32,
                        },
                        elkoLastMessageStatus: {
                            name: "elkoLastMessageStatus",
                            ID: 1049,
                            type: 32,
                        },
                        elkoLoad: {
                            name: "elkoLoad",
                            ID: 1025,
                            type: 33,
                        },
                        elkoMaxFloorTemp: {
                            name: "elkoMaxFloorTemp",
                            ID: 1044,
                            type: 32,
                        },
                        elkoMeanPower: {
                            name: "elkoMeanPower",
                            ID: 1032,
                            type: 33,
                        },
                        elkoNightSwitching: {
                            name: "elkoNightSwitching",
                            ID: 1041,
                            type: 16,
                        },
                        elkoPowerStatus: {
                            name: "elkoPowerStatus",
                            ID: 1030,
                            type: 16,
                        },
                        elkoRegulatorMode: {
                            name: "elkoRegulatorMode",
                            ID: 1029,
                            type: 16,
                        },
                        elkoRegulatorTime: {
                            name: "elkoRegulatorTime",
                            ID: 1028,
                            type: 32,
                        },
                        elkoRelayState: {
                            name: "elkoRelayState",
                            ID: 1045,
                            type: 16,
                        },
                        elkoSensor: {
                            name: "elkoSensor",
                            ID: 1027,
                            type: 48,
                        },
                        elkoVersion: {
                            name: "elkoVersion",
                            ID: 1046,
                            type: 65,
                        },
                        errorState: {
                            name: "errorState",
                            ID: 20480,
                            manufacturerCode: 4617,
                            type: 24,
                        },
                        fourNoksHysteresisHigh: {
                            name: "fourNoksHysteresisHigh",
                            ID: 257,
                            manufacturerCode: 4209,
                            type: 33,
                        },
                        fourNoksHysteresisLow: {
                            name: "fourNoksHysteresisLow",
                            ID: 258,
                            manufacturerCode: 4209,
                            type: 33,
                        },
                        heaterType: {
                            name: "heaterType",
                            ID: 16483,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        heatingDemand: {
                            name: "heatingDemand",
                            ID: 16416,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        localTemp: {
                            name: "localTemp",
                            ID: 0,
                            type: 41,
                        },
                        localTemperatureCalibration: {
                            name: "localTemperatureCalibration",
                            ID: 16,
                            type: 40,
                        },
                        maxCoolSetpointLimit: {
                            name: "maxCoolSetpointLimit",
                            ID: 24,
                            type: 41,
                        },
                        maxHeatSetpointLimit: {
                            name: "maxHeatSetpointLimit",
                            ID: 22,
                            type: 41,
                        },
                        minCoolSetpointLimit: {
                            name: "minCoolSetpointLimit",
                            ID: 23,
                            type: 41,
                        },
                        minHeatSetpointLimit: {
                            name: "minHeatSetpointLimit",
                            ID: 21,
                            type: 41,
                        },
                        minSetpointDeadBand: {
                            name: "minSetpointDeadBand",
                            ID: 25,
                            type: 40,
                        },
                        numberOfDailyTrans: {
                            name: "numberOfDailyTrans",
                            ID: 34,
                            type: 32,
                        },
                        numberOfWeeklyTrans: {
                            name: "numberOfWeeklyTrans",
                            ID: 33,
                            type: 32,
                        },
                        occupancy: {
                            name: "occupancy",
                            ID: 2,
                            type: 24,
                        },
                        occupiedCoolingSetpoint: {
                            name: "occupiedCoolingSetpoint",
                            ID: 17,
                            type: 41,
                        },
                        occupiedHeatingSetpoint: {
                            name: "occupiedHeatingSetpoint",
                            ID: 18,
                            type: 41,
                        },
                        operatingMode: {
                            name: "operatingMode",
                            ID: 16391,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        outdoorTemp: {
                            name: "outdoorTemp",
                            ID: 1,
                            type: 41,
                        },
                        pICoolingDemand: {
                            name: "pICoolingDemand",
                            ID: 7,
                            type: 32,
                        },
                        pIHeatingDemand: {
                            name: "pIHeatingDemand",
                            ID: 8,
                            type: 32,
                        },
                        programingOperMode: {
                            name: "programingOperMode",
                            ID: 37,
                            type: 24,
                        },
                        remoteSensing: {
                            name: "remoteSensing",
                            ID: 26,
                            type: 24,
                        },
                        remoteTemperature: {
                            name: "remoteTemperature",
                            ID: 16448,
                            manufacturerCode: 4617,
                            type: 41,
                        },
                        runningMode: {
                            name: "runningMode",
                            ID: 30,
                            type: 48,
                        },
                        runningState: {
                            name: "runningState",
                            ID: 41,
                            type: 25,
                        },
                        schneiderWiserSpecific: {
                            name: "schneiderWiserSpecific",
                            ID: 57616,
                            manufacturerCode: 4190,
                            type: 48,
                        },
                        setpointChangeAmount: {
                            name: "setpointChangeAmount",
                            ID: 49,
                            type: 41,
                        },
                        setpointChangeSource: {
                            name: "setpointChangeSource",
                            ID: 48,
                            type: 48,
                        },
                        setpointChangeSourceTimeStamp: {
                            name: "setpointChangeSourceTimeStamp",
                            ID: 50,
                            type: 226,
                        },
                        startOfWeek: {
                            name: "startOfWeek",
                            ID: 32,
                            type: 48,
                        },
                        systemMode: {
                            name: "systemMode",
                            ID: 28,
                            type: 48,
                        },
                        systemTypeConfig: {
                            name: "systemTypeConfig",
                            ID: 9,
                            type: 24,
                        },
                        tempSetpointHold: {
                            name: "tempSetpointHold",
                            ID: 35,
                            type: 48,
                        },
                        tempSetpointHoldDuration: {
                            name: "tempSetpointHoldDuration",
                            ID: 36,
                            type: 33,
                        },
                        unknownAttribute0: {
                            name: "unknownAttribute0",
                            ID: 16421,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        unknownAttribute1: {
                            name: "unknownAttribute1",
                            ID: 16449,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        unknownAttribute2: {
                            name: "unknownAttribute2",
                            ID: 16481,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        unoccupiedCoolingSetpoint: {
                            name: "unoccupiedCoolingSetpoint",
                            ID: 19,
                            type: 41,
                        },
                        unoccupiedHeatingSetpoint: {
                            name: "unoccupiedHeatingSetpoint",
                            ID: 20,
                            type: 41,
                        },
                        valveAdaptStatus: {
                            name: "valveAdaptStatus",
                            ID: 16418,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        valveType: {
                            name: "valveType",
                            ID: 16480,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        viessmannAssemblyMode: {
                            name: "viessmannAssemblyMode",
                            ID: 16402,
                            manufacturerCode: 4641,
                            type: 16,
                        },
                        viessmannWindowOpenForce: {
                            name: "viessmannWindowOpenForce",
                            ID: 16387,
                            manufacturerCode: 4641,
                            type: 16,
                        },
                        viessmannWindowOpenInternal: {
                            name: "viessmannWindowOpenInternal",
                            ID: 16384,
                            manufacturerCode: 4641,
                            type: 48,
                        },
                        windowOpenMode: {
                            name: "windowOpenMode",
                            ID: 16450,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                    },
                    commands: {
                        calibrateValve: {
                            name: "calibrateValve",
                            ID: 65,
                            parameters: [],
                        },
                        clearWeeklySchedule: {
                            name: "clearWeeklySchedule",
                            ID: 3,
                            parameters: [],
                        },
                        danfossSetpointCommand: {
                            name: "danfossSetpointCommand",
                            ID: 64,
                            parameters: [
                                {
                                    name: "setpointType",
                                    type: 48,
                                },
                                {
                                    name: "setpoint",
                                    type: 41,
                                },
                            ],
                        },
                        getRelayStatusLog: {
                            name: "getRelayStatusLog",
                            ID: 4,
                            parameters: [],
                            response: 1,
                        },
                        getWeeklySchedule: {
                            name: "getWeeklySchedule",
                            ID: 2,
                            parameters: [
                                {
                                    name: "daystoreturn",
                                    type: 32,
                                },
                                {
                                    name: "modetoreturn",
                                    type: 32,
                                },
                            ],
                            response: 0,
                        },
                        plugwiseCalibrateValve: {
                            name: "plugwiseCalibrateValve",
                            ID: 160,
                            parameters: [],
                        },
                        schneiderWiserThermostatBoost: {
                            name: "schneiderWiserThermostatBoost",
                            ID: 128,
                            parameters: [
                                {
                                    name: "command",
                                    type: 48,
                                },
                                {
                                    name: "enable",
                                    type: 48,
                                },
                                {
                                    name: "temperature",
                                    type: 33,
                                },
                                {
                                    name: "duration",
                                    type: 33,
                                },
                            ],
                        },
                        setWeeklySchedule: {
                            name: "setWeeklySchedule",
                            ID: 1,
                            parameters: [
                                {
                                    name: "numoftrans",
                                    type: 32,
                                },
                                {
                                    name: "dayofweek",
                                    type: 32,
                                },
                                {
                                    name: "mode",
                                    type: 32,
                                },
                                {
                                    name: "transitions",
                                    type: 1007,
                                },
                            ],
                        },
                        setpointRaiseLower: {
                            name: "setpointRaiseLower",
                            ID: 0,
                            parameters: [
                                {
                                    name: "mode",
                                    type: 32,
                                },
                                {
                                    name: "amount",
                                    type: 40,
                                },
                            ],
                        },
                        wiserSmartCalibrateValve: {
                            name: "wiserSmartCalibrateValve",
                            ID: 226,
                            parameters: [],
                        },
                        wiserSmartSetFipMode: {
                            name: "wiserSmartSetFipMode",
                            ID: 225,
                            parameters: [
                                {
                                    name: "zonemode",
                                    type: 32,
                                },
                                {
                                    name: "fipmode",
                                    type: 48,
                                },
                                {
                                    name: "reserved",
                                    type: 32,
                                },
                            ],
                        },
                        wiserSmartSetSetpoint: {
                            name: "wiserSmartSetSetpoint",
                            ID: 224,
                            parameters: [
                                {
                                    name: "operatingmode",
                                    type: 32,
                                },
                                {
                                    name: "zonemode",
                                    type: 32,
                                },
                                {
                                    name: "setpoint",
                                    type: 41,
                                },
                                {
                                    name: "reserved",
                                    type: 32,
                                },
                            ],
                        },
                    },
                    commandsResponse: {
                        getRelayStatusLogRsp: {
                            name: "getRelayStatusLogRsp",
                            ID: 1,
                            parameters: [
                                {
                                    name: "timeofday",
                                    type: 33,
                                },
                                {
                                    name: "relaystatus",
                                    type: 33,
                                },
                                {
                                    name: "localtemp",
                                    type: 33,
                                },
                                {
                                    name: "humidity",
                                    type: 32,
                                },
                                {
                                    name: "setpoint",
                                    type: 33,
                                },
                                {
                                    name: "unreadentries",
                                    type: 33,
                                },
                            ],
                        },
                        getWeeklyScheduleRsp: {
                            name: "getWeeklyScheduleRsp",
                            ID: 0,
                            parameters: [
                                {
                                    name: "numoftrans",
                                    type: 32,
                                },
                                {
                                    name: "dayofweek",
                                    type: 32,
                                },
                                {
                                    name: "mode",
                                    type: 32,
                                },
                                {
                                    name: "transitions",
                                    type: 1007,
                                },
                            ],
                        },
                    },
                },
                hvacUserInterfaceCfg: {
                    name: "hvacUserInterfaceCfg",
                    ID: 516,
                    attributes: {
                        activityLed: {
                            name: "activityLed",
                            ID: 16435,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        danfossViewingDirection: {
                            name: "danfossViewingDirection",
                            ID: 16384,
                            manufacturerCode: 4678,
                            type: 48,
                        },
                        displayBrightness: {
                            name: "displayBrightness",
                            ID: 16443,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        displayOrientation: {
                            name: "displayOrientation",
                            ID: 16395,
                            manufacturerCode: 4617,
                            type: 32,
                        },
                        displaySwitchOnDuration: {
                            name: "displaySwitchOnDuration",
                            ID: 16442,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        displayedTemperature: {
                            name: "displayedTemperature",
                            ID: 16441,
                            manufacturerCode: 4617,
                            type: 48,
                        },
                        keypadLockout: {
                            name: "keypadLockout",
                            ID: 1,
                            type: 48,
                        },
                        programmingVisibility: {
                            name: "programmingVisibility",
                            ID: 2,
                            type: 48,
                        },
                        tempDisplayMode: {
                            name: "tempDisplayMode",
                            ID: 0,
                            type: 48,
                        },
                    },
                    commands: {},
                    commandsResponse: {},
                },
            },
            "0x2c1165fffeabe0ad": {
                genBasic: {
                    name: "genBasic",
                    ID: 0,
                    attributes: {
                        alarmMask: {
                            name: "alarmMask",
                            ID: 19,
                            type: 24,
                        },
                        appProfileVersion: {
                            name: "appProfileVersion",
                            ID: 8,
                            type: 48,
                        },
                        appVersion: {
                            name: "appVersion",
                            ID: 1,
                            type: 32,
                        },
                        componentSignature: {
                            name: "componentSignature",
                            ID: 26118,
                            manufacturerCode: 26214,
                            type: 66,
                        },
                        componentVersion: {
                            name: "componentVersion",
                            ID: 26117,
                            manufacturerCode: 26214,
                            type: 66,
                        },
                        dateCode: {
                            name: "dateCode",
                            ID: 6,
                            type: 66,
                        },
                        deviceBootVersion: {
                            name: "deviceBootVersion",
                            ID: 26115,
                            manufacturerCode: 26214,
                            type: 66,
                        },
                        deviceEnabled: {
                            name: "deviceEnabled",
                            ID: 18,
                            type: 16,
                        },
                        deviceSignature: {
                            name: "deviceSignature",
                            ID: 26114,
                            manufacturerCode: 26214,
                            type: 66,
                        },
                        deviceVersion: {
                            name: "deviceVersion",
                            ID: 26113,
                            manufacturerCode: 26214,
                            type: 66,
                        },
                        disableLocalConfig: {
                            name: "disableLocalConfig",
                            ID: 20,
                            type: 24,
                        },
                        genericDeviceType: {
                            name: "genericDeviceType",
                            ID: 9,
                            type: 48,
                        },
                        hwVersion: {
                            name: "hwVersion",
                            ID: 3,
                            type: 32,
                        },
                        locationDesc: {
                            name: "locationDesc",
                            ID: 16,
                            type: 66,
                        },
                        manufacturerName: {
                            name: "manufacturerName",
                            ID: 4,
                            type: 66,
                        },
                        manufacturerVersionDetails: {
                            name: "manufacturerVersionDetails",
                            ID: 12,
                            type: 66,
                        },
                        modelId: {
                            name: "modelId",
                            ID: 5,
                            type: 66,
                        },
                        physicalEnv: {
                            name: "physicalEnv",
                            ID: 17,
                            type: 48,
                        },
                        powerSource: {
                            name: "powerSource",
                            ID: 7,
                            type: 48,
                        },
                        productCode: {
                            name: "productCode",
                            ID: 10,
                            type: 65,
                        },
                        productLabel: {
                            name: "productLabel",
                            ID: 14,
                            type: 66,
                        },
                        productUrl: {
                            name: "productUrl",
                            ID: 11,
                            type: 66,
                        },
                        schneiderMeterRadioPower: {
                            name: "schneiderMeterRadioPower",
                            ID: 57856,
                            manufacturerCode: 4190,
                            type: 40,
                        },
                        serialNumber: {
                            name: "serialNumber",
                            ID: 13,
                            type: 66,
                        },
                        stackVersion: {
                            name: "stackVersion",
                            ID: 2,
                            type: 32,
                        },
                        swBuildId: {
                            name: "swBuildId",
                            ID: 16384,
                            type: 66,
                        },
                        zclVersion: {
                            name: "zclVersion",
                            ID: 0,
                            type: 32,
                        },
                    },
                    commands: {
                        resetFactDefault: {
                            name: "resetFactDefault",
                            ID: 0,
                            parameters: [],
                        },
                        tuyaSetup: {
                            name: "tuyaSetup",
                            ID: 240,
                            parameters: [],
                        },
                    },
                    commandsResponse: {},
                },
                sprutDevice: {
                    name: "sprutDevice",
                    ID: 26112,
                    attributes: {
                        UartBaudRate: {
                            name: "UartBaudRate",
                            ID: 26113,
                            type: 35,
                        },
                        isConnected: {
                            name: "isConnected",
                            ID: 26116,
                            type: 16,
                        },
                    },
                    commands: {
                        debug: {
                            name: "debug",
                            ID: 103,
                            parameters: [
                                {
                                    name: "data",
                                    type: 32,
                                },
                            ],
                        },
                    },
                    commandsResponse: {},
                    manufacturerCode: 26214,
                },
            },
        },
    },
    topic: "bridge/definitions",
};
