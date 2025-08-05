import type { Meta, StoryObj } from "@storybook/react-vite";
import AddDeviceToGroup from "../../components/group-page/AddDeviceToGroup";
import { BASIC_ENDDEVICE, BASIC_ROUTER, OTHER_ROUTER } from "../devices";
import { EMPTY_GROUP } from "../groups";

const meta = {
    title: "Components/Group/AddDeviceToGroup",
    tags: ["autodocs"],
    component: AddDeviceToGroup,
    argTypes: {},
    args: {
        devices: [],
        group: { ...EMPTY_GROUP },
    },
    decorators: [(Story) => <Story />],
} satisfies Meta<typeof AddDeviceToGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blank: Story = {
    args: {},
};

export const Basic: Story = {
    args: {
        devices: [{ ...BASIC_ROUTER }, { ...BASIC_ENDDEVICE }, { ...OTHER_ROUTER }],
    },
};
