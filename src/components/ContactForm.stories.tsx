import type { Meta, StoryObj } from '@storybook/nextjs'
import ContactForm from './ContactForm'

const meta: Meta<typeof ContactForm> = {
  title: 'Components/ContactForm',
  component: ContactForm,
  parameters: {
    layout: 'centered',
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