import { STORAGE_KEYS } from '../../popup/constants'
import { StoreInterface, Store } from './Store'
import { SessionStorage } from '../storage/Storage'
import { isEqual } from 'lodash'

export interface RuntimeData {
  mockingInProgress: boolean
}

export default class RuntimeStore extends Store implements StoreInterface {
  runtimeData: RuntimeData | undefined

  constructor () {
    super(STORAGE_KEYS.RUNTIME_EVENTS, new SessionStorage())

    chrome.storage.onChanged.addListener((changes, areaName) => {
      const [key, value] = Object.entries(changes)[0]

      if (key === this.nameSpace && areaName === this.storage.getType() && !isEqual(this.runtimeData, value.newValue)) {
        this.runtimeData = value.newValue as RuntimeData
        console.log('[RuntimeStore] on change, new runtime data: ', this.runtimeData)
        Object.values(this.registeredListeners).forEach((listenerCallback: Function) => {
          console.log('[RuntimeStore]: Running callback with: ', this.runtimeData)
          listenerCallback(this.runtimeData)
        })
      }
    })
  }

  async getAll (): Promise<RuntimeData | undefined> {
    if (this.initPromise != null) {
      this.runtimeData = await this.initPromise as unknown as RuntimeData
      this.initPromise = null
    }
    console.log('[RuntimeStore] getAll: ', this.runtimeData)
    return this.runtimeData
  }
}
