
import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from './storage'


export default class ErrorStore extends Store implements StoreInterface {
  constructor () {
    super(STORAGE_KEYS.RUNTIME_ERRORS, new SessionStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]
      if (key === this.nameSpace && areaName === this.storage.getType() ) {
        console.log('[ErrorStore] on change, new error data: ', value.newValue)

        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          listenerCallback(value.newValue )
        })
      }
    })
  }

  async getAll (): Promise<string | null> {
    const storedErrorData = await this.retrieve();
    console.log('[ErrorStore] getAll: ', storedErrorData)
    return storedErrorData
  }
}
