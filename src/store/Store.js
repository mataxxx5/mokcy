const Store = ({
  onWrite = () => {},
  onRead = () => {},
  onReset = () => {},
  onInitialization = () => {},
  name
}, allStores) => {
  const store = {
    name: name,
    content: {}
  };

  const _onWrite = (key, updateData) => onWrite(key, updateData, allStores);
  const _onRead = (key, readData) => onRead(key, readData, allStores);
  const _onReset = () => onReset(readData, allStores);
  
  const read = (key) => {
    const requestedData = store.content?.[key]
    _onRead(key, requestedData);
    return requestedData;
  };

  const write = (key, data) => {
    store.content[key] = data;
    _onWrite(key, data);
  };

  const reset = () => {
    store.content = {};
    _onReset();
  }

  const getStoreName = () => store.name;

  onInitialization(allStores);

  return {
    getStoreName,
    read,
    write,
    reset
  };
};

export default Store;