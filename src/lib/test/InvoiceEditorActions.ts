import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export async function selectCustomer() {
  await userEvent.click(screen.getByLabelText(/customer/i))
  await userEvent.click(await screen.findByText(/^jean\sdupont$/i))
}

export async function selectProduct() {
  await userEvent.click(screen.getByLabelText(/product/i))
  await userEvent.click(await screen.findByText(/^tesla\smodel\ss$/i))
}

export async function setQuantity() {
  await userEvent.type(screen.getByLabelText(/quantity/i), '1')
}

export async function submitForm() {
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
}

export async function submitFormAsFinalized() {
  await userEvent.click(screen.getByRole('button', { name: /finalize/i }))
}
