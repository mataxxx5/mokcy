import { Storage } from '../storage/Storage'
import { STORAGE_KEYS_STRINGS } from '../../popup/constants'

export interface StoreInterface {
  storage?: Storage
  initPromise: Promise<JSON> | null

  getAll: () => Promise<unknown>
  store: (value: unknown) => void
  deleteAll: () => void
}

export abstract class Store {
  storage: Storage
  nameSpace: STORAGE_KEYS_STRINGS
  initPromise: Promise<JSON> | null
  registeredListeners: Record<string, Function>

  constructor (nameSpace: STORAGE_KEYS_STRINGS, storage: Storage) {
    this.storage = storage
    this.nameSpace = nameSpace
    this.registeredListeners = {}
    this.initPromise = this.storage.retrieve(this.nameSpace)
  }

  async store (value: unknown) {
    console.log('[Store] store: ', { value, nameSpace: this.nameSpace })
    await this.storage.save(this.nameSpace, value as JSON)
  }

  async deleteAll () {
    await this.storage.delete(this.nameSpace)
  }

  registerUpdateLister (functionKey: string, listener: Function) {
    this.registeredListeners[functionKey] = listener
  }
}
