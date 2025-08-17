import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DashboardFeatureWrapper from "../../components/dashboard-page/DashboardFeatureWrapper.js";
import { isValidForDashboard } from "../../components/dashboard-page/index.js";
import DeviceCard from "../../components/device/DeviceCard.js";
import { isValidForScenes } from "../../components/device-page/index.js";
import { filterExposes } from "../../utils.js";
import {
    BASIC_ENDDEVICE,
    BASIC_ENDDEVICE_STATE,
    BASIC_ROUTER,
    BASIC_ROUTER_STATE,
    COMPLEX_EXPOSES_ENDDEVICE,
    COMPLEX_EXPOSES_ENDDEVICE_STATE,
    MULTI_ENDPOINT_ROUTER,
    MULTI_ENDPOINT_ROUTER_STATE,
    OTHER_ROUTER,
    OTHER_ROUTER_STATE,
} from "../devices.js";

const meta = {
    title: "Components/Device/DeviceCard",
    tags: ["autodocs"],
    component: DeviceCard,
    argTypes: {
        featureWrapperClass: { table: { disable: true } },
        endpoint: { control: "number" },
    },
    args: {
        sourceIdx: 0,
        device: { ...BASIC_ROUTER },
        endpoint: undefined,
        deviceState: {},
        lastSeenConfig: "ISO_8601_local",
        features: [],
        featureWrapperClass: DashboardFeatureWrapper,
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
        deviceState: {
            ...BASIC_ROUTER_STATE,
            linkquality: 245,
            last_seen: new Date(Date.now() - 1000 * 3700).toLocaleString(),
        },
        features: filterExposes(BASIC_ROUTER.definition?.exposes ?? [], isValidForDashboard),
    },
};

export const WithChildren: Story = {
    args: {
        device: { ...BASIC_ENDDEVICE },
        deviceState: {
            ...BASIC_ENDDEVICE_STATE,
            linkquality: 175,
            last_seen: new Date(Date.now() - 1000 * 40).toLocaleString(),
        },
        features: filterExposes(BASIC_ENDDEVICE.definition?.exposes ?? [], isValidForDashboard),
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
        deviceState: {
            ...OTHER_ROUTER_STATE,
            linkquality: 150,
            last_seen: new Date(Date.now() - 1000 * 600000).toLocaleString(),
        },
        device: { ...OTHER_ROUTER },
        features: filterExposes(OTHER_ROUTER.definition?.exposes ?? [], isValidForDashboard),
    },
};

export const SceneFeatures: Story = {
    args: {
        deviceState: {
            ...OTHER_ROUTER_STATE,
            linkquality: 125,
            last_seen: new Date(Date.now() - 1000 * 600).toLocaleString(),
        },
        device: { ...OTHER_ROUTER },
        features: filterExposes(OTHER_ROUTER.definition?.exposes ?? [], isValidForScenes),
    },
};

export const ComplexDashboardFeatures: Story = {
    args: {
        deviceState: {
            ...COMPLEX_EXPOSES_ENDDEVICE_STATE,
            linkquality: 100,
            last_seen: new Date(Date.now() - 1000 * 600000).toLocaleString(),
        },
        device: { ...COMPLEX_EXPOSES_ENDDEVICE },
        features: filterExposes(COMPLEX_EXPOSES_ENDDEVICE.definition?.exposes ?? [], isValidForDashboard),
    },
};

export const ComplexSceneFeatures: Story = {
    args: {
        deviceState: {
            ...COMPLEX_EXPOSES_ENDDEVICE_STATE,
            linkquality: 75,
            last_seen: new Date(Date.now() - 1000 * 600).toLocaleString(),
        },
        device: { ...COMPLEX_EXPOSES_ENDDEVICE },
        features: filterExposes(COMPLEX_EXPOSES_ENDDEVICE.definition?.exposes ?? [], isValidForScenes),
    },
};

export const EndpointDashboardFeatures: Story = {
    args: {
        deviceState: {
            ...MULTI_ENDPOINT_ROUTER_STATE,
            linkquality: 50,
        },
        device: { ...MULTI_ENDPOINT_ROUTER },
        features: filterExposes(MULTI_ENDPOINT_ROUTER.definition?.exposes ?? [], isValidForDashboard),
        endpoint: 11,
    },
};

export const EndpointSceneFeatures: Story = {
    args: {
        deviceState: {
            ...MULTI_ENDPOINT_ROUTER_STATE,
            linkquality: 25,
        },
        device: { ...MULTI_ENDPOINT_ROUTER },
        features: filterExposes(MULTI_ENDPOINT_ROUTER.definition?.exposes ?? [], isValidForScenes),
        endpoint: 11,
    },
};
