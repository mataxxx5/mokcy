import OPERATIONS from './operations';
const { READ, WRITE } = OPERATIONS;

const dispatchHandler = (request, sender, sendResponse, stores) => {

  const targetStore = stores.find(store => store().getStoreName() === request.targetStore);
  console.log('request', request);
  if (!targetStore) {
    console.log(`[DISPATCH_HANDLER] provided targetStore: ${request.targetStore} doesn't exits, \n request: ${JSON.stringify(request)}`)
    return;
  }
  console.log('deciding if to write or read')
  if (request.operation === WRITE) {
    console.log('before writing to store')
    targetStore().write(request.key, request.data);
    console.log('before sending response')
    sendResponse(`stored ${JSON.stringify([request.key])}`);
  } else if (request.operation === READ) {
    const data = targetStore().read(request.key);
    sendResponse(data);
  }
};

export default () => {
  const _stores = [];

  function registerDispatchHandler(request, sender, sendResponse) {
    dispatchHandler(request, sender, sendResponse, _stores)
  };

  const resetListeners = () => {
    chrome.runtime.onMessage.removeListener(registerDispatchHandler);
    chrome.runtime.onMessage.addListener(registerDispatchHandler);
  };

  const registerStore = (store) => {
    _stores.push(store);
    resetListeners();
  };

  const unregisterStore = (store) => {
    const index = _stores.findIndex(storeToUnregister => storeToUnregister.getStoreName() === store.getStoreName());
    if (index > -1) {
      _stores.splice(index, 1);
      resetListeners();
    }
  };

  const unregisterAll = () => {
    _stores = [];
    chrome.runtime.onMessage.removeListener(registerDispatchHandler);
  };

  return {
    registerStore,
    unregisterStore,
    unregisterAll
  };
};