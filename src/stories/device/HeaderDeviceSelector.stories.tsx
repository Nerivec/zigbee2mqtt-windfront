import type { Meta, StoryObj } from "@storybook/react-vite";
import HeaderDeviceSelector from "../../components/device-page/HeaderDeviceSelector.js";
import { useAppStore } from "../../store.js";
import { BASIC_ENDDEVICE, BASIC_ROUTER, OTHER_ROUTER } from "../devices.js";

const meta = {
    title: "Components/Device/HeaderDeviceSelector",
    tags: ["autodocs"],
    component: HeaderDeviceSelector,
    argTypes: {
        currentSourceIdx: { control: "number" },
        tab: { control: "select", options: ["devices", "settings"] },
    },
    args: {
        currentSourceIdx: 0,
        currentDevice: undefined,
    },
    decorators: [(Story) => <Story />],
} satisfies Meta<typeof HeaderDeviceSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blank: Story = {
    args: {},
};

export const Basic: Story = {
    args: {
        // devices: [{ ...BASIC_ROUTER }, { ...OTHER_ROUTER }, { ...BASIC_ENDDEVICE }],
    },
    beforeEach: () => {
        useAppStore.setState({ devices: { 0: [{ ...BASIC_ROUTER }, { ...OTHER_ROUTER }, { ...BASIC_ENDDEVICE }] } });

        return () => {
            useAppStore.getState().reset();
        };
    },
};

export const WithCurrent: Story = {
    args: {
        currentDevice: { ...OTHER_ROUTER },
    },
    beforeEach: () => {
        useAppStore.setState({ devices: { 0: [{ ...BASIC_ROUTER }, { ...OTHER_ROUTER }, { ...BASIC_ENDDEVICE }] } });

        return () => {
            useAppStore.getState().reset();
        };
    },
};
