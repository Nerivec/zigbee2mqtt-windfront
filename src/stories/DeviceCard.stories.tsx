import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { isValidForDashboard } from "../components/dashboard-page";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper";
import DeviceCard from "../components/device/DeviceCard";
import { isValidForScenes } from "../components/device-page";
import { filterExposes } from "../utils";
import { baseEndDevice, baseRouter, multiEndpointDevice } from "./devices";

const meta = {
    title: "Components/Device/DeviceCard",
    tags: ["autodocs"],
    component: DeviceCard,
    argTypes: {
        featureWrapperClass: { table: { disable: true } },
        endpoint: { control: "number" },
    },
    // onChange, onRead, device, endpoint, deviceState, lastSeenConfig, features, featureWrapperClass, children
    args: {
        device: { ...baseRouter },
        endpoint: undefined,
        deviceState: {},
        lastSeenConfig: "ISO_8601_local",
        features: [],
        featureWrapperClass: DashboardFeatureWrapper,
        // children: [],
        onChange: fn(),
    },
    decorators: [
        (Story) => (
            <div className="w-[23rem] card bg-base-200 rounded-box shadow-md">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof DeviceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blank: Story = {
    args: {},
};

export const Basic: Story = {
    args: {
        deviceState: { linkquality: 245, last_seen: new Date(Date.now() - 1000 * 3700).toLocaleString() },
        features: filterExposes(baseRouter.definition?.exposes ?? [], isValidForDashboard),
    },
};

export const WithChildren: Story = {
    args: {
        deviceState: { linkquality: 245, last_seen: new Date(Date.now() - 1000 * 3700).toLocaleString() },
        features: filterExposes(baseEndDevice.definition?.exposes ?? [], isValidForDashboard),
        children: [
            <span key="1" className="badge badge-xs badge-secondary">
                1
            </span>,
            <div key="2" className="btn btn-square btn-xs btn-primary">
                2
            </div>,
        ],
    },
};

export const DashboardFeatures: Story = {
    args: {
        deviceState: { linkquality: 150, last_seen: new Date(Date.now() - 1000 * 600000).toLocaleString() },
        device: { ...multiEndpointDevice },
        features: filterExposes(multiEndpointDevice.definition?.exposes ?? [], isValidForDashboard),
    },
};

export const SceneFeatures: Story = {
    args: {
        deviceState: { linkquality: 78, last_seen: new Date(Date.now() - 1000 * 600).toLocaleString() },
        device: { ...multiEndpointDevice },
        features: filterExposes(multiEndpointDevice.definition?.exposes ?? [], isValidForScenes),
    },
};

export const EndpointDashboardFeatures: Story = {
    args: {
        deviceState: { linkquality: 125, last_seen: new Date(Date.now() - 1000 * 40).toLocaleString() },
        device: { ...multiEndpointDevice },
        features: filterExposes(multiEndpointDevice.definition?.exposes ?? [], isValidForDashboard),
        endpoint: 11,
    },
};

export const EndpointSceneFeatures: Story = {
    args: {
        deviceState: { linkquality: 187, last_seen: new Date(Date.now() - 1000 * 3450).toLocaleString() },
        device: { ...multiEndpointDevice },
        features: filterExposes(multiEndpointDevice.definition?.exposes ?? [], isValidForScenes),
        endpoint: 11,
    },
};
