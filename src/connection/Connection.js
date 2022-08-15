import { v4 as uuidv4 } from 'uuid'
import DispatchCache from './DispatchCache';
import { OPERATIONS } from '../constants';
import { createPromise } from '../utils';

const { READ, WRITE } = OPERATIONS;

const Connection  = (stores = {}, background = true) => {
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
      console.log('port: ', port);
      const portName = port.name;
      if(!ports?.[portName]) {
        ports[portName] = port;
      }
      return port.onMessage.addListener(handleDispatch(port));
    });

    if (!background) {
      Object.values(stores).forEach(store => {
        const portName = store.getStoreName();
        const port = chrome.runtime.connect({name: portName});
        port.onDisconnect.addListener(() => {
          console.log("Disconnected");
        });
        ports[portName] = port;
      });
    }
    
    console.log('post intialisation...')

    // chrome.runtime.onDisconnect.addListener(port => {
    //   console.log('onDisconnect running in connection...');
    //   // port.onMessage.addListener(handleDispatch(port,));
    // });
  };


  onInitialization();

  return {
    dispatch
  };
};

export default Connection;