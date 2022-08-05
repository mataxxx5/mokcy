import { OPERATIONS, PORTS} from './constants';

const { READ, WRITE } = OPERATIONS;
const portInstances = {
  [PORTS.NETWORK_STORE]: chrome.runtime.connect({name: PORTS.NETWORK_STORE}),
  [PORTS.RUNTIME_STORE]: chrome.runtime.connect({name: PORTS.RUNTIME_STORE}),
  [PORTS.PREFERANCE_STORE]: chrome.runtime.connect({name: PORTS.PREFERANCE_STORE}),
};
console.log('dispatch handler created ports')


export const handleDispatch = (stores) => {
  portInstances[PORTS.NETWORK_STORE].onMessage.addListener((msg) => {
    const targetStore = stores[msg.targetStore];

    if(targetStore) {
      if (request.operation === WRITE) {
        targetStore().write(request.key, request.data);
        portInstances[targetStore].postMessage({ data: `stored ${JSON.stringify([request.key])}`, targetStore: msg.targetStore});
      } else if (request.operation === READ) {
        const data = targetStore().read(request.key);
        portInstances[targetStore].postMessage({ data, targetStore: msg.targetStore});
      }
    }
  })
};


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

// const DispatchHandlerFactory = (function(){
//   class DispatchHandler {
//     constructor() {
//       this.stores = {};
//     }
   
//     registerStore(store) {
//       const name = store().getStoreName();
//       this.stores[name] = store;
//       const storres = { ...this.stores }
//       const fn = { [name](request, sender, sendResponse) {
//         console.log('this.stores): ', storres)
//         handleDispatch(request, sender, sendResponse, storres)
//       } }[name];


//       chrome.runtime.onMessage.addListener(fn);
//     };

//     unregisterStore(store) {
//       const name = store().getStoreName();
//       const fn = { [name](request, sender, sendResponse) {
//         handleDispatch(request, sender, sendResponse, this.stores)
//       } }[name];
//       delete this.stores[fn.name];

//       chrome.runtime.onMessage.removeListener(fn);
//     }

//   };
//   var instance;
//   return {
//       getInstance: function(){
//           if (instance == null) {
//               instance = new DispatchHandler();
//               // Hide the constructor so the returned object can't be new'd...
//               instance.constructor = null;
//           }

//           return instance;
//       }
//  };
// })();

// DispatchHandlerFactory.getInstance();


// export default DispatchHandlerFactory;