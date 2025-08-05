import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Feature from "../../components/features/Feature";
import FeatureWrapper from "../../components/features/FeatureWrapper";
import { BASIC_ROUTER } from "../devices";
import {
    binaryFeature,
    climateFeature,
    compositeFeature,
    coverFeature,
    enumFeature,
    fanFeature,
    lightFeature,
    listFeature,
    lockFeature,
    numericFeature,
    switchFeature,
    textFeature,
} from "../features";

const meta = {
    title: "Components/Features/List/Blank",
    tags: ["autodocs"],
    component: Feature,
    parameters: {
        layout: "full",
    },
    argTypes: {
        featureWrapperClass: { table: { disable: true } },
        minimal: { control: "boolean" },
        endpointSpecific: { control: "boolean" },
    },
    args: {
        device: { ...BASIC_ROUTER },
        onChange: fn(),
        onRead: fn(),
        featureWrapperClass: FeatureWrapper,
        // endpointSpecific?: boolean;
        // steps?: ValueWithLabelOrPrimitive[];
        parentFeatures: [],
        deviceState: {},
    },
    decorators: [
        (Story) => (
            <div className="list bg-base-100">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Feature>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Binary: Story = {
    args: {
        feature: { ...binaryFeature },
    },
};

export const Numeric: Story = {
    args: {
        feature: { ...numericFeature },
    },
};

export const Text: Story = {
    args: {
        feature: { ...textFeature },
    },
};

export const Enum: Story = {
    args: {
        feature: { ...enumFeature },
    },
};

export const List: Story = {
    args: {
        feature: { ...listFeature },
    },
};

export const Composite: Story = {
    args: {
        feature: { ...compositeFeature },
    },
};

export const Light: Story = {
    args: {
        feature: { ...lightFeature },
    },
};

export const Switch: Story = {
    args: {
        feature: { ...switchFeature },
    },
};

export const Lock: Story = {
    args: {
        feature: { ...lockFeature },
    },
};

export const Cover: Story = {
    args: {
        feature: { ...coverFeature },
    },
};

export const Fan: Story = {
    args: {
        feature: { ...fanFeature },
    },
};

export const Climate: Story = {
    args: {
        feature: { ...climateFeature },
    },
};

export const WithEndpoint: Story = {
    args: {
        feature: { ...lightFeature, features: [...lightFeature.features.map((f) => ({ ...f, endpoint: "back" }))], endpoint: "back" },
        endpointSpecific: false,
    },
};
