import { useState, useEffect, Component } from 'react'
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
} from '../../common-runtime-components/store'

import TitleSVG from '../../assets/images/title.svg'

interface Props {}

interface State {
  mockingInProgress: boolean
  errorMessage: String | undefined
}

const runtimeStore = new RuntimeStore()
const errorStore = new ErrorStore()
let runnCount = 0
function App (): JSX.Element {
  const [mockingInProgress, setMockingInProgressS] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<String | undefined>()
  const setMockingInProgress = (dd: boolean) => {
    setMockingInProgressS(dd)
  }
  useEffect(() => { // reacts to updates made to store
    runtimeStore.registerUpdateLister('runtime', (newRuntimeValue: RuntimeData) => {
      runnCount++
      console.trace()
      console.log('runnign this now count: ', runnCount)
      setMockingInProgress(newRuntimeValue.mockingInProgress)
    })
  }, [])

  useEffect(() => { // reacts to updates made to store
    errorStore.registerUpdateLister('error', (newErrorValue: string) => {
      console.log('[App] newErrorValue: ', newErrorValue)
      setErrorMessage(newErrorValue)
    })
  }, [])

  useEffect(() => { // initialise context with what's already in the store
    runtimeStore.getAll().then((initialPreferencesValue: RuntimeData | undefined) => {
      console.log('[App] setting initial value for runtime data: ', initialPreferencesValue)
      setMockingInProgress(!(initialPreferencesValue == null) && initialPreferencesValue?.mockingInProgress)
    })
  }, [])

  useEffect(() => { // initialise context with what's already in the store
    errorStore.getAll().then((initialErrorValue: string | undefined) => {
      console.log('[App] setting initial value for error data: ', initialErrorValue)

      setErrorMessage(initialErrorValue)
    })
  }, [])

  console.log('[App] error: ', errorMessage)
  return (
    <div id='app-root'>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container rowSpacing={3} columns={1}>
          <Grid xs={1}>
            <TitleSVG height='38px' width={'100%'}/>
            <h3 className='mc--heading-subtitle'>To start mocking, upload .HAR file that will be used to replace browser made request with pre-loaded data</h3>
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
                runtimeStore.store({ mockingInProgress: newInProgressMockingValue })
              }}
            />
          </Grid>
          { ((errorMessage != null) && errorMessage?.length > 0) && (
            <Grid xs={1}>
              <div style={{ color: 'rgb(211, 47, 47)', fontWeight: 400 }}>
                {`Error: ${errorMessage}`}
              </div>
            </Grid>
          )}
          <Grid xs={1}>
            <LoadedMockSummary/>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default App
