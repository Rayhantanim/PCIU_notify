import * as React from 'react';
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  InputLabel,
} from "@mui/material";

import TermsCheckbox from "./Checkbox";
import { Link, useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const navigate = useNavigate();
const [passwordError, setPasswordError] = React.useState("");
const [confirmError, setConfirmError] = React.useState("");
const [email, setEmail] = React.useState("");
const [emailError, setEmailError] = React.useState("");
const [checkingEmail, setCheckingEmail] = React.useState(false);




// validation password
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return "";
};

  /* Form State */
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    section: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = React.useState(false);

  /* Handle Input */
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "password") {
    const error = validatePassword(value);
    setPasswordError(error);

   if (emailError) {
  toast.error("Email already taken");
  return;
}



    // re-check confirm password
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }

  if (name === "confirmPassword") {
    if (value !== formData.password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }
};


  /* Handle Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Password Match Check */
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordError || confirmError) {
  toast.error("Please fix password errors");
  return;
}
 if (emailError) {
  toast.error("Email already exists");
  return;
}


    try {
      setLoading(true);

      /* API Call */
      // const res = await axios.post("http://localhost:5000/register", {
      const res = await axios.post("https://pciu-notify-backend.vercel.app/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        section: formData.section,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password,
      });

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
  };

 

  return (
    <div>
      <h2 className="text-center font-semibold text-5xl my-2">
        Create Account
      </h2>

      {/* FORM */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ "& > :not(style)": { m: 4, width: "400px", height: "32px" } }}
        autoComplete="off"
      >
        {/* First Name */}
        <TextField
          name="firstName"
          label="First Name"
          onChange={handleChange}
          required
        />

        {/* Last Name */}
        <TextField
          name="lastName"
          label="Last Name"
          onChange={handleChange}
          required
        />

        {/* Email */}

           <TextField
          name="email"
          label="Email"
          type="email"
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
        />


        {/* Phone */}
        <TextField name="phone" label="Phone" onChange={handleChange} />

        {/* Department */}
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

        {/* Section */}
        <TextField name="section" label="Section" onChange={handleChange} />

        {/* Gender */}
        <FormControl>
          <FormLabel>Gender</FormLabel>

          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />

            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />

            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* DOB */}
        <TextField
          name="dob"
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
        />

        {/* Password */}
        <TextField
  name="password"
  label="Password"
  type="password"
  onChange={handleChange}
  error={Boolean(passwordError)}
  helperText={passwordError}
  required
/>

        
        {/* Confirm Password */}
        <TextField
  name="confirmPassword"
  label="Confirm Password"
  type="password"
  onChange={handleChange}
  error={Boolean(confirmError)}
  helperText={confirmError}
  required
/>

      
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="text-white w-[500px] h-14 mx-auto mt-6 bg-[#263640] rounded-2xl"
        >
          {loading ? "Registering..." : "Submit"}
        </button>
      </Box>

      {/* Terms */}
      <TermsCheckbox />

      {/* Login Link */}
      <p className="mb-10 text-center mt-6">
        Already Have an Account?{" "}
        <Link
          to="/login"
          className="font-medium text-red-600 hover:text-red-500"
        >
          Login
        </Link>
      </p>

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}
