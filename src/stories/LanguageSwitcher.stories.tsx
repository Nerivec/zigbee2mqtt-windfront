import type { Meta, StoryObj } from "@storybook/react-vite";
import LanguageSwitcher from "../components/navbar/LanguageSwitcher";

const meta = {
    title: "LanguageSwitcher",
    component: LanguageSwitcher,
    argTypes: {},
    args: {},
    decorators: [(Story) => <Story />],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
    args: {},
};
