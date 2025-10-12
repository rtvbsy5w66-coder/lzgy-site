import type { Meta, StoryObj } from '@storybook/nextjs'
import HirekSzekcio from './HirekSzekcio'

const meta: Meta<typeof HirekSzekcio> = {
  title: 'Components/HirekSzekcio',
  component: HirekSzekcio,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
}