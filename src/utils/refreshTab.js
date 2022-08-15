export default async (tabToRefresh) => {
  await chrome.tabs.reload(tabToRefresh.id)
};