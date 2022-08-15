'use strict';
import Connection from './connection';
import {
  getActiveTab,
  refreshTab,
  generateIdFromRequestObject,
  setupStores
} from './utils';
import { 
  NETWORK_STORE, 
  RUNTIME_STORE, 
  PREFERANCE_STORE 
} from './constants';

const mockOutgoingHTTPRequests = (storedMockData, debugee, resourceTypes, urlMatchType) => async (source, method, params) => {
  if (method === "Fetch.requestPaused") {
    const original = {requestId: params.requestId}
    let mock = null;

    if (resourceTypes.find(resourceType => resourceType === params.resourceType)) {
      const activeTab = await getActiveTab();
      
      if (source.tabId === activeTab?.id ) { 
        const matchingMockResponse = findMatchingMockResponse(params.request, storedMockData, urlMatchType);
        if (matchingMockResponse) {
          console.log('matchingMockResponse: ', matchingMockResponse);
          mock = formatMockedResponse(params, matchingMockResponse);
        } 
      }
    }

    if (mock) {
      chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', mock);
    } else {
      chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', original);
    }
  }
};

const findMatchingMockResponse = (request, storedMockData, urlMatchType) => {
  const mockResponseCollection = storedMockData.responses;
  const requestId = generateIdFromRequestObject(request, false, urlMatchType);
  return mockResponseCollection?.[requestId] ? mockResponseCollection?.[requestId] : null;
};

const formatMockedResponse = (params, matchingMockResponse) => {
  return {
    requestId: params.requestId,
    responseCode: matchingMockResponse.status,
    binaryResponseHeaders: btoa(unescape(encodeURIComponent(JSON.stringify(matchingMockResponse.headers).replace(/(?:\r\n|\r|\n)/g, '\0')))),
    body: btoa(unescape(encodeURIComponent(matchingMockResponse.data)))
  };
}

const networkStoreOnWrite = async (key, writtenNetworkData, allStores) => {
  let debugee = allStores[RUNTIME_STORE].read('debugee');
  const resourceTypes = allStores[PREFERANCE_STORE].read('resourceTypes');
  const urlMatchType = allStores[PREFERANCE_STORE].read('urlMatchType');
  const activeTab = await getActiveTab();

  if (activeTab.id !== debugee?.tabId) {
    if (debugee) {
      chrome.debugger.detach(debugee);
    }
    debugee = { tabId: activeTab.id };
    allStores[RUNTIME_STORE].write('debugee', debugee);
  }

  await refreshTab(activeTab);

  chrome.debugger.attach(debugee, "1.0", () => {
    chrome.debugger.sendCommand(debugee, "Fetch.enable", { patterns: [{ urlPattern: '*' }] });
    chrome.debugger.onEvent.addListener(mockOutgoingHTTPRequests(writtenNetworkData, debugee, resourceTypes, urlMatchType))
  });
};

const stores = setupStores({
  [NETWORK_STORE]: {
    onWrite: networkStoreOnWrite
  },
  [PREFERANCE_STORE]: {
    onWrite: (key, preferenaceData) => { console.log('preferenaceData: ', { key, preferenaceData}) }
  }
});

Connection(stores);
