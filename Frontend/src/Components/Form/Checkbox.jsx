import * as React from 'react';
import { FormControlLabel, Checkbox, FormGroup } from '@mui/material';

export default function TermsCheckbox() {
  const [accepted, setAccepted] = React.useState(false);

  return (
    <FormGroup className='ml-3'>
      <FormControlLabel
        control={
          <Checkbox className=''
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            sx={{
              borderRadius: '100%', 
              '&.Mui-checked': {
                color: '#263640', 
              },
            }}
          />
        }
        label="I accept the Terms & Conditions"
      />
    </FormGroup>
  );
}
