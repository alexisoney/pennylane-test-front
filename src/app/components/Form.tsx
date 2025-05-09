import { ComponentPropsWithoutRef } from 'react'

type ErrorProps = ComponentPropsWithoutRef<'span'>

function Error(props: ErrorProps) {
  if (props.children)
    return (
      <span {...props} className={['text-danger', props.className].join(' ')} />
    )

  return null
}

function Label(props: ComponentPropsWithoutRef<'label'>) {
  return (
    <label {...props} className={['form-label', props.className].join(' ')} />
  )
}

export const Form = {
  Error,
  Label,
}
