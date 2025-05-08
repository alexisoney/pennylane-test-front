import { ApiProvider } from 'api'
import { ReactNode } from 'react'

export function ApiProviderMock({ children }: { children: ReactNode }) {
  return (
    <ApiProvider url="" token="">
      {children}
    </ApiProvider>
  )
}
