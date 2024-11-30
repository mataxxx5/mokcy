import React, {
  useContext,
  useState,
  createContext,
  useEffect
} from 'react'

import { DEFAULT_RESOURCE_TYPES, DEFAULT_URL_MATCHER_TYPE } from '../../constants'
import { PreferencesStore } from '../../store'

export interface Preferences {
  urlMatching: string
  resourceTypes: string[]
}

interface PreferencesContextValue {
  preferences: Preferences | null
  setPreferences: React.Dispatch<React.SetStateAction<Preferences | null>> | Function
}

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: null,
  setPreferences: () => {}
})

interface Props {
  children: React.ReactNode
}

const preferencesStore = new PreferencesStore()

const PreferencesProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<null | Preferences>(null)

  useEffect(() => { // reacts to updates made to store
    preferencesStore.registerUpdateLister((newPreferencesValue: Preferences) => {
      setState(newPreferencesValue)
    })
  }, [])

  useEffect(() => { // initialise context with what's already in the store
    preferencesStore.getAll().then((initialPreferencesValue) => {
      console.log('[Preferences] setting initial value for preferences context: ', initialPreferencesValue)
      if (initialPreferencesValue === null) {
        preferencesStore.store({
          resourceTypes: DEFAULT_RESOURCE_TYPES,
          urlMatching: DEFAULT_URL_MATCHER_TYPE
        })
      } else {
        setState(initialPreferencesValue)
      }
    })
  }, [])

  const value: PreferencesContextValue = {
    preferences: state,
    setPreferences: (newPreferenceValue: Preferences) => { preferencesStore.store(newPreferenceValue) }
  }

  return (
    <PreferencesContext.Provider value={value} >
      {children}
    </PreferencesContext.Provider>
  )
}

const usePreferences = () => {
  const context = useContext(PreferencesContext)

  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }

  return context
}

export { PreferencesProvider, usePreferences }
