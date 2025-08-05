import type { Meta, StoryObj } from "@storybook/react-vite";
import HeaderGroupSelector from "../../components/group-page/HeaderGroupSelector";
import { EMPTY_GROUP, GROUP_WITH_MEMBERS, GROUP_WITH_MEMBERS_AND_SCENES } from "../groups";

const meta = {
    title: "Components/Group/HeaderGroupSelector",
    tags: ["autodocs"],
    component: HeaderGroupSelector,
    argTypes: {
        tab: { control: "select", options: ["devices", "settings"] },
    },
    args: {
        groups: [],
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
    args: {
        groups: [{ ...EMPTY_GROUP }, { ...GROUP_WITH_MEMBERS }, { ...GROUP_WITH_MEMBERS_AND_SCENES }],
    },
};

export const WithCurrent: Story = {
    args: {
        currentGroup: { ...GROUP_WITH_MEMBERS },
        groups: [{ ...EMPTY_GROUP }, { ...GROUP_WITH_MEMBERS }, { ...GROUP_WITH_MEMBERS_AND_SCENES }],
    },
};
