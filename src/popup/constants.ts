export const RESOURCE_TYPES = {
  XHR: 'XHR',
  FETCH: 'Fetch',
  SCRIPT: 'Script',
  DOCUMENT: 'Document',
  STYLESHEET: 'Stylesheet',
  IMAGE: 'Image',
  MEDIA: 'Media',
  FONT: 'Font',
  TEXTTRACK: 'TextTrack',
  PREFETCH: 'Prefetch',
  EVENTSOURCE: 'EventSource',
  WEBSOCKET: 'WebSocket',
  MANIFEST: 'Manifest',
  SIGNEDEXCHANGE: 'SignedExchange',
  PING: 'Ping',
  CPSVIOLATIONREPORT: 'CSPViolationReport',
  PREFLIGHT: 'Preflight',
  OTHER: 'Other'
}

export const DEFAULT_RESOURCE_TYPES = [
  RESOURCE_TYPES.XHR,
  RESOURCE_TYPES.FETCH
]

export const IGNORE_HOSTNAME_URL_MATCHER = {
  label: 'Ignore hostname',
  value: 'IGNORE_HOSTNAME'
}

export const URL_MATCHER_TYPES = [
  IGNORE_HOSTNAME_URL_MATCHER,
  {
    label: 'Match hostname',
    value: 'MATCH_HOSTNAME'
  }
]

export const DEFAULT_URL_MATCHER_TYPE = IGNORE_HOSTNAME_URL_MATCHER.value

export enum STORAGE_KEYS {
  NETWORK_MOCKS = 'NETWORK_MOCKS',
  RUNTIME_EVENTS = 'RUNTIME_EVENTS',
  PREFERENCE_SETTINGS = 'PREFERENCE_SETTINGS',
  RUNTIME_ERRORS = 'RUNTIME_ERRORS'
}

export type STORAGE_KEYS_STRINGS = keyof typeof STORAGE_KEYS
