'use strict';
import {
  getActiveTab,
  refreshTab,
  generateIdFromRequestObject
} from './utils';
import {
  createStore,
  dispatch,
  OPERATIONS,
  handleDispatch,
} from './data';

const stores = {};

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

const runtimeStore = createStore({
  name: 'runtime_store',
  onInitialization: () => {
    console.log('initialising runtime_store...')
  },
});
stores['runtime_store'] = runtimeStore

const preferanceStore = createStore({
  name: 'preferance_store',
  onInitialization: () => {
    console.log('initialising preferance_store...')
  },
});
stores['preferance_store'] = preferanceStore

const networkStore = createStore({
  name: 'network_store',
  onInitialization: () => {
    console.log('initialising network_store...')
  },
  onWrite: async (writtenNetworkData) => {
    console.log('befpre reading runtime store')
    let debugee = await dispatch({
      targetStore: 'runtime_store',
      operation: OPERATIONS.READ,
      key: 'debugee',
    });
    console.log('debugee: ', debugee);

    const activeTab = await getActiveTab();
    if (activeTab.id !== debugee?.tabId) {
      debugee = { tabId: activeTab.id };
      const runtime = await dispatch({
        targetStore: 'runtime_store',
        operation: OPERATIONS.WRITE,
        key: 'debugee',
        data: debugee
      });
      console.log('debugee: ', debugee);
      console.log('before... ');
      console.log('runtime: ', runtime);
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
stores['network_store'] = networkStore


// const handleDispatch = (request, sender, sendResponse, stores) => {
//   console.log('stores: ', stores);
//   const targetStore = stores[request.targetStore];
//   console.log('request', request);
//   if (!targetStore) {
//     console.log(`[DISPATCH_HANDLER] provided targetStore: ${request.targetStore} doesn't exits, \n request: ${JSON.stringify(request)}`)
//     return;
//   }
//   console.log('deciding if to write or read')
//   if (request.operation === WRITE) {
//     if (targetStore === 'runtime_store') {
//       console.log('writing to runtime...')
//     }
//     console.log('before writing to store')
//     targetStore().write(request.key, request.data);
//     console.log('before sending response')
//     sendResponse(`stored ${JSON.stringify([request.key])}`);
//   } else if (request.operation === READ) {
//     const data = targetStore().read(request.key);
//     sendResponse(data);
//   }
// };

handleDispatch(stores);
