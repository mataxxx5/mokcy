
type StringMap = Record<string, string>

export const harErrorToErrorReasonMap: StringMap = Object.freeze({
  Failed: 'net::ERR_FAILED',
  Aborted: 'net::ERR_ABORTED',
  TimedOut: 'net::ERR_TIMED_OUT',
  AccessDenied: 'net::ERR_ACCESS_DENIED',
  ConnectionClosed: 'net::ERR_CONNECTION_CLOSED',
  ConnectionReset: 'net::ERR_CONNECTION_RESET',
  ConnectionRefused: 'net::ERR_CONNECTION_REFUSED',
  ConnectionAborted: 'net::ERR_CONNECTION_ABORTED',
  ConnectionFailed: 'net::ERR_CONNECTION_FAILED',
  NameNotResolved: 'net::ERR_NAME_NOT_RESOLVED',
  InternetDisconnected: 'net::ERR_INTERNET_DISCONNECTED',
  AddressUnreachable: 'net::ERR_ADDRESS_UNREACHABLE',
  BlockedByClient: 'net::ERR_BLOCKED_BY_CLIENT',
  BlockedByResponse: 'net::ERR_BLOCKED_BY_RESPONSE',
  CertAuthorityInvalid: 'net::ERR_CERT_AUTHORITY_INVALID'
})

export const harErrorToErrorResonMap: StringMap = Object.freeze(Object.entries(harErrorToErrorReasonMap).reduce<StringMap>((acc, keyValuePair) => {
  const [key, value] = keyValuePair
  acc[value] = key

  return acc
}, {}))
