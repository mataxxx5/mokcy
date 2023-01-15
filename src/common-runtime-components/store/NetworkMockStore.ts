import { MockData } from '../../popup/hooks/loadedMockContext'
import { STORAGE_KEYS } from '../../popup/constants'
import { StoreInterface, Store } from './Store'
import { LocalStorage } from '../storage'
import { isEqual } from 'lodash'

export default class NetworkMockStore extends Store implements StoreInterface {
  mocks: MockData | undefined

  constructor () {
    super(STORAGE_KEYS.NETWORK_MOCKS, new LocalStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.mocks, value.newValue)) {
        this.mocks = value.newValue as MockData
        console.log('[NetworkMockStore] on change, new runtime data: ', this.mocks)

        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          console.log('[NetworkMockStore]: Running callback with: ', this.mocks)
          listenerCallback(this.mocks)
        })
      }
    })
  }

  async getAll (): Promise<MockData | undefined> {
    if (this.initPromise != null) {
      this.mocks = await this.initPromise as unknown as MockData
      this.initPromise = null
    }
    console.log('[NetworkMockStore] getAll: ', this.mocks)
    return this.mocks
  }
}
