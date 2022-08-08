export const createStore = ({
  onWrite = () => {},
  onRead = () => {},
  onReset = () => {},
  onInitialization = () => {},
  name
}) => {
  const store = {
    name: name,
    content: {}
  };

  const _onWrite = (updateData) => onWrite(updateData);
  const _onRead = (readData) => onRead(readData);
  const _onReset = () => onReset(readData);
  const read = (key) => {
    const requestedData = store.content?.[key]
    _onRead(requestedData);
    return requestedData;
  };

  const write = (key, data) => {
    store.content[key] = data;
    _onWrite(data);
  };

  const reset = () => {
    store.content = {};
    _onReset();
  }

  const getStoreName = () => store.name;

  onInitialization();

  return {
    getStoreName,
    read,
    write,
    reset
  };
};

