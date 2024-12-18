import { Storage } from '../store/storage/Storage'
import { STORAGE_KEYS_STRINGS } from '../constants'

export interface StoreInterface {
  storage?: Storage

  getAll: () => Promise<unknown>
  store: (value: unknown) => void
  deleteAll: () => void
}

export abstract class Store {
  storage: Storage
  nameSpace: STORAGE_KEYS_STRINGS
  registeredListeners: Function[]

  constructor (nameSpace: STORAGE_KEYS_STRINGS, storage: Storage) {
    this.storage = storage
    this.nameSpace = nameSpace
    this.registeredListeners = []
  }

  async store (value: unknown) {
    console.log('[Store] store: ', { value, nameSpace: this.nameSpace })
    await this.storage.save(this.nameSpace, value as JSON)
  }
  async retrieve () {
    console.log('[Store] retrieve: ', { nameSpace: this.nameSpace })
    return await this.storage.retrieve(this.nameSpace);
  }

  async deleteAll () {
    await this.storage.delete(this.nameSpace)
  }

  registerUpdateLister (listener: Function) {
    this.registeredListeners.push(listener)
  }
}
