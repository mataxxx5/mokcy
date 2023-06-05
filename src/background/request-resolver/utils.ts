
import { Response, Request } from 'har-format'

interface formattedMockedResponse {
  requestId: string
  responseCode: number
  responseHeaders: Request['headers']
  body: string
}

export type ErrorResponse = Response & {
  _error: string
}

// formats a HAR response in an acceptable format for the debuggger
export const formatMockedResponse = (params: any, matchingMockResponse: Response): formattedMockedResponse => {
  const body = matchingMockResponse.content?.encoding === 'base64'
    ? matchingMockResponse.content?.text ?? ''
    : btoa(unescape(encodeURIComponent(matchingMockResponse.content?.text ?? '')))

  return {
    requestId: params.requestId,
    responseCode: matchingMockResponse.status,
    responseHeaders: matchingMockResponse.headers,
    body
  }
}
