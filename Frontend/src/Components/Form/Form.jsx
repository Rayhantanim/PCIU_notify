import * as React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import TermsCheckbox from './Checkbox';

export default function CreateAccount() {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    section: '',
    gender: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <h2 className="text-center font-semibold text-5xl my-8">
        Create Account
      </h2>
      

      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '300px' } }}
        autoComplete="off"
      >
 
        <TextField name="firstName" label="First Name" onChange={handleChange} />
        <TextField name="lastName" label="Last Name" onChange={handleChange} />


        <TextField
          name="email"
          label="Email"
          type="email"
          onChange={handleChange}
        />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          onChange={handleChange}
        />

        <FormControl>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={formData.department}
            onChange={handleChange}
            label="Department"
          >
            <MenuItem value="CSE">CSE</MenuItem>
            <MenuItem value="EEE">EEE</MenuItem>
            <MenuItem value="BBA">BBA</MenuItem>
            <MenuItem value="ENG">English</MenuItem>
          </Select>
        </FormControl>

        <TextField name="section" label="Section" onChange={handleChange} />

  
        <FormControl>
          <FormLabel>Gender</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

     
        <TextField
          name="dob"
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
        />

   
        <TextField
          name="password"
          label="Password"
          type="password"
          onChange={handleChange}
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          onChange={handleChange}
        />
      </Box>
      
<TermsCheckbox></TermsCheckbox>
      <div className='text-white w-[500px] h-14 text-center mx-auto flex justify-center items-center  bg-[#263640] rounded-2xl border mt-10'>
      <p className='' >Submit</p>
      </div>
      <p className='mb-10 text-center'> Already Have an Account? Please Login </p>
    </div>
  );
}
