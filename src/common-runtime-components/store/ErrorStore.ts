
import { STORAGE_KEYS } from '../../popup/constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from '../storage'
import { isEqual } from 'lodash'

export default class ErrorStore extends Store implements StoreInterface {
  errorData: string | undefined

  constructor () {
    super(STORAGE_KEYS.RUNTIME_ERRORS, new SessionStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log('in a listenere.....')
      const [key, value] = Object.entries(changes)[0]
      console.log('[ErrorStore] on change, key, value]: ', key, value)
      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.errorData, value.newValue)) {
        this.errorData = value.newValue as string
        console.log('[ErrorStore] on change, new error data: ', value)

        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          console.log('[ErrorStore]: Running callback with: ', this.errorData)
          listenerCallback(this.errorData)
        })
      }
    })
  }

  async getAll (): Promise<string | undefined> {
    if (this.initPromise != null) {
      this.errorData = await this.initPromise as unknown as string
      this.initPromise = null
    }
    console.log('[RuntimeStore] getAll: ', this.errorData)
    return this.errorData
  }
}
