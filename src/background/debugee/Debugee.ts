export default class Debugee {
  debugee: chrome.debugger.Debuggee
  initPromise: Promise<chrome.tabs.Tab[]> | null
  tab: chrome.tabs.Tab | null

  constructor () {
    this.debugee = {}
    this.tab = null
    this.initPromise = chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      console.log('[Debugee] onUpdated ', { tabId, changeInfo, tab })
      if (changeInfo.status === 'complete') {
        console.log('[Debugee] setting new debugger tab to debug ', { tabId, activeInfo: changeInfo, tab })
        this.debugee = { tabId }
        this.tab = tab
      }
    })
  }

  async resolveInitPromise (): Promise<void> {
    if (this.initPromise != null) {
      const tab = (await this.initPromise)[0]

      if (typeof tab?.id === 'number') {
        this.debugee = { tabId: tab.id }
        this.tab = tab
      }
      this.initPromise = null
    }
  }

  async getInstance (): Promise<chrome.debugger.Debuggee> {
    await this.resolveInitPromise()
    console.log('[Debugee] getInstance: ', this.debugee)
    return this.debugee
  }

  async getTabDebuggerIsAttached (): Promise<chrome.tabs.Tab | null> {
    await this.resolveInitPromise()
    console.log('[Debugee] getTabDebuggerIsAttached: ', this.tab)
    return this.tab
  }

  addOnUpdateListener (onUpdateHandler: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void)  {
    chrome.tabs.onUpdated.addListener(onUpdateHandler);
  }
}
