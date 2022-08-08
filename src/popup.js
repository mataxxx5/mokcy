import {
  CONSTANTS
} from './data';
import {
  createStore,
  Connection,
} from './data';
import {
  generateIdFromRequestObject
} from './utils';

const { OPERATIONS } = CONSTANTS;

const stores = {};
const networkStore = createStore({
  name: 'network_store',
  onInitialization: () => {
    console.log('initialising network_store inside popup...')
  },
  onWrite: async (writtenNetworkData) => {
    console.log('onwrite inside popu')
  }
});
stores[networkStore.getStoreName()] = networkStore;

const { dispatch } = Connection(stores);

const storeEntryData = async (entries) => {
  const requests = {};
  const responses = {};

  entries.forEach((entry) => {
    const { request, response } = entry;
    const idObject = generateIdFromRequestObject(request);

    requests[`${idObject}`] = requests[`${idObject}`] ?
      [
        ...requests[`${idObject}`],
        request
      ] :
      [
        request
      ];

    responses[`${idObject}`] = {
      status: response.status,
      data: response.content.text,
      headers: response.headers
    };
  });
  console.log('before dispatch of network data...',)
  const returnVal = await dispatch({
    targetStore: 'network_store',
    operation: OPERATIONS.WRITE,
    key: 'networkData',
    data: { requests, responses}
  });
  console.log('after writing value: ', returnVal);
}

const processHARJSon = (HARJson) => {
  const { entries } = HARJson?.log;

  storeEntryData(entries);
}

const convertFileContentsIntoHARJson = (evt) => {
  const HARJson = JSON.parse(evt.target.result);
  processHARJSon(HARJson);
}

const handleFileUpload = () => {
  const [file] = fileUpload.files;
  const fileReader = new FileReader();

  fileReader.onload = convertFileContentsIntoHARJson;
  fileReader.readAsText(file, 'utf-8')
}

const fileUpload = document.getElementById("file-upload");
fileUpload.addEventListener("change", handleFileUpload);
