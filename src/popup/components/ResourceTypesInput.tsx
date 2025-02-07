import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

import { usePreferences } from '../hooks/preferencesContext'
import { RESOURCE_TYPES, DEFAULT_URL_MATCHER_TYPE } from '../../constants'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

interface ResourceTypesInputProps {
  mockingInProgress: boolean
}

const ResourceTypesInput = ({ mockingInProgress }: ResourceTypesInputProps) => {
  const { preferences, setPreferences } = usePreferences()

  console.log('[ResourceTypesInput] preferences: ', preferences)

  return (
    <FormControl style={{ width: '100%' }}>
      <FormLabel id="mc--url-matching-radio-buttons-group-label">
        Resource Types
      </FormLabel>
      <Autocomplete
        multiple
        id="mc--resource-types-checkboxes-tags"
        options={[
          'All',
          ...Object.values(RESOURCE_TYPES)
        ]}
        disableCloseOnSelect
        value={preferences?.resourceTypes || []}
        limitTags={2}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </li>
        )}
        style={{ width: '100%' }}
        renderInput={(params) => (
          <TextField {...params} />
        )}
        disabled={mockingInProgress}
        onChange={(event, newValue) => {
          if (newValue[newValue.length - 1] === 'All') {
            preferences ? 
              setPreferences({
                ...preferences,
                resourceTypes: Object.values(RESOURCE_TYPES)
              }) :
              setPreferences({
                urlMatching: DEFAULT_URL_MATCHER_TYPE,
                resourceTypes: Object.values(RESOURCE_TYPES)
              }) 
          } else {
            preferences ? 
              setPreferences({
                ...preferences,
                resourceTypes: newValue
              }) :
              setPreferences({
                urlMatching: DEFAULT_URL_MATCHER_TYPE,
                resourceTypes: newValue
              }) 
          }
        }}
      />
    </FormControl>
  )
}

export default ResourceTypesInput
