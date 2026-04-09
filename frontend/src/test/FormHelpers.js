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

export const getByRoleAndName = (role, name) => {
  return screen.getByRole(role, { name })
}

export const expectToSeeRole = (role, name) => {
  expect(screen.getByRole(role, { name })).toBeInTheDocument()
}

export const expectNotToSeeRole = (role, name) => {
  expect(screen.queryByRole(role, { name })).not.toBeInTheDocument()
}

export const expectToSeeTestId = (testId) => {
  expect(screen.getByTestId(testId)).toBeInTheDocument()
}

export const expectLinkToPointTo = (name, href) => {
  expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
}

export const expectToSeeTextSync = (text) => {
  expect(screen.getByText(text)).toBeInTheDocument()
}
