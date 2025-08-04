import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DeviceControlGroup from "../components/device/DeviceControlGroup";
import { InterviewState } from "../consts";
import { baseRouter } from "./devices";

const meta = {
    title: "Components/Device/DeviceControlGroup",
    tags: ["autodocs"],
    component: DeviceControlGroup,
    argTypes: {},
    // onChange, onRead, device, endpoint, deviceState, lastSeenConfig, features, featureWrapperClass, children
    args: {
        device: { ...baseRouter },
        state: undefined,
        homeassistantEnabled: false,
        renameDevice: fn(),
        configureDevice: fn(),
        interviewDevice: fn(),
        removeDevice: fn(),
    },
} satisfies Meta<typeof DeviceControlGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {},
};

export const InterviewPending: Story = {
    args: {
        device: {
            ...baseRouter,
            interview_state: InterviewState.Pending,
        },
    },
};

export const InterviewInProgress: Story = {
    args: {
        device: {
            ...baseRouter,
            interview_state: InterviewState.InProgress,
        },
    },
};

export const OtaUpdating: Story = {
    args: {
        device: {
            ...baseRouter,
        },
        state: {
            update: {
                state: "updating",
                installed_version: 1,
                latest_version: 2,
            },
        },
    },
};
