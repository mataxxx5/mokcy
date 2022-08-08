import { v4 as uuidv4 } from 'uuid'
import { OPERATIONS } from './constants';
import DispatchCache from './DispatchCache';
const { READ, WRITE } = OPERATIONS;

const createPromise = () => {
  let resolver;
  return [
      new Promise((resolve, reject) => {
          resolver = resolve;
      }),
      resolver,
  ];
};

const Connection  = (stores = {}) => {
  const ports = {};
  const dispatchCache = DispatchCache();

  const dispatch = async ({targetStore, operation, key, data = null}) => {
    let response = null;
    const id = uuidv4();
    const [ promise, resolver ] = createPromise();

    if (targetStore) {
      switch (operation) {
        case READ:
          console.log('READ operation commencing...');
          dispatchCache[id] = resolver;
          response = ports[targetStore].postMessage({
              targetStore,
              operation,
              key,
              id,
              direction: 'to'
          });
          console.log('READ message sent');
          response = await promise;
          console.log('READ response: ', response);
          break;
        case WRITE:
          console.log('WRITE operation commencing... ');
          dispatchCache[id] = resolver;
          ports[targetStore].postMessage({
              targetStore,
              operation,
              key,
              data,
              id,
              direction: 'to'
          });
          console.log('WRITE message sent');
          response = await promise;
          console.log('WRITE response: ', response);
          break;
        default:
          console.log(`[DISPATCH] operation ${operation} is not defined`);
          break;
      }
    }

    return response;
  };

  const handleDispatch = (port) => (msg) => {
    console.log('handleDispatch: ', port, msg);
    if (msg.direction === 'to' ) {
      const targetStore = stores[msg.targetStore];
      if (msg.operation === WRITE) {
        targetStore.write(msg.key, msg.data);
        port.postMessage({
          data: `stored ${JSON.stringify([msg.key])}`,
          id: msg.id,
          direction: 'from'
        });
      } else if (msg.operation === READ) {
        const data = targetStore.read(msg.key);
        port.postMessage({
          data,
          id: msg.id,
          direction: 'from'
        });
      }
    } else if (msg.direction === 'from' ) {
      dispatchCache[msg.id](msg.data);
    }
  };

  const onInitialization = () => {
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(handleDispatch(port,));
    });
    Object.values(stores).forEach(store => {
      const portName = store.getStoreName();
      console.log('onInitialization: ', portName)
      const port = chrome.runtime.connect({name: portName});
      console.log('post connect...')
      ports[portName] = port;

      console.log('ports ahahaha: ', ports);
    });
  };


  onInitialization();

  return {
    dispatch
  };
};

export default Connection;