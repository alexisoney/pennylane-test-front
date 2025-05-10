import { GetSearchCustomers, GetSearchProducts } from 'types'

export const getSearchCustomersMock: GetSearchCustomers = {
  pagination: { page: 1, page_size: 1, total_entries: 1, total_pages: 1 },
  customers: [
    {
      id: 6773,
      first_name: 'Jean',
      last_name: 'Dupont',
      address: '9 impasse Sauvey',
      zip_code: '50100',
      city: 'Cherbourg',
      country: 'France',
      country_code: 'FR',
    },
  ],
}

export const getSearchProductsMock: GetSearchProducts = {
  pagination: { page: 1, page_size: 1, total_entries: 1, total_pages: 1 },
  products: [
    {
      id: 67,
      label: 'Tesla Model S',
      vat_rate: '0',
      unit: 'hour',
      unit_price: '1980',
      unit_price_without_tax: '1800',
      unit_tax: '180',
    },
  ],
}
