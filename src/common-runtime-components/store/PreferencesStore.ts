import { Preferences } from '../../popup/hooks/preferencesContext'
import { STORAGE_KEYS, DEFAULT_RESOURCE_TYPES, DEFAULT_URL_MATCHER_TYPE } from '../../popup/constants'
import { Store } from './Store'
import { LocalStorage } from '../storage/Storage'
import { isEqual } from 'lodash'

export default class PreferencesStore extends Store implements Store {
  preferences: Preferences | undefined

  constructor () {
    super(STORAGE_KEYS.PREFERENCE_SETTINGS, new LocalStorage())
    this.store({
      resourceTypes: DEFAULT_RESOURCE_TYPES,
      urlMatching: DEFAULT_URL_MATCHER_TYPE
    })

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.preferences, value.newValue)) {
        this.preferences = value.newValue as Preferences
        console.log('[PreferencesStore] on change, new preferences data: ', this.preferences)

        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          console.log('[PreferencesStore]: Running callback with: ', this.preferences)
          listenerCallback(this.preferences)
        })
      }
    })
  }

  async getAll (): Promise<Preferences | undefined> {
    if (this.initPromise != null) {
      this.preferences = await this.initPromise as unknown as Preferences
      this.initPromise = null
    }
    console.log('[PreferencesStore] getAll: ', this.preferences)
    return this.preferences
  }
}
