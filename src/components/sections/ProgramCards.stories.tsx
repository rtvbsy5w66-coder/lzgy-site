import type { Meta, StoryObj } from '@storybook/nextjs'
import ProgramCards from './ProgramCards'

const meta: Meta<typeof ProgramCards> = {
  title: 'Sections/ProgramCards',
  component: ProgramCards,
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