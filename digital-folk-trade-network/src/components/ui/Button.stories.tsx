import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    label: "Click me",
    variant: "primary",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary", label: "Secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost", label: "Ghost" },
};

export const Loading: Story = {
  args: { isLoading: true, label: "Processing" },
};

export const WithIcons: Story = {
  args: {
    label: "Continue",
    rightIcon: <span aria-hidden="true">→</span>,
  },
};
