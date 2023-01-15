import React, {
  useContext,
  useState,
  createContext,
  useEffect
} from 'react'
import { Request, Response } from 'har-format'
import { NetworkMockStore } from '../../common-runtime-components/store'

export interface MockData {
  requests: Record<string, Request>
  responses: Record<string, Response>
  mockName: string
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
  const [state, setState] = useState<null | MockData | undefined>(null)

  useEffect(() => { // reacts to updates made to store
    networkStore.registerUpdateLister('settingMocks', (newNetworkMock: MockData) => {
      setState(newNetworkMock)
    })
  }, [])

  useEffect(() => { // initialise context with what's already in the store
    networkStore.getAll().then((initialNetworkMock: MockData | undefined) => {
      console.log('[MockData] setting initial value for mock context: ', initialNetworkMock)
      setState(initialNetworkMock)
    })
  }, [])

  const value = {
    loadedMock: state,
    setLoadedMock: (newMockData: MockData) => { networkStore.store(newMockData) }
  } as LoadedMockContextValue

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
