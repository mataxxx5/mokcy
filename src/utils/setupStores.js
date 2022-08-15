import { STORE_LIST } from '../constants';
import Store from '../store';

export default (storesConfig) => {
  const stores = {};

  STORE_LIST.forEach(storeName => {
    stores[storeName] = Store({
      name: storeName,
      ...storesConfig?.[storeName]
    }, stores);
  });

  return stores;
};