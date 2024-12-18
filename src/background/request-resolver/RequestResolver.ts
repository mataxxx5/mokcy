import {
  NetworkMockStore,
  PreferencesStore
} from '../../store'
import { Preferences } from '../../popup/hooks/preferencesContext';
import { MockData } from '../../popup/hooks/loadedMockContext';
import { formatMockedResponse, ErrorResponse } from './utils'
import { Response } from 'har-format'
import { harErrorToErrorResonMap } from './constants'
import { DEFAULT_URL_MATCHER_TYPE } from '../../constants'
import FetchAPIFacade from '../common/FetchAPIFacade'
import { generateIdFromRequestObject } from '../../utils'

const errorBroadcast = new BroadcastChannel('error-channel')

export default class RequestResolver {
  mockStore: NetworkMockStore
  preferencesStore: PreferencesStore
  mockResponses: MockData['responses'] | undefined
  preferences: Preferences | null

  constructor () {
    this.mockStore = new NetworkMockStore()
    this.preferencesStore = new PreferencesStore()
    this.preferences = null;
  }

  async loadContext() {
    this.mockResponses = (await this.mockStore.getAll())?.responses
    this.preferences = await this.preferencesStore.getAll()
  }

  async resolveRequestWithMock (mockResponse: Response | ErrorResponse, requestId: string, debugee: chrome.debugger.Debuggee) {
    if ((mockResponse as ErrorResponse)._error !== null) {
      console.log('[RequestResolver] failing request with error recorded in HAR response: ', mockResponse)
      await FetchAPIFacade.failFetchRequest(debugee, requestId, harErrorToErrorResonMap[(mockResponse as ErrorResponse)._error])
    } else {
      console.log('[RequestResolver] resolving request with response recorded in HAR response: ', mockResponse)
      await FetchAPIFacade.resolveFetchRequest(debugee, formatMockedResponse({ requestId }, mockResponse))
    }
  }

  async continueRequest (requestId: string, debugee: chrome.debugger.Debuggee) {
    console.log('[RequestResolver] no matching response found, carrying out the request normally')
    await FetchAPIFacade.continueFetchRequest(debugee, requestId)
  }

  async handleRequest (debugee: chrome.debugger.Debuggee, method: string, params: any) {
    console.log('[RequestResolver] handleRequest: ', params)
    console.log('[RequestResolver] preferences: ', this.preferences);

    if (this.preferences?.resourceTypes && !(new Set(this.preferences?.resourceTypes).has(params.resourceType))) {
      console.log('[RequestResolver] resource type: ', params.resourceType, ' is not selected for mocking')
      await this.continueRequest(params.requestId, debugee)
      return
    }

    const responseId = generateIdFromRequestObject(params.request, this.preferences?.urlMatching ?? DEFAULT_URL_MATCHER_TYPE)
    console.log('[RequestResolver] id from request object: ', { id: responseId, request: params.request, matchType: this.preferences?.urlMatching ?? DEFAULT_URL_MATCHER_TYPE} );
    const matchedResponse = this.mockResponses?.[responseId]

    if (matchedResponse != null) {
      try {
        this.resolveRequestWithMock(matchedResponse, params.requestId, debugee)
      } catch (e) {
        errorBroadcast.postMessage((e as Error).message)
      }
    } else {
      await this.continueRequest(params.requestId, debugee)
    }
  }
}
