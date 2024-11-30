import { useState } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Chip from '@mui/material/Chip'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { Har } from 'har-format'

import { useLoadedMock, MockData } from '../hooks/loadedMockContext'
import { DEFAULT_URL_MATCHER_TYPE } from '../../constants'
import {
  convertFileContentsIntoHARJson,
  formatEntriesToRequestsAndResponses
} from '../../utils'

interface fileUploadState {
  error: Error | null
  loading: boolean
}

const defaultFileUploadState = {
  error: null,
  loading: false
}

export default function FileUploadInput ({ mockingInProgress }: { mockingInProgress: boolean }) {
  const { loadedMock, setLoadedMock } = useLoadedMock()
  const [uploadedFile, setUploadedFile] = useState(defaultFileUploadState as fileUploadState)

  return (
    <FormControl>
      <FormLabel id="mc--url-matching-radio-buttons-group-label">HAR File</FormLabel>
      <div style={{ display: 'flex' }}>
        <>
          { (loadedMock == null) && (
            <LoadingButton
              component="label"
              loading={uploadedFile.loading}
              variant="outlined"
              endIcon={<UploadFileIcon />}
              loadingPosition="end"
              disabled={mockingInProgress}
            >
              Select .har file
              <input type="file" accept=".har" hidden onChange={(evt) => {
                const file = evt.target.files?.[0]
                const fileName = typeof file?.name === 'undefined' ? '' : file.name
                const fileReader = new FileReader()

                fileReader.onloadstart = () => {
                  setUploadedFile({
                    ...uploadedFile,
                    loading: true
                  })
                }

                fileReader.onload = (evt: ProgressEvent<FileReader>) => {
                  if (evt.type !== 'load') {
                    setUploadedFile(defaultFileUploadState)
                    return
                  }
                  try {
                    const urlMatcherType = DEFAULT_URL_MATCHER_TYPE
                    const HarAsJSON: Har | null = convertFileContentsIntoHARJson(evt)
                    let requestAndResponses = {}
                    let firstPageURL = null

                    if (HarAsJSON !== null) {
                      requestAndResponses = formatEntriesToRequestsAndResponses(HarAsJSON.log.entries, urlMatcherType)
                      const firstDocumentEntry = HarAsJSON.log.entries.find(({ response }) => response.content.mimeType === 'text/html')

                      if (typeof firstDocumentEntry?.request?.url === 'string') {
                        firstPageURL = firstDocumentEntry.request.url
                      }
                    }

                    console.log('[FileUploadInput] HarAsJSON: ', HarAsJSON)
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    setLoadedMock({
                      ...requestAndResponses,
                      mockName: fileName,
                      firstPageURL
                    } as MockData)
                    setUploadedFile({
                      ...defaultFileUploadState
                    })
                  } catch (e: any) {
                    setUploadedFile({
                      ...defaultFileUploadState,
                      error: e as Error
                    })
                  }
                }

                fileReader.onerror = () => {
                  setUploadedFile({
                    ...uploadedFile,
                    error: fileReader.error
                  })
                }

                if (file != null) {
                  fileReader.readAsText(file, 'utf-8')
                }
              }} />
            </LoadingButton>
          )}
          { (loadedMock != null) && (
              <Chip
                label={loadedMock.mockName}
                variant="outlined"
                color="success"
                onDelete={() => {
                  setUploadedFile(defaultFileUploadState)
                  setLoadedMock(null)
                }}
                disabled={mockingInProgress}
                style={{
                  width: '400px'
                }}
              />
          )}
        </>
      </div>
      {(uploadedFile.error != null) && (
        <div style={{ color: 'rgb(211, 47, 47)', fontWeight: 400 }}>
          {uploadedFile.error.name}: {uploadedFile.error.message}
        </div>
      )}
    </FormControl>
  )
}
