import React, {
  useContext,
  useState,
  createContext,
  useEffect
} from 'react'
import { Request, Response } from 'har-format'
import { NetworkMockStore } from '../../store'

export type ErrorResponse = Response & {
  _error: string
}
export interface MockData {
  requests: Record<string, Request>
  responses: Record<string, Response | ErrorResponse>
  mockName: string
  firstPageURL: string
}

interface LoadedMockContextValue {
  loadedMock: MockData | null
  setLoadedMock: React.Dispatch<React.SetStateAction<MockData | null | string>> | Function
}

const LoadedMockContext = createContext<LoadedMockContextValue>({
  loadedMock: null,
  setLoadedMock: () => {}
})

const networkStore = new NetworkMockStore()

function LoadedMockProvider ({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<null | MockData>(null)

  useEffect(() => { // reacts to updates made to store
    networkStore.registerUpdateLister((newNetworkMock: MockData) => {
      console.log('[LoadedMockContext] mocks were changed: ', newNetworkMock)
      setState(newNetworkMock)
    })
  }, [])

  useEffect(() => { // initialise context with what's already in the store
    networkStore.getAll().then((initialNetworkMock: MockData | null) => {
      console.log('[LoadedMockContext] setting initial value for mock context: ', initialNetworkMock)
      setState(initialNetworkMock)
    })
  }, [])

  const value: LoadedMockContextValue = {
    loadedMock: state,
    setLoadedMock: (newMockData: MockData) => { 
      console.log('[LoadedMockContext] storing new mock: ', newMockData)
      networkStore.store(newMockData)
    }
  }

  return (
    <LoadedMockContext.Provider value={value} >
      {children}
    </LoadedMockContext.Provider>
  )
}

function useLoadedMock () {
  const context = useContext(LoadedMockContext)

  if (context === undefined) {
    throw new Error('useLoadedMock must be used within a LoadedMockProvider')
  }

  return context
}

export { LoadedMockProvider, useLoadedMock }
