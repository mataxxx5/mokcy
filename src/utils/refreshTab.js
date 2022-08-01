export default async (tabToRefresh) => {
  return await new Promise((resolve, reject) => {
    try {
      chrome.tabs.reload(tabToRefresh.id, () => {
        resolve()
      });
    } catch (e) {
      reject(e);
    }
  });
};