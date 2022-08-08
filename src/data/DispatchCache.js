
const DispatchCache = () => {
  const _cache = {};
  const addEntry = (id, entry) => {
    _cache[id] = entry;
  }
  const getEntry = (id) => {
    _cache[id];
  }
  const removeEntry = (id) => {
    delete _cache[id]
  };
  const getCache = () => _cache;

  return {
    addEntry,
    getEntry,
    removeEntry,
    getCache
  };
};

export default DispatchCache;