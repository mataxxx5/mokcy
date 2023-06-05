import { RuntimeStore } from '../../store'

export default class Debugee {
  runtimeStore: RuntimeStore
  currentFocusedTabId: number | null

  constructor (onTargetRemoved: Function) {
    this.runtimeStore = new RuntimeStore()
    this.currentFocusedTabId = null

    chrome.tabs.onRemoved.addListener((tabId) => {
      if (tabId === this.currentFocusedTabId) {
        onTargetRemoved()
      }
    })
  }

  async getAllTargets (): Promise<chrome.debugger.TargetInfo[]> {
    return await chrome.debugger.getTargets()
  }

  async getAllAttachedTargets (): Promise<chrome.debugger.TargetInfo[]> {
    return (await this.getAllTargets()).filter(target => target.attached && target.tabId)
  }

  getAttachedTarget () {
    return this.currentFocusedTabId
  }

  async getFocusedTarget (tabId?: number): Promise<chrome.debugger.TargetInfo["tabId"] | null> {
    const allAvailableTargets = await this.getAllTargets()
    let activeTabId : number | null = tabId ? tabId : null;

    if (activeTabId === null) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true, highlighted: true})
      if (activeTab?.id) {
        activeTabId = activeTab.id
      }
    }
    console.log('[Debugee] getFocusedTarget allAvailableTargets, activeTabId: ', allAvailableTargets, activeTabId)
    if (activeTabId === null) {
      return null
    }

    const matchingTarget = allAvailableTargets.find(target => target.tabId === activeTabId)
    console.log('[Debugee] getFocusedTarget matchingTarget ', matchingTarget)
    if (matchingTarget) {
      this.currentFocusedTabId = activeTabId
    }
    return activeTabId || null
  }
}
