import { INITIALLY_SELECTED_URL_MATCHER_TYPE } from '../constants';

export default (requestObject, requestFromHARFile = false, urlMatchType) => {
  const { method, postData, url, queryString  } = requestObject;
  const idObject = { method, url };
  
  if (postData) {
    idObject.postData = requestFromHARFile ? postData.text : postData;
  }

  if (queryString) {
    idObject.url = `${url}${queryString}`;
  }

  if (urlMatchType === INITIALLY_SELECTED_URL_MATCHER_TYPE) {
    // console.log('urlMatchType.... ');
    const { pathname, search } = new URL(url);
    idObject.url = `${pathname}${search}`;
  }

  return btoa(JSON.stringify(idObject));
};