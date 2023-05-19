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
} from '../../common-runtime-components/store'
import TitleSVG from '../../assets/images/title.svg'

const runtimeStore = new RuntimeStore()
const errorStore = new ErrorStore()

const App = () => {
  const [mockingInProgress, setMockingInProgress] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  useEffect(() => {
    runtimeStore.registerUpdateLister('runtime', (newRuntimeValue: RuntimeData) => {
      setMockingInProgress(newRuntimeValue.mockingInProgress)
    })
    runtimeStore.getAll().then((initialPreferencesValue: RuntimeData | null) => {
      setMockingInProgress(!(initialPreferencesValue == null) && initialPreferencesValue?.mockingInProgress)
    })
    errorStore.registerUpdateLister('error', (newErrorValue: string) => {
      setErrorMessage(newErrorValue)
    })
    errorStore.getAll().then((initialErrorValue: string | null) => {
      setErrorMessage(initialErrorValue)
    })
  }, [])

  return (
    <div id='app-root'>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container rowSpacing={3} columns={1}>
          <Grid xs={1}>
            <TitleSVG height='38px' width={'100%'}/>
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
                runtimeStore.store({ mockingInProgress: newInProgressMockingValue })
              }}
            />
          </Grid>
          { (typeof errorMessage === 'string' && errorMessage.length > 0) && (
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
