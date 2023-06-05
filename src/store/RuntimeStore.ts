import { STORAGE_KEYS } from '../constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from '../store/storage/Storage'
import { isEqual } from 'lodash'

export interface RuntimeData {
  mockingInProgress: boolean
}

export default class RuntimeStore extends Store implements StoreInterface {
  runtimeData: RuntimeData | null

  constructor () {
    super(STORAGE_KEYS.RUNTIME_EVENTS, new SessionStorage())
    this.runtimeData = null

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.runtimeData, value.newValue)) {
        this.runtimeData = value.newValue as RuntimeData
        console.log('[NetworkMockStore] on change, new runtime data: ', this.runtimeData)

        this.registeredListeners.forEach((listenerCallback: Function, i: number) => {
          listenerCallback(this.runtimeData)
        })
      }
    })
  }

  async getAll (): Promise<RuntimeData | null> {
    if (this.initPromise != null) {
      const storedRuntimeData = await this.initPromise as unknown as RuntimeData
      this.initPromise = null

      if (storedRuntimeData !== undefined) {
        this.runtimeData = storedRuntimeData
      }
    }
    console.log('[RuntimeStore] getAll: ', this.runtimeData)
    return this.runtimeData
  }
}
