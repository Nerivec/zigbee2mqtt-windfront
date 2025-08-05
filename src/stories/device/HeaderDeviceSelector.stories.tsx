import type { Meta, StoryObj } from "@storybook/react-vite";
import HeaderDeviceSelector from "../../components/device-page/HeaderDeviceSelector";
import { BASIC_ENDDEVICE, BASIC_ROUTER, OTHER_ROUTER } from "../devices";

const meta = {
    title: "Components/Device/HeaderDeviceSelector",
    tags: ["autodocs"],
    component: HeaderDeviceSelector,
    argTypes: {
        tab: { control: "select", options: ["devices", "settings"] },
    },
    args: {
        devices: [],
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
        devices: [{ ...BASIC_ROUTER }, { ...OTHER_ROUTER }, { ...BASIC_ENDDEVICE }],
    },
};

export const WithCurrent: Story = {
    args: {
        currentDevice: { ...OTHER_ROUTER },
        devices: [{ ...BASIC_ROUTER }, { ...OTHER_ROUTER }, { ...BASIC_ENDDEVICE }],
    },
};
