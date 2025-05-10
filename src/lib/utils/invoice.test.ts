import { InvoiceCreatePayload } from 'types'
import { toApiPayload } from './invoice'
import { InvoiceEditorData } from 'app/components/InvoiceEditor'

describe('Invoice', () => {
  describe('toApiPayload', () => {
    it('throws an error if customer is missing', () => {
      const payload = { customer: null, lines: [] }
      expect(() => toApiPayload(payload)).toThrowError('Customer is required')
    })

    it('throws an error if product is missing', () => {
      const payload = {
        customer: {
          id: 6773,
          first_name: 'Jean',
          last_name: 'Dupont',
          address: '9 impasse Sauvey',
          zip_code: '50100',
          city: 'Cherbourg',
          country: 'France',
          country_code: 'FR',
        },
        lines: [
          {
            product: null,
            quantity: 1,
          },
        ],
      }
      expect(() => toApiPayload(payload)).toThrowError('Product is required')
    })

    it('returns a formatted API payload', () => {
      const payload: InvoiceEditorData = {
        customer: {
          id: 6773,
          first_name: 'Jean',
          last_name: 'Dupont',
          address: '9 impasse Sauvey',
          zip_code: '50100',
          city: 'Cherbourg',
          country: 'France',
          country_code: 'FR',
        },
        date: new Date('2021-02-03'),
        deadline: new Date('2021-02-03'),
        lines: [
          {
            product: {
              id: 67,
              label: 'Tesla Model S',
              vat_rate: '0',
              unit: 'hour',
              unit_price: '1980',
              unit_price_without_tax: '1800',
              unit_tax: '180',
            },
            quantity: 1,
            label: 'Tesla Model S with Pennylane logo',
            unit: 'piece',
            price: 18450,
            tax: 20,
          },
        ],
      }

      const output: InvoiceCreatePayload = {
        customer_id: 6773,
        date: '2021-02-03',
        deadline: '2021-02-03',
        invoice_lines_attributes: [
          {
            product_id: 67,
            label: 'Tesla Model S with Pennylane logo',
            unit: 'piece',
            price: 18450,
            tax: 20,
            quantity: 1,
          },
        ],
      }

      expect(toApiPayload(payload)).toStrictEqual(output)
    })
  })
})
