import { encode } from 'js-base64'
import { Request } from 'har-format'

import { IGNORE_HOSTNAME_URL_MATCHER } from '../constants'

interface IdObject {
  method: Request['method']
  url: Request['url']
  postData?: string | Request['postData']
}

export default (requestObject: Request, urlMatcherType: string) => {
  const { method, postData, url } = requestObject
  const idObject: IdObject = { method, url }

  if (postData != null) {
    // har files storage postData as postData object, debugger request have postData as a string
    idObject.postData = typeof postData.text !== 'undefined' ? postData.text : postData
  }

  if (urlMatcherType === IGNORE_HOSTNAME_URL_MATCHER.value) {
    const { pathname, search } = new URL(url)
    idObject.url = `${pathname}${search}`
  }

  return encode(JSON.stringify(idObject))
}
