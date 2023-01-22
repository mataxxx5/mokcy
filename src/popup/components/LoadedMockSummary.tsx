import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import { Response } from 'har-format'
import { useLoadedMock } from '../hooks/loadedMockContext'

const LoadedMockSummary = () => {
  const { loadedMock } = useLoadedMock()

  if (loadedMock == null) {
    return null
  }

  const [successfulRequests, failedRequests] = Object.values(loadedMock.responses).reduce<Response[][]>((acc, val) => {
    if (val.status === 200) {
      acc[0].push(val)
    } else {
      acc[1].push(val)
    }

    return acc
  }, [[], []])

  return (
    <FormControl style={{ width: '100%' }}>
      <FormLabel id="mc--url-matching-radio-buttons-group-label">Loaded mock summary</FormLabel>
      <div style={{
        display: 'flex'
      }}>
        <div>
          <div> Total requests: {successfulRequests.length + failedRequests.length} </div>
          <div> Successful requests: {successfulRequests.length} </div>
          <div> Failed requests: {failedRequests.length} </div>
        </div>
        <div style={{
          justifySelf: 'flex-start',
          flexGrow: 4,
          textAlign: 'end',
          height: '100%'
        }}>
          {/* <ArrowForwardOutlinedIcon/> */}
        </div>
      </div>
    </FormControl>
  )
}

export default LoadedMockSummary
