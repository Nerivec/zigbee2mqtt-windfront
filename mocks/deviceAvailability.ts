import type { AvailabilityState, Message } from "../src/types.js";

export const DEVICE_AVAILABILITY: Message<AvailabilityState>[] = [
    {
        payload: {
            state: "online",
        },
        topic: "0xbc33acfffe17628b/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "0xbc33acfffe17628a/availability",
    },
    {
        payload: {
            state: "offline",
        },
        topic: "hue1/availability",
    },
    {
        payload: {
            state: "offline",
        },
        topic: "hue_back_tv/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "0x00158d000224154d/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "0x00124b001e73227f1/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "livingroom/temp_humidity/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "livingroom/window/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "livingroom/ac power/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "0x00158d0004866f11/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "dining room/ac power/availability",
    },
    {
        payload: {
            state: "offline",
        },
        topic: "0x0017880103d55d65/availability",
    },
    {
        payload: {
            state: "offline",
        },
        topic: "hue lights/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "901/availability",
    },
    {
        payload: {
            state: "online",
        },
        topic: "Détecteur_Mouvement_Bureau/availability",
    },
];
