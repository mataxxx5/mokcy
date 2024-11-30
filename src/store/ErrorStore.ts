
import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from './storage'
import { isEqual } from 'lodash'

export default class ErrorStore extends Store implements StoreInterface {
  errorData: string | null

  constructor () {
    super(STORAGE_KEYS.RUNTIME_ERRORS, new SessionStorage())
    this.errorData = null

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]
      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.errorData, value.newValue)) {
        this.errorData = value.newValue as string
        console.log('[ErrorStore] on change, new error data: ', value)

        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          listenerCallback(this.errorData)
        })
      }
    })
  }

  async getAll (): Promise<string | null> {
    if (this.initPromise != null) {
      this.errorData = await this.initPromise as unknown as string
      this.initPromise = null
    }
    console.log('[RuntimeStore] getAll: ', this.errorData)
    return this.errorData
  }
}
