import { Preferences } from '../popup/hooks/preferencesContext'
import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { LocalStorage } from '../store/storage/Storage'
import { isEqual } from 'lodash'

export default class PreferencesStore extends Store implements StoreInterface {
  preferences: Preferences | null

  constructor () {
    super(STORAGE_KEYS.PREFERENCE_SETTINGS, new LocalStorage())
    this.preferences = null

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.preferences, value.newValue)) {
        this.preferences = value.newValue
        console.log('[PreferencesStore] on change, new preferences data: ', this.preferences)

        this.registeredListeners.forEach((listenerCallback: Function) => {
          listenerCallback(this.preferences)
        })
      }
    })
  }

  async getAll (): Promise<Preferences | null> {
    if (this.initPromise != null) {
      const storedPreferences = await this.initPromise as unknown as Preferences
      this.initPromise = null

      if (storedPreferences !== undefined) {
        this.preferences = storedPreferences
      }
    }
    console.log('[PreferencesStore] getAll: ', this.preferences)
    return this.preferences
  }
}
