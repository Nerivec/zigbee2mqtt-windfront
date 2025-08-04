import type { Meta, StoryObj } from "@storybook/react-vite";
import DeviceImage from "../components/device/DeviceImage";
import { InterviewState } from "../consts";
import { baseRouter } from "./devices";

const meta = {
    title: "Components/Device/DeviceImage",
    tags: ["autodocs"],
    component: DeviceImage,
    argTypes: {
        otaState: { control: "text" },
        noIndicator: { control: "boolean" },
    },
    args: {
        device: { ...baseRouter },
        otaState: undefined,
        disabled: false,
        className: "",
        noIndicator: undefined,
    },
    // decorators: [
    //     (Story) => (
    //         <div className="w-40">
    //             <Story />
    //         </div>
    //     ),
    // ],
} satisfies Meta<typeof DeviceImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {},
};

export const Generic: Story = {
    args: {
        device: {
            ...baseRouter,
            definition: {
                model: "unknown",
            },
        },
    },
};

export const BadDefinitionIcon: Story = {
    args: {
        device: {
            ...baseRouter,
            definition: { icon: "unknown.png" },
        },
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
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

export const InterviewFailed: Story = {
    args: {
        device: {
            ...baseRouter,
            interview_state: InterviewState.Failed,
        },
    },
};

export const NoIndicator: Story = {
    args: {
        device: {
            ...baseRouter,
            interview_state: InterviewState.Failed,
        },
        noIndicator: true,
    },
};

export const GeneratedDefinition: Story = {
    args: {
        device: {
            ...baseRouter,
            definition: {
                model: "unknown",
                source: "generated",
            },
            supported: false,
        },
    },
};

export const ExternalDefinition: Story = {
    args: {
        device: {
            ...baseRouter,
            definition: {
                model: "unknown",
                source: "external",
            },
        },
    },
};

export const OtaUpdating: Story = {
    args: {
        otaState: "updating",
    },
};

export const WithClassname: Story = {
    args: {
        className: "w-10",
    },
};
