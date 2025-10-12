import type { Meta, StoryObj } from '@storybook/nextjs'
import { ThemeToggle } from './theme-toggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Theme/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
}