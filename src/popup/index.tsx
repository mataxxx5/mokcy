import { createRoot } from 'react-dom/client'

import { Main } from './panels'
import { LoadedMockProvider } from './hooks/loadedMockContext'
import { PreferencesProvider } from './hooks/preferencesContext'

import './index.scss'

const container = document.createElement('popup')
document.body.appendChild(container)

const root = createRoot(container)

root.render(
  <PreferencesProvider>
    <LoadedMockProvider>
      <Main />
    </LoadedMockProvider>
  </PreferencesProvider>
)
