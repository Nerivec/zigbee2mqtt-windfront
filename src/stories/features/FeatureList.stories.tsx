import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Feature from "../../components/features/Feature";
import FeatureWrapper from "../../components/features/FeatureWrapper";
import { BASIC_ROUTER } from "../devices";
import {
    binaryFeature,
    binaryFeatureState,
    climateFeature,
    climateFeatureState,
    compositeFeature,
    compositeFeatureState,
    coverFeature,
    coverFeatureState,
    enumFeature,
    enumFeatureState,
    fanFeature,
    fanFeatureState,
    lightFeature,
    lightFeatureState,
    listFeature,
    listFeatureState,
    lockFeature,
    lockFeatureState,
    numericFeature,
    numericFeatureState,
    switchFeature,
    switchFeatureState,
    textFeature,
    textFeatureState,
} from "../features";

const meta = {
    title: "Components/Features/List",
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
        deviceState: { ...binaryFeatureState },
    },
};

export const Numeric: Story = {
    args: {
        feature: { ...numericFeature },
        deviceState: { ...numericFeatureState },
    },
};

export const Text: Story = {
    args: {
        feature: { ...textFeature },
        deviceState: { ...textFeatureState },
    },
};

export const Enum: Story = {
    args: {
        feature: { ...enumFeature },
        deviceState: { ...enumFeatureState },
    },
};

export const List: Story = {
    args: {
        feature: { ...listFeature },
        deviceState: { ...listFeatureState },
    },
};

export const Composite: Story = {
    args: {
        feature: { ...compositeFeature },
        deviceState: { ...compositeFeatureState },
    },
};

export const Light: Story = {
    args: {
        feature: { ...lightFeature },
        deviceState: { ...lightFeatureState },
    },
};

export const Switch: Story = {
    args: {
        feature: { ...switchFeature },
        deviceState: { ...switchFeatureState },
    },
};

export const Lock: Story = {
    args: {
        feature: { ...lockFeature },
        deviceState: { ...lockFeatureState },
    },
};

export const Cover: Story = {
    args: {
        feature: { ...coverFeature },
        deviceState: { ...coverFeatureState },
    },
};

export const Fan: Story = {
    args: {
        feature: { ...fanFeature },
        deviceState: { ...fanFeatureState },
    },
};

export const Climate: Story = {
    args: {
        feature: { ...climateFeature },
        deviceState: { ...climateFeatureState },
    },
};

export const WithEndpoint: Story = {
    args: {
        feature: { ...lightFeature, features: [...lightFeature.features.map((f) => ({ ...f, endpoint: "back" }))], endpoint: "back" },
        deviceState: { ...lightFeatureState },
        endpointSpecific: false,
    },
};
