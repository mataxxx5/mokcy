import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'

import {
  ResourceTypesInput,
  URLMatchingInput,
  FileUploadInput,
  LoadedMockSummary,
  StateButton
} from '../components'
import {
  RuntimeStore,
  ErrorStore,
  RuntimeData
} from '../../store'
import { useLoadedMock } from '../hooks/loadedMockContext'
import TitleSVG from '../../assets/images/title.svg'

const runtimeStore = new RuntimeStore()
const errorStore = new ErrorStore()

/*
 Below use of broadcast is a work around to trigger wake up of background SW.
 The SW should wake up via `chrome.storage.onChanged` triggers by `runtimeStore.store` call
 but currently existing defect - https://bugs.chromium.org/p/chromium/issues/detail?id=1407910&q=chrome.storage.onChanged&can=2
 means that this behaviour is not reliable.
*/
const wakeUpSWBroadcast = new BroadcastChannel('wake-up-service-worker')
const errorBroadcast = new BroadcastChannel('error-channel')

function App () {
  const { loadedMock } = useLoadedMock()
  const [mockingInProgress, setMockingInProgress] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  useEffect(() => {
    runtimeStore.registerUpdateLister((newRuntimeValue: RuntimeData) => {
      setMockingInProgress(newRuntimeValue.mockingInProgress)
    })
    runtimeStore.getAll().then((initialPreferencesValue: RuntimeData | null) => {
      setMockingInProgress(!(initialPreferencesValue == null) && initialPreferencesValue?.mockingInProgress)
    })
    errorStore.registerUpdateLister((newErrorValue: string) => {
      setErrorMessage(newErrorValue)
    })
    errorStore.getAll().then((initialErrorValue: string | null) => {
      setErrorMessage(initialErrorValue)
    })
    errorBroadcast.addEventListener('message', ({ data }) => {
      console.log('[Main] error: ', data)
      alert(data)
      runtimeStore.store({ mockingInProgress: false })
    })
  }, [])

  return (
    <div id='app-root'>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container rowSpacing={3} columns={1}>
          <Grid xs={1}>
            <TitleSVG height='38px' width={'100%'} />
            <h3 className='mc--heading-subtitle'>
              To start mocking, upload .HAR file that will be used to replace browser made request with pre-loaded data
            </h3>
          </Grid>
          <Grid xs={1}>
            <ResourceTypesInput mockingInProgress={mockingInProgress} />
          </Grid>
          <Grid xs={1}>
            <URLMatchingInput mockingInProgress={mockingInProgress} />
          </Grid>
          <Grid xs={1}>
            <FileUploadInput mockingInProgress={mockingInProgress} />
          </Grid>
          <Grid xs={1}>
            <StateButton
              mockingInProgress={mockingInProgress}
              setMockingInProgress={(newInProgressMockingValue: boolean) => {
                wakeUpSWBroadcast.postMessage({ mockingInProgress: newInProgressMockingValue })
                runtimeStore.store({ mockingInProgress: newInProgressMockingValue })
              } } />
          </Grid>
          {(loadedMock?.firstPageURL != null)
            ? <a href="#" onClick={async () => {
              const [focusedTab] = await chrome.tabs.query({ active: true, currentWindow: true, highlighted: true })
              if (focusedTab.id) {
                chrome.tabs.update(focusedTab.id, { url: loadedMock.firstPageURL })
              }
            }} >Launch to first recorded request</a>
            : null}
          {(typeof errorMessage === 'string') && (
            <Grid xs={1}>
              <div style={{ color: 'rgb(211, 47, 47)', fontWeight: 400 }}>
                {`Error: ${errorMessage}`}
              </div>
            </Grid>
          )}
          <Grid xs={1}>
            <LoadedMockSummary />
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default App
