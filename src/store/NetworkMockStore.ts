import { MockData } from '../popup/hooks/loadedMockContext'
import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { LocalStorage } from '../store/storage'

export default class NetworkMockStore extends Store implements StoreInterface {

  constructor () {
    super(STORAGE_KEYS.NETWORK_MOCKS, new LocalStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log('[NetworkMockStore] chrome.storage.onChanged: ', changes, areaName )
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType()) {
        console.log('[NetworkMockStore] on change, new mock data: ', value.newValue)

        this.registeredListeners.forEach((listenerCallback: Function) => {
          console.log('[NetworkMockStore]: Running callback with: ',  value.newValue)
          listenerCallback(value.newValue)
        })
      }
    })
  }

  async getAll (): Promise<MockData | null> {
    const storedMocks = await this.retrieve();
    console.log('[NetworkMockStore] getAll: ', storedMocks)
    return storedMocks;
  }
}
