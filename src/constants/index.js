export const NETWORK_STORE = 'network_store';
export const RUNTIME_STORE = 'runtime_store';
export const PREFERANCE_STORE = 'preferance_store';

export const STORE_LIST = [ 
  NETWORK_STORE,
  RUNTIME_STORE,
  PREFERANCE_STORE
];

export const PORTS = {
  NETWORK_STORE,
  RUNTIME_STORE,
  PREFERANCE_STORE
};

export const OPERATIONS = {
  WRITE: "WRITE",
  READ: "READ"
};

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
};

const MATCHHOSTNAME = 'Match hostname';
const IGNOREHOSTNAME = 'Ignore hostname';

export const URL_MATCHER_TYPES = [
  MATCHHOSTNAME,
  IGNOREHOSTNAME
];

export const INITIALLY_SELECTED_RESOURCE_TYPES = [RESOURCE_TYPES.XHR, RESOURCE_TYPES.FETCH];
export const INITIALLY_SELECTED_URL_MATCHER_TYPE = IGNOREHOSTNAME;

export default {
  INITIALLY_SELECTED_URL_MATCHER_TYPE,
  URL_MATCHER_TYPES,
  INITIALLY_SELECTED_RESOURCE_TYPES,
  RESOURCE_TYPES,
  STORE_LIST,
  PORTS,
  OPERATIONS,
  NETWORK_STORE,
  RUNTIME_STORE,
  PREFERANCE_STORE
};
