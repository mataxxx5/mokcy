import {
  RuntimeStore,
  RuntimeData
} from '../store'
import RequestInterceptor from './request-interceptor'
import RequestResolver from './request-resolver'

new BroadcastChannel('wake-up-service-worker').onmessage = () => {
  console.log('[index] waking up service worker')
}

const runtimeStore = new RuntimeStore()
const requestResolver = new RequestResolver()
const requestInterceptor = new RequestInterceptor(
  requestResolver.handleRequest.bind(requestResolver),
  () => {
    runtimeStore.store({ mockingInProgress: false })
  }
)

runtimeStore.registerUpdateLister(async (newRuntimeValue: RuntimeData) => {
  console.log('[index] newRuntimeValue: ', newRuntimeValue)
  if (newRuntimeValue.mockingInProgress) {
    await requestResolver.loadContext();
    requestInterceptor.startInterceptingOutgoingRequests()
  } else {
    requestInterceptor.stopInterceptingOutgoingRequests()
  }
})
