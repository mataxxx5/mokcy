
import Debugee from '../debugee/Debugee'
import FetchAPIFacade from '../common/FetchAPIFacade';

const errorBroadcast = new BroadcastChannel('error-channel');

export default class RequestInterceptor {
  debugee: Debugee

  constructor (onRequestInterception: Function, onStopIntercepting?: Function) {
    this.debugee = new Debugee(this.stopInterceptingOutgoingRequests.bind(this))

    FetchAPIFacade.addOnEventListener((source: chrome.debugger.Debuggee, method: string, params: any) => {
      if (method === 'Fetch.requestPaused') {
        console.log('[RequestInterceptor] request intercepted: ', {
          source, method, params
        })

        onRequestInterception(source, method, params)
      }
    })

    FetchAPIFacade.addOnDetachListener((source: chrome.debugger.Debuggee, reason: string) => {
      console.log('[RequestInterceptor] onDetach: ', {
        source, reason, onStopIntercepting
      })

      if (reason === 'canceled_by_user' && onStopIntercepting) {
        onStopIntercepting(source, reason)
      }
    })
  }

  async startInterceptingOutgoingRequests (focusedTarget?: chrome.debugger.TargetInfo["tabId"]) {
    const targetTabId = focusedTarget ? focusedTarget : (await this.debugee.getFocusedTarget())
    console.log('[RequestInterceptor] start request interception: ', targetTabId, focusedTarget)

    if (typeof targetTabId === 'number') {
      try {

        await FetchAPIFacade.enableFetchEvents({tabId: targetTabId }, { 
          patterns: [{ urlPattern: '*' }], 
          handleAuthRequests: true, 
          requestStage: 'requestStage' 
        })
      } catch (e) {
        errorBroadcast.postMessage((e as Error).message)
      }
    } else {
      errorBroadcast.postMessage('Error: an observable tab is not in focus, please focus the tab you wish to use with Mocky')
    }
  }

  async stopInterceptingOutgoingRequests () {
    console.log('this.debugee ', this.debugee)
    const attachedTargetTabId = this.debugee.getAttachedTarget()
    console.log('[RequestInterceptor] stop request interception target id: ', attachedTargetTabId)
    if (attachedTargetTabId) {
      try {
        await FetchAPIFacade.disableFetchEvents({tabId: attachedTargetTabId })
      } catch (e) {
        errorBroadcast.postMessage((e as Error).message)
      }
    }
  }
}
