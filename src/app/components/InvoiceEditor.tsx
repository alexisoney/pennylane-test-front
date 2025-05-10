import { useCallback, useState } from 'react'
import DatePicker from 'react-datepicker'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useApi } from 'api'

import { Form } from './Form'
import CustomerAutocomplete from './CustomerAutocomplete'
import ProductAutocomplete from './ProductAutocomplete'

import type { Customer, Product, Unit } from 'types'

import 'react-datepicker/dist/react-datepicker.css'

export type InvoiceEditorData = {
  customer: Customer | null
  finalized: string
  date?: Date
  deadline?: Date
  lines: {
    product: Product | null
    quantity: number
    label?: string
    unit?: Unit
    price?: number | string
    tax?: number | string
  }[]
}

type InvoiceEditorProps = {
  id?: number
  onSubmit: (data: InvoiceEditorData) => Awaited<void>
  defaultValues?: InvoiceEditorData
}

export function InvoiceEditor({
  id,
  onSubmit,
  defaultValues,
}: InvoiceEditorProps) {
  const api = useApi()

  const [isDeleted, setIsDeleted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    setError,
    setValue,
    watch,
  } = useForm<InvoiceEditorData>({
    defaultValues: {
      finalized: 'false',
      customer: null,
      lines: [{ product: null }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  const isFinalized = watch('finalized') === 'true'

  const setRootError = useCallback(() => {
    setError('root', { message: 'Oups! Something went wrong. Try again.' })
  }, [setError])

  const deleteInvoice = useCallback(async () => {
    try {
      if (!id) throw Error('ID is required')
      if (window.confirm('Do you want to delete this invoice?') === true) {
        await api.deleteInvoice({ id })
        setIsDeleted(true)
      }
    } catch (error) {
      setRootError()
    }
  }, [setRootError, api, id])

  async function onSubmitMiddleware(data: InvoiceEditorData) {
    try {
      await onSubmit(data)
    } catch (error) {
      setRootError()
    }
  }

  function saveDraft() {
    handleSubmit(onSubmitMiddleware)()
  }

  function finalize() {
    setValue('finalized', 'true')
    handleSubmit(onSubmitMiddleware)()
  }

  return (
    <>
      {isSubmitSuccessful && (
        <div className="alert alert-success" role="alert">
          Invoice Created!
        </div>
      )}

      {isDeleted && (
        <div className="alert alert-success" role="alert">
          Invoice Deleted!
        </div>
      )}

      {!!errors.root && (
        <div className="alert alert-danger" role="alert">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitMiddleware)}>
        <input hidden type="text" {...register('finalized')} />
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
                isDisabled={!!isFinalized}
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
                readOnly={!!isFinalized}
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
                readOnly={!!isFinalized}
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
                    isDisabled={!!isFinalized}
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
                readOnly={!!isFinalized}
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
                readOnly={!!isFinalized}
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
                disabled={!!isFinalized}
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
                readOnly={!!isFinalized}
              />
            </div>
            <div>
              <label htmlFor={`lines.${index}.tax`}>Tax</label>
              <input
                {...register(`lines.${index}.tax`)}
                id={`lines.${index}.tax`}
                type="number"
                readOnly={!!isFinalized}
              />
            </div>
            {index > 0 && !isFinalized && (
              <button type="button" onClick={() => remove(index)}>
                DELETE
              </button>
            )}
          </div>
        ))}

        {!isFinalized && (
          <button
            type="button"
            onClick={() => append({ product: null, quantity: 1 })}
          >
            APPEND
          </button>
        )}

        {!isFinalized && (
          <>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={saveDraft}
            >
              Submit
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={finalize}
            >
              Finalize
            </button>
          </>
        )}

        <button
          className="btn btn-danger"
          type="button"
          onClick={deleteInvoice}
        >
          Trash
        </button>
      </form>
    </>
  )
}
