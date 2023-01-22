import React from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

import { usePreferences } from '../hooks/preferencesContext'
import { URL_MATCHER_TYPES } from '../../constants'

interface URLMatchingInputProps {
  mockingInProgress: boolean
}

export default function URLMatchingInput ({ mockingInProgress }: URLMatchingInputProps) {
  const { preferences, setPreferences } = usePreferences()

  if (typeof preferences?.urlMatching === 'undefined') {
    return null
  }

  return (
    <FormControl>
      <FormLabel id="mc--url-matching-radio-buttons-group-label">URL Matching</FormLabel>
      <RadioGroup
        aria-labelledby="mc--url-matching-radio-buttons-group-label"
        name="url-matching-radio-buttons-group"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPreferences({
            ...preferences,
            urlMatching: (event.target as HTMLInputElement).value
          })
        }}
        value={preferences?.urlMatching}
        row
      >
        {URL_MATCHER_TYPES.map(({ value, label }) => (
          <FormControlLabel
            value={value}
            control={<Radio />}
            label={label}
            key={label}
            disabled={mockingInProgress}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}
