'use strict';
import {
  getActiveTab,
  refreshTab,
  generateIdFromRequestObject
} from './utils';
import {
  createStore,
  dispatchHandler,
  dispatch,
  OPERATIONS,
} from './data';

const mockOutgoingHTTPRequests = (storedMockData, debugee) => (source, method, params) => {
  if (method === "Fetch.requestPaused") {
    // const activeTab = await getActiveTab();

    // if (source.tabId === activeTab.id) {
      console.log("mockOutgoingHTTPRequests debugee: ", debugee);
      console.log("storedMockData: ", storedMockData);

      const matchingMockResponse = findMatchingMockResponse(params.request, storedMockData);

      if (matchingMockResponse) {
        const response = formatMockedResponse(matchingMockResponse);
        chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', response);
      } else {
        chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', {requestId: params.requestId});
      }
    // }
  }
};

const findMatchingMockResponse = (request, storedMockData) => {
  const mockResponseCollection = storedMockData.responses;
  const requestId = generateIdFromRequestObject(request);
  return mockResponseCollection?.[requestId] ? mockResponseCollection?.[requestId] : null;
};

const formatMockedResponse = (matchingMockResponse) => {
  return {
    requestId: params.requestId,
    responseCode: matchingMockResponse.status,
    binaryResponseHeaders: btoa(unescape(encodeURIComponent(JSON.stringify([...matchingMockResponse.headers, {name: 'mocked', value: "true"}]).replace(/(?:\r\n|\r|\n)/g, '\0')))),
    body: btoa(unescape(encodeURIComponent(matchingMockResponse.data)))
  };
}
const dispatchHandlerInstance = dispatchHandler();

const runtimeStore = createStore({
  name: 'runtime_store'
});
dispatchHandlerInstance.registerStore(runtimeStore);

const preferanceStore = createStore({
  name: 'preferance_store'
});
dispatchHandlerInstance.registerStore(preferanceStore);

const networkStore = createStore({
  name: 'network_store',
  onWrite: async (writtenNetworkData) => {
    let debugee = await dispatch({
      targetStore: 'runtime_store',
      operation: OPERATIONS.READ,
      key: 'debugee',
    });

    const activeTab = await getActiveTab();
    if (activeTab.id !== debugee?.tabId) {
      debugee = { tabId: activeTab.id };
      await dispatch({
        targetStore: 'runtime_store',
        operation: OPERATIONS.WRITE,
        key: 'debugee',
        data: debugee
      });
      console.log('debugee: ', debugee);
    }
    console.log('active tab:  ', activeTab);
    await refreshTab(activeTab);

    chrome.debugger.attach(debugee, "1.0", () => {
      chrome.debugger.sendCommand(debugee, "Fetch.enable", { patterns: [{ urlPattern: '*' }] });
    });

    // chrome.debugger.onEvent.addListener((source, method, params) => {
    //   if (method === "Fetch.requestPaused") {
    //     // const activeTab = await getActiveTab();

    //     // if (source.tabId === activeTab.id) {
    //     console.log("mockOutgoingHTTPRequests debugee: ", debugee);
    //     console.log("storedMockData: ", writtenNetworkData);

    //     const matchingMockResponse = findMatchingMockResponse(params.request, writtenNetworkData);

    //     if (matchingMockResponse) {
    //       const response = formatMockedResponse(matchingMockResponse);
    //       chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', response);
    //     } else {
    //       chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', {requestId: params.requestId});
    //     }
    //     // }
    //   }
    // });
  }
});
dispatchHandlerInstance.registerStore(networkStore);


