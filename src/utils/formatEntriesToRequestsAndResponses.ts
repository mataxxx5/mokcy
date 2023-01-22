import { Entry, Request, Response } from 'har-format'

import generateIdFromRequestObject from './generateIdFromRequestObject';

export default (entries: Entry[], urlMatcherType: string) => {
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
