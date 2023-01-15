import Button from '@mui/material/Button'

import { useLoadedMock } from '../hooks/loadedMockContext'

export default function StateButton ({ mockingInProgress, setMockingInProgress }: { mockingInProgress: boolean, setMockingInProgress: (newInProgressMockingValue: boolean) => void }) {
  const { loadedMock } = useLoadedMock()

  return (
    <Button
      variant="contained"
      style={{ width: '100%', backgroundColor: mockingInProgress ? '#D6BE97' : '#707EBC' }}
      onClick={(() => {
        setMockingInProgress(!mockingInProgress)
      })}
      disabled={loadedMock == null}
    >
      {mockingInProgress ? 'Stop Mocking' : 'Start mocking!' }
    </Button>
  )
}
