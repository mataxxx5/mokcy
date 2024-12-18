import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from '../store/storage/Storage'

export interface RuntimeData {
  mockingInProgress: boolean
}

export default class RuntimeStore extends Store implements StoreInterface {

  constructor () {
    super(STORAGE_KEYS.RUNTIME_EVENTS, new SessionStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType()) {
        console.log('[RuntimeStore] on change, new runtime data: ', value.newValue)

        this.registeredListeners.forEach((listenerCallback: Function, i: number) => {
          listenerCallback(value.newValue)
        })
      }
    })
  }

  async getAll (): Promise<RuntimeData | null> {
    const storedRuntimeData = await this.retrieve();
    console.log('[RuntimeStore] getAll: ', storedRuntimeData)
    return storedRuntimeData
  }
}
