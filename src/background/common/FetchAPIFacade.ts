type onEventHandler = (source: chrome.debugger.Debuggee, method: string, params: any) => void
type onDetachHandler = (source: chrome.debugger.Debuggee, reason: string) => void

// This is a Facade for interactign with fetch API via CDP
export default {
  addOnEventListener: (handler: onEventHandler) => {
    chrome.debugger.onEvent.addListener(handler)
  },
  addOnDetachListener: (handler: onDetachHandler) => {
    chrome.debugger.onDetach.addListener(handler)
  },
  enableFetchEvents: async (debugee: chrome.debugger.Debuggee, commandParams: Object) => {
    await chrome.debugger.attach(debugee, '1.2')
    await chrome.debugger.sendCommand(debugee, 'Fetch.enable', commandParams)
  },
  disableFetchEvents: async (debugee: chrome.debugger.Debuggee) => {
    await chrome.debugger.detach(debugee)
  },
  continueFetchRequest: async (debugee: chrome.debugger.Debuggee, requestId: string) => {
    await chrome.debugger.sendCommand(debugee, 'Fetch.continueResponse', { requestId })
  },
  resolveFetchRequest: async (debugee: chrome.debugger.Debuggee, response: Object) => {
    await chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', response)
  },
  failFetchRequest: async (debugee: chrome.debugger.Debuggee, requestId: string, errorReason: string) => {
    await chrome.debugger.sendCommand(debugee, 'Fetch.failRequest', { requestId, errorReason })
  }
}
