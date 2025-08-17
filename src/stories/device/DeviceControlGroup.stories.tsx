import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import DeviceControlGroup from "../../components/device/DeviceControlGroup.js";
import { InterviewState } from "../../consts.js";
import { BASIC_ROUTER } from "../devices.js";

const meta = {
    title: "Components/Device/DeviceControlGroup",
    tags: ["autodocs"],
    component: DeviceControlGroup,
    argTypes: {
        otaState: { control: "text" },
    },
    args: {
        sourceIdx: 0,
        device: { ...BASIC_ROUTER },
        otaState: undefined,
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
            ...BASIC_ROUTER,
            interview_state: InterviewState.Pending,
        },
    },
    play: ({ canvas }) => {
        const btns = canvas.getAllByRole<HTMLButtonElement>("button");

        expect(btns[1].disabled).toStrictEqual(true);
        expect(btns[2].disabled).toStrictEqual(true);
    },
};

export const InterviewInProgress: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
            interview_state: InterviewState.InProgress,
        },
    },
    play: InterviewPending.play,
};

export const OtaUpdating: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
        },
        otaState: "updating",
    },
    play: InterviewPending.play,
};
