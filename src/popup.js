import {
  OPERATIONS,
  INITIALLY_SELECTED_RESOURCE_TYPES,
  RESOURCE_TYPES,
  INITIALLY_SELECTED_URL_MATCHER_TYPE,
  URL_MATCHER_TYPES,
  PREFERANCE_STORE,
  NETWORK_STORE
} from './constants';
import Connection from './connection';
import {
  generateIdFromRequestObject,
  setupStores
} from './utils';
import '@vaadin/multi-select-combo-box';
import '@vaadin/radio-group';
import '@vaadin/upload';

const stores = setupStores();
const { dispatch } = Connection(stores, false);

const handleResourceTypeChange = (evt) => {
  dispatch({
    targetStore: PREFERANCE_STORE,
    operation: OPERATIONS.WRITE,
    key: 'resourceTypes',
    data: evt.detail.value
  });
}

const comboBox = document.getElementById('resource-types');
comboBox.addEventListener("selected-items-changed", handleResourceTypeChange);

comboBox.items = Object.values(RESOURCE_TYPES);
comboBox.selectedItems = INITIALLY_SELECTED_RESOURCE_TYPES;


const handleURLMatcherChange = (evt) => {
  dispatch({
    targetStore: PREFERANCE_STORE,
    operation: OPERATIONS.WRITE,
    key: 'urlMatchType',
    data: evt.detail.value
  });
};

const urlMatcher = document.getElementById("url-matcher");
const urlOptions = document.querySelectorAll("url-matcher-radio-item");
urlOptions.forEach((urlOption, i) => {
  urlOption.value = URL_MATCHER_TYPES[i];

  if (URL_MATCHER_TYPES[i] === INITIALLY_SELECTED_URL_MATCHER_TYPE) {
    urlOption.checked = true;
  }
});

urlMatcher.addEventListener("value-changed", handleURLMatcherChange);
urlMatcher.value = INITIALLY_SELECTED_URL_MATCHER_TYPE;


const storeEntryData = async (entries) => {
  const requests = {};
  const responses = {};

  entries.forEach((entry) => {
    const { request, response } = entry;
    const idObject = generateIdFromRequestObject(request, true, urlMatcher.value);

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

  dispatch({
    targetStore: NETWORK_STORE,
    operation: OPERATIONS.WRITE,
    key: 'networkData',
    data: { requests, responses}
  });

  window.close();
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
};

const fileUpload = document.getElementById("file-upload");
fileUpload.addEventListener("upload-success", handleFileUpload);

