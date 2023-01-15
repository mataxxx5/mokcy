import { Request, Response } from 'har-format'
import { MockData } from '../../popup/hooks/loadedMockContext'
import { RuntimeData } from '../../common-runtime-components/store/RuntimeStore'
import { generateIdFromRequestObject } from '../../popup/components/utils'
import Debugee from '../debugee/Debugee'
import {
  NetworkMockStore,
  PreferencesStore,
  RuntimeStore,
  ErrorStore
} from '../../common-runtime-components/store'
import { DEFAULT_URL_MATCHER_TYPE } from '../../popup/constants'

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

      this.mockOutgoingHTTPRequests(source, method, params)
    })
    chrome.debugger.onDetach.addListener((source: chrome.debugger.Debuggee, reason: string) => {
      console.log('[RequestMocker] onDetach: ', {
        source, reason
      })
      this.mockingInProgress = false
      this.runtimeStore.store({ isMockingInProgres: this.isMockingInProgres })
    })
  }

  private async mockOutgoingHTTPRequests (source: chrome.debugger.Debuggee, method: string, params: any): Promise<void> {
    if (method !== 'Fetch.requestPaused') {
      return // if the request isn't paused
    }
    const debugee = await this.debugee.getInstance()
    const debugeeTab = await this.debugee.getTabDebuggerIsAttached()

    // helper function to proceed with the request without mocking
    const continueWithTheOriginalRequest = async (): Promise<void> => {
      try {
        await chrome.debugger.sendCommand(debugee, 'Fetch.disable', { patterns: [{ urlPattern: '*' }], handleAuthRequests: true })
      } catch (e) {
        console.log('[RequestMocker] error continuing with the request: ', e)
        const errorMessage: string = (e as Error).message
        this.errorStore.store(errorMessage)
        this.stopMocking()
      }
    }
    const mocks = await this.mockStore.getAll()
    const preferences = await this.preferencesStore.getAll()

    if (mocks == null) {
      console.log('[RequestMocker] mocks are not setup, continue with the orginal response for request: ', params.request)
      await continueWithTheOriginalRequest()
      return
    }

    if (source.tabId !== debugee.tabId) {
      console.log('[RequestMocker] focused tab is out of sync, continue with the orginal response for request: ', params.request)
      await continueWithTheOriginalRequest()
      return
    }

    if (debugeeTab?.title === 'Privacy error') {
      console.log('[RequestMocker] focused tab needs human interventation, continue with the orginal response for request: ', params.request)
      await continueWithTheOriginalRequest()
      return
    }

    if (preferences?.resourceTypes?.length && (preferences.resourceTypes.find(resourceType => resourceType === params.resourceType) == null)) {
      console.log('[RequestMocker] resourceType of the request is not selected for mocking, continue with the orginal response for request: ',
        { request: params.request, resourceType: params.resourceType }
      )
      await continueWithTheOriginalRequest()
      return
    }

    const matchingMockResponse = this.findMatchingMockResponse(params.request, preferences?.urlMatching ?? DEFAULT_URL_MATCHER_TYPE, mocks)

    if (matchingMockResponse === undefined) {
      console.log('[RequestMocker] no repsonse found in the mocks for request, continue with the orginal response for request: ', params.request)
      await continueWithTheOriginalRequest()
      return
    }
    console.log('[RequestMocker] mock response found: ', { request: params.request, response: matchingMockResponse })
    const mockResponse = this.formatMockedResponse(params, matchingMockResponse)
    try {
      await chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', mockResponse)
    } catch (e) {
      console.log('[RequestMocker] error mocking  the request: ', e)
      const errorMessage: string = (e as Error).message
      this.errorStore.store(errorMessage)
      this.stopMocking()
    }
  }

  private findMatchingMockResponse (
    request: Request,
    urlMatchType: string,
    mocks: MockData
  ): Response | undefined {
    const mockResponseCollection = mocks?.responses
    const requestId = generateIdFromRequestObject(request, urlMatchType)

    return mockResponseCollection?.[requestId]
  }

  private formatMockedResponse (params: any, matchingMockResponse: Response): Object {
    return {
      requestId: params.requestId,
      responseCode: matchingMockResponse.status,
      binaryResponseHeaders: btoa(unescape(encodeURIComponent(JSON.stringify(matchingMockResponse.headers).replace(/(?:\r\n|\r|\n)/g, '\0')))),
      body: btoa(unescape(encodeURIComponent(matchingMockResponse.content?.text ?? '')))
    }
  }

  async startMocking () {
    const debugee = await this.debugee.getInstance()
    console.log('[RequestMocker] attaching the debugger: ', debugee)
    const possibleTargets = await chrome.debugger.getTargets()

    possibleTargets.forEach(async (target) => {
      if (target.tabId === debugee.tabId && target.attached) {
        await chrome.debugger.detach(debugee)
      }
    })

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
    try {
      await chrome.debugger.detach(await this.debugee.getInstance())
      this.errorStore.store('')
    } catch (e) {
      this.errorStore.store('')
      const errorMessage: string = (e as Error).message
      console.log('[RequestMocker] error de-attaching the debugger: ', errorMessage)
      // this.errorStore.store(errorMessage)
    }
  }

  isMockingInProgres () {
    return this.mockingInProgress
  }
}
