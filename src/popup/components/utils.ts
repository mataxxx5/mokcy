import { encode } from 'js-base64'
import { Entry, Request, Response } from 'har-format'
import { IGNORE_HOSTNAME_URL_MATCHER } from '../constants'

export const convertFileContentsIntoHARJson = (evt: ProgressEvent<FileReader>) => {
  if (typeof evt?.target?.result === 'string') {
    return JSON.parse(evt.target.result)
  }

  return null
}

export const formatEntriesToRequestsAndResponses = (entries: Entry[], urlMatcherType: string) => {
  const requests: Record<string, Request> = {}
  const responses: Record<string, Response> = {}

  entries.forEach((entry) => {
    const { request, response } = entry
    const idObject = generateIdFromRequestObject(request, urlMatcherType)

    /* need to explore handling multiple request and responses with the same id
    requests[`${idObject}`] = requests[`${idObject}`] ?
      [
        ...requests[`${idObject}`],
        request
      ] :
      [
        request
      ];
    */
    requests[`${idObject}`] = request
    responses[`${idObject}`] = response
  })

  return {
    requests,
    responses
  }
}

interface IdObject {
  method: Request['method']
  url: Request['url']
  postData?: string | Request['postData']
}

export const generateIdFromRequestObject = (requestObject: Request, urlMatcherType: string) => {
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
