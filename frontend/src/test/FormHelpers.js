import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const typeInField = async (label, value) => {
  await userEvent.type(screen.getByLabelText(label), value)
}

export const clickButton = async (name) => {
  await userEvent.click(screen.getByRole('button', { name }))
}

export const expectToSeeText = async (text) => {
  expect(await screen.findByText(text)).toBeInTheDocument()
}

export const expectNotToSeeText = (text) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument()
}
