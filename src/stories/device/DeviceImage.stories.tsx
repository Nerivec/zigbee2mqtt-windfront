import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import DeviceImage from "../../components/device/DeviceImage";
import { InterviewState } from "../../consts";
import { BASIC_ROUTER } from "../devices";

const meta = {
    title: "Components/Device/DeviceImage",
    tags: ["autodocs"],
    component: DeviceImage,
    argTypes: {
        otaState: { control: "text" },
        noIndicator: { control: "boolean" },
    },
    args: {
        device: { ...BASIC_ROUTER },
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
            ...BASIC_ROUTER,
            definition: {
                ...BASIC_ROUTER.definition!,
                model: "unknown",
            },
        },
    },
};

export const BadDefinitionIcon: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
            definition: {
                ...BASIC_ROUTER.definition!,
                // should get a 404 in console, but falls back to definition.model
                icon: "unknown.png",
            },
        },
    },
    play: async ({ canvas }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const img = canvas.getByRole<HTMLImageElement>("img");

        expect(img.src).toContain(BASIC_ROUTER.definition?.model);
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
            ...BASIC_ROUTER,
            interview_state: InterviewState.InProgress,
        },
    },
};

export const InterviewFailed: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
            interview_state: InterviewState.Failed,
        },
    },
};

export const NoIndicator: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
            interview_state: InterviewState.Failed,
        },
        noIndicator: true,
    },
};

export const GeneratedDefinition: Story = {
    args: {
        device: {
            ...BASIC_ROUTER,
            definition: {
                ...BASIC_ROUTER.definition!,
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
            ...BASIC_ROUTER,
            definition: {
                ...BASIC_ROUTER.definition!,
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
