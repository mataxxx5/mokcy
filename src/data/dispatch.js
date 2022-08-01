import OPERATIONS from './operations';
const { READ, WRITE } = OPERATIONS;

const dispatch = async ({targetStore, operation, key, data = null}) => {
  switch (operation) {
    case READ:
      return await new Promise((resolve) => chrome.runtime.sendMessage(
        {
          targetStore,
          operation,
          key
        },
        (response) => {
          
          resolve(response);
        }
      ));
    case WRITE:
      return await new Promise((resolve) => chrome.runtime.sendMessage(
        {
          targetStore,
          operation,
          key,
          data
        },
        (response) => {
          resolve(response);
        }
      ));
    default:
      console.log(`[DISPATCH] operation ${operation} is not defined`);
      break;
  }
};

export default dispatch;