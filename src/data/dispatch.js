import { OPERATIONS, PORTS} from './constants';
import { v4 as uuidv4 } from 'uuid';

const { READ, WRITE } = OPERATIONS;
const portInstances = {
  [PORTS.NETWORK_STORE]: chrome.runtime.connect({name: PORTS.NETWORK_STORE}),
  [PORTS.RUNTIME_STORE]: chrome.runtime.connect({name: PORTS.RUNTIME_STORE}),
  [PORTS.PREFERANCE_STORE]: chrome.runtime.connect({name: PORTS.PREFERANCE_STORE}),
};

console.log('dispatch created ports')

const dispatchCache = {};

const handleDispatchResponse = (msg) => {
  dispatchCache[msg.id].resolve(msg.data);
  delete dispatchCache[msg.id];
};

portInstances[PORTS.NETWORK_STORE].onMessage.addListener(handleDispatchResponse);

const dispatch = async ({targetStore, operation, key, data = null}) => {
  let response = null;
  const id = uuidv4();

  if (targetStore) {
    switch (operation) {
      case READ:
        portInstances[targetStore].postMessage({
            id,
            targetStore,
            operation,
            key
        });
        dispatchCache[id] = new Promise();
        response = await dispatchCache[id]();
        console.log('READ response: ', data);
        break;
      case WRITE:
        console.log('targetStore: ', targetStore,  portInstances[targetStore]);
        portInstances[targetStore].postMessage({
            id,
            targetStore,
            operation,
            key,
            data
          });
        dispatchCache[id] = new Promise();
        response = await dispatchCache[id]();
        console.log('WRITE response: ', data);
        break;
      default:
        console.log(`[DISPATCH] operation ${operation} is not defined`);
        break;
    }
  }

  return true;
};

export default dispatch;