import { Components, OperationMethods } from 'api/gen/client'
import { Awaited } from './helpers'

export type Invoice = Awaited<
  ReturnType<OperationMethods['getInvoices']>
>['data']['invoices'][0]

export type InvoiceCreatePayload = Components.Schemas.InvoiceCreatePayload

export type InvoiceLine = NonNullable<
  InvoiceCreatePayload['invoice_lines_attributes']
>[0]

export type Product = Awaited<
  ReturnType<OperationMethods['getSearchProducts']>
>['data']['products'][0]

export type GetSearchProducts = Awaited<
  ReturnType<OperationMethods['getSearchProducts']>
>['data']

export type Customer = Awaited<
  ReturnType<OperationMethods['getSearchCustomers']>
>['data']['customers'][0]

export type GetSearchCustomers = Awaited<
  ReturnType<OperationMethods['getSearchCustomers']>
>['data']

export type Unit = Components.Schemas.Unit

export type Filter = {
  field: 'customer_id'
  operator: 'eq'
  value: string | number
}[]
