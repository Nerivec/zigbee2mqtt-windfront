import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/internal/test";
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
                ...baseRouter.definition!,
                model: "unknown",
            },
        },
    },
};

export const BadDefinitionIcon: Story = {
    args: {
        device: {
            ...baseRouter,
            definition: {
                ...baseRouter.definition!,
                // should get a 404 in console, but falls back to definition.model
                icon: "unknown.png",
            },
        },
    },
    play: async ({ canvas }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const img = canvas.getByRole<HTMLImageElement>("img");

        expect(img.src).toContain(baseRouter.definition?.model);
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
                ...baseRouter.definition!,
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
                ...baseRouter.definition!,
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
