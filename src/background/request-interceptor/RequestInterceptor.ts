import { Request, Response } from 'har-format'
import { MockData } from '../../popup/hooks/loadedMockContext'
import { RuntimeData } from '../../common-runtime-components/store/RuntimeStore'

import Debugee from '../debugee/Debugee'
import {
  NetworkMockStore,
  PreferencesStore,
  RuntimeStore,
  ErrorStore
} from '../../common-runtime-components/store'


export default class RequestMocker {
  mockingInProgress: boolean
  mockStore: NetworkMockStore
  preferencesStore: PreferencesStore
  runtimeStore: RuntimeStore
  errorStore: ErrorStore
  debugee: Debugee

  constructor () {
    this.mockingInProgress = false
    this.debugee = new Debugee()
    this.mockStore = new NetworkMockStore()
    this.preferencesStore = new PreferencesStore()
    this.runtimeStore = new RuntimeStore()
    this.errorStore = new ErrorStore()

    this.runtimeStore.registerUpdateLister('mocking', async (value: RuntimeData) => {
      if (value.mockingInProgress) {
        await this.startMocking()
      } else {
        await this.stopMocking()
      }
    })

    chrome.debugger.onEvent.addListener((source: chrome.debugger.Debuggee, method: string, params: any) => {
      console.log('[RequestMocker] onEvent: ', {
        source, method, params
      })

      // this.mockOutgoingHTTPRequests(source, method, params)
    })
    chrome.debugger.onDetach.addListener((source: chrome.debugger.Debuggee, reason: string) => {
      console.log('[RequestMocker] onDetach: ', {
        source, reason
      })
      this.mockingInProgress = false
      this.runtimeStore.store({ isMockingInProgres: this.isMockingInProgres })
    })
  }

  async startMocking () {
    const debugee = await this.debugee.getInstance()
    console.log('[RequestMocker] attaching the debugger: ', debugee, this.debugee.tab)

    if (isValidHttpUrl(this.debugee.tab?.url || '')) {
      this.errorStore.store('Incorrect protocol. Please debug a tab with a valid https or http url');
      return;
    }

    try {
      await chrome.debugger.attach(debugee, '1.2')
      await chrome.debugger.sendCommand(debugee, 'Fetch.enable', { patterns: [{ urlPattern: '*' }], handleAuthRequests: true })

      this.mockingInProgress = true
    } catch (e) {
      console.log('[RequestMocker] error attaching the debugger: ', e)

      const errorMessage: string = (e as Error).message
      this.errorStore.store(errorMessage)
      this.stopMocking()
    }
  }

  async stopMocking () {
    // try {
    //   await chrome.debugger.detach(await this.debugee.getInstance())
    //   this.errorStore.store('')
    // } catch (e) {
    //   this.errorStore.store('')
    //   const errorMessage: string = (e as Error).message
    //   console.log('[RequestMocker] error de-attaching the debugger: ', errorMessage)
    //   // this.errorStore.store(errorMessage)
    // }
  }

  isMockingInProgres () {
    return this.mockingInProgress
  }
}

function isValidHttpUrl(haha: string) {
  let url;
  try {
    url = new URL(haha);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}