import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import Card from "./Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  args: {
    title: "Featured artisan",
    subtitle: "Handmade craft spotlight",
    children: (
      <p>
        Highlight a maker, project, or announcement here. Cards keep the typography
        consistent across dashboards.
      </p>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};

export const Muted: Story = {
  args: { tone: "muted", title: "Muted card" },
};

export const HighlightWithActions: Story = {
  args: {
    tone: "highlight",
    actions: <Button label="View profile" size="sm" />,
  },
};
