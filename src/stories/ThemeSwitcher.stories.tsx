import type { Meta, StoryObj } from "@storybook/react-vite";
import ThemeSwitcher from "../components/ThemeSwitcher.js";

const meta = {
    title: "ThemeSwitcher",
    component: ThemeSwitcher,
    argTypes: {},
    args: {},
    decorators: [(Story) => <Story />],
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
    args: {},
};
