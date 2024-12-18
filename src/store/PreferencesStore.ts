import { Preferences } from '../popup/hooks/preferencesContext'
import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { LocalStorage } from '../store/storage/Storage'

export default class PreferencesStore extends Store implements StoreInterface {

  constructor () {
    super(STORAGE_KEYS.PREFERENCE_SETTINGS, new LocalStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType()) {
        console.log('[PreferencesStore] on change, new preferences data: ', value.newValue)

        this.registeredListeners.forEach((listenerCallback: Function) => {
          listenerCallback(value.newValue)
        })
      }
    })
  }

  async getAll (): Promise<Preferences | null> {
    const storedPreferences = await this.retrieve();
    console.log('[PreferencesStore] getAll: ', storedPreferences)
    return storedPreferences;
  }
}
