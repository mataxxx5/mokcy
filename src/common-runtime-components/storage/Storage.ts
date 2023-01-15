enum StorageTypes {
  session = 'session',
  local = 'local'
}

type STORAGE_TYPE = keyof typeof StorageTypes

export abstract class Storage {
  type: STORAGE_TYPE

  constructor (type: STORAGE_TYPE) {
    this.type = type
  }

  async retrieve (key: string) {
    return (await chrome.storage[this.type].get(key))[key]
  }

  async save (key: string, value: JSON) {
    await chrome.storage[this.type].set({ [key]: value })
  }

  async delete (key: string) {
    await chrome.storage[this.type].set({ [key]: undefined })
  }

  getInstance () {
    return chrome.storage[this.type]
  }

  getType () {
    return this.type
  }
}

export class SessionStorage extends Storage {
  constructor () {
    super(StorageTypes.session)
  }
}

export class LocalStorage extends Storage {
  constructor () {
    super(StorageTypes.local)
  }
}
