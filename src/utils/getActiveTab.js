export default async () => {
  return await new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        resolve(tabs[0]);
      });
    } catch (e) {
      reject(e);
    }
  });
}