import type { Meta, StoryObj } from "@storybook/react-vite";
import HeaderGroupSelector from "../../components/group-page/HeaderGroupSelector.js";
import { useAppStore } from "../../store.js";
import { EMPTY_GROUP, GROUP_WITH_MEMBERS, GROUP_WITH_MEMBERS_AND_SCENES } from "../groups.js";

const meta = {
    title: "Components/Group/HeaderGroupSelector",
    tags: ["autodocs"],
    component: HeaderGroupSelector,
    argTypes: {
        currentSourceIdx: { control: "number" },
        tab: { control: "select", options: ["devices", "settings"] },
    },
    args: {
        currentSourceIdx: 0,
        currentGroup: undefined,
    },
    decorators: [(Story) => <Story />],
} satisfies Meta<typeof HeaderGroupSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blank: Story = {
    args: {},
};

export const Basic: Story = {
    args: {},
    beforeEach: () => {
        useAppStore.setState({ groups: { 0: [{ ...EMPTY_GROUP }, { ...GROUP_WITH_MEMBERS }, { ...GROUP_WITH_MEMBERS_AND_SCENES }] } });

        return () => {
            useAppStore.getState().reset();
        };
    },
};

export const WithCurrent: Story = {
    args: {
        currentGroup: { ...GROUP_WITH_MEMBERS },
    },
    beforeEach: () => {
        useAppStore.setState({ groups: { 0: [{ ...EMPTY_GROUP }, { ...GROUP_WITH_MEMBERS }, { ...GROUP_WITH_MEMBERS_AND_SCENES }] } });

        return () => {
            useAppStore.getState().reset();
        };
    },
};
