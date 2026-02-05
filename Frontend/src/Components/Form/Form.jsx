<<<<<<< Updated upstream
import * as React from 'react';
=======
import * as React from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  InputLabel
} from '@mui/material';
import TermsCheckbox from './Checkbox';

export default function CreateAccount() {
=======
  InputLabel,
} from "@mui/material";
import TermsCheckbox from "./Checkbox";
import { Link, useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

export default function CreateAccount() {
  //---------
  const [emailError, setEmailError] = React.useState("");
  const [emailStatus, setEmailStatus] = React.useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const checkEmail = async (email) => {
    if (!email) {
      setEmailError("");
      setEmailStatus("");
      return;
    }
    // Format validation first
    if (!validateEmail(email)) {
      setEmailError("Invalid email format (example: Rayhan@gmail.com)");
      setEmailStatus("");
      return;
    }
    // Valid format
    setEmailError("");
    try {
      // const res = await axios.get(`http://localhost:5000/check-email/${email}`);
      const res = await axios.get(`${API}/check-email/${email}`);

      if (res.data.exists) {
        setEmailStatus("exists");
      } else {
        setEmailStatus("available");
      }
    } catch (err) {
      console.log(err);
    }
  };

  //--------

  const navigate = useNavigate();

  /* Form State */
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    setFormData({ ...formData, [name]: value });
=======

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /* Handle Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email format check
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (emailStatus === "exists") {
      toast.error("This email is already registered!");
      return;
    }

    /* Password Match Check */
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      /* API Call */
      const res = await axios.post(`${API}/register`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          section: formData.section,
          gender: formData.gender,
          dob: formData.dob,
          password: formData.password,
        },
      );

      /* Success Toast */
      toast.success(res.data.message || "Registration Successful!");

      /* Redirect */
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      /* Error Toast */
      toast.error(err.response?.data?.message || "Registration Failed!");
    } finally {
      setLoading(false);
    }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          onChange={handleChange}
        />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          onChange={handleChange}
=======
          value={formData.email}
          onChange={(e) => {
            handleChange(e);
            checkEmail(e.target.value);
          }}
          required
          error={emailStatus === "exists" || Boolean(emailError)}
          helperText={
            emailError
              ? emailError
              : emailStatus === "exists"
                ? "Email already registered"
                : emailStatus === "available"
                  ? "Email is available"
                  : ""
          }
>>>>>>> Stashed changes
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
