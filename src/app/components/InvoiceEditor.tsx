import DatePicker from 'react-datepicker'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { useApi } from 'api'
import { to_YYYY_MM_DD } from 'lib/utils/date'

import { Form } from './Form'
import CustomerAutocomplete from './CustomerAutocomplete'
import ProductAutocomplete from './ProductAutocomplete'

import type { Customer, Product } from 'types'
import type { Components } from 'api/gen/client'

import 'react-datepicker/dist/react-datepicker.css'

type FormValues = {
  customer: Customer | null
  date?: Date
  deadline?: Date
  lines: {
    product: Product | null
    quantity: number
    label?: string
    unit?: Components.Schemas.Unit
    price?: number
    tax?: number
  }[]
}

export function InvoiceEditor() {
  const api = useApi()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormValues>({
    defaultValues: {
      customer: null,
      lines: [{ product: null }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  async function onSubmit(data: FormValues) {
    await api.postInvoices(null, {
      invoice: {
        customer_id: data.customer?.id as number,
        date: to_YYYY_MM_DD(data.date),
        deadline: to_YYYY_MM_DD(data.deadline),
        invoice_lines_attributes: data.lines.map(({ product, ...attr }) => ({
          product_id: product?.id as number,
          ...attr,
        })),
      },
    })
  }

  return (
    <>
      {isSubmitSuccessful && (
        <div className="alert alert-success" role="alert">
          Invoice Created!
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Form.Label htmlFor="customer">Customer</Form.Label>
          <Controller
            control={control}
            name="customer"
            rules={{ required: 'Customer is required' }}
            render={({ field }) => (
              <CustomerAutocomplete
                inputId="customer"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Form.Error>{errors.customer?.message}</Form.Error>
        </div>
        <div>
          <Form.Label htmlFor="date">Date</Form.Label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DatePicker
                id="date"
                selected={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div>
          <Form.Label htmlFor="deadline">Deadline</Form.Label>
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => (
              <DatePicker
                id="deadline"
                selected={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        {fields.map((field, index) => (
          <div key={field.id}>
            <div>
              <Form.Label htmlFor={`lines.${index}.product`}>
                Product
              </Form.Label>
              <Controller
                control={control}
                name={`lines.${index}.product`}
                rules={{ required: 'Product is required' }}
                render={({ field }) => (
                  <ProductAutocomplete
                    inputId={`lines.${index}.product`}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <Form.Error>{errors.lines?.[index]?.product?.message}</Form.Error>
            <div>
              <label htmlFor={`lines.${index}.label`}>Label</label>
              <input
                {...register(`lines.${index}.label`)}
                id={`lines.${index}.label`}
              />
            </div>
            <div>
              <label htmlFor={`lines.${index}.quantity`}>Quantity</label>
              <input
                {...register(`lines.${index}.quantity`, {
                  required: 'Quantity is required',
                  valueAsNumber: true,
                })}
                id={`lines.${index}.quantity`}
                type="number"
              />
              <Form.Error>
                {errors.lines?.[index]?.quantity?.message}
              </Form.Error>
            </div>
            <div>
              <label htmlFor={`lines.${index}.unit`}>Unit</label>
              <select
                {...register(`lines.${index}.unit`)}
                id={`lines.${index}.unit`}
              >
                <option value="">-</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="piece">Piece</option>
              </select>
            </div>
            <div>
              <label htmlFor={`lines.${index}.price`}>Price</label>
              <input
                {...register(`lines.${index}.price`)}
                id={`lines.${index}.price`}
                type="number"
              />
            </div>
            <div>
              <label htmlFor={`lines.${index}.tax`}>Tax</label>
              <input
                {...register(`lines.${index}.tax`)}
                id={`lines.${index}.tax`}
                type="number"
              />
            </div>
            {index > 0 && (
              <button type="button" onClick={() => remove(index)}>
                DELETE
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ product: null, quantity: 1 })}
        >
          APPEND
        </button>

        <button className="btn btn-primary">Submit</button>
      </form>
    </>
  )
}
