export default (requestObject) => {
  const { method, postData, url, queryString  } = requestObject;
  const idObject = { method, url };
  if (postData) {
    idObject.postData = postData;
  }
  if (queryString) {
    idObject.url = `${url}${queryString}`;
  }

  return btoa(JSON.stringify(idObject));
};