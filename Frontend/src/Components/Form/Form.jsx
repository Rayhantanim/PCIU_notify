import * as React from "react";
import axios from "axios";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
const API = "https://pciu-notify-backend.vercel.app";
// const API = "http://localhost:5000";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmError, setConfirmError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [emailStatus, setEmailStatus] = React.useState("");
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
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

  const validatePassword = (password) => {
    if (!/[A-Z]/.test(password)) return "One uppercase required";
    if (!/[a-z]/.test(password)) return "One lowercase required";
    if (!/[0-9]/.test(password)) return "One number required";
    if (!/[!@#$%^&*]/.test(password)) return "One special character required";
    if (password.length < 8) return "Minimum 8 characters";
    return "";
  };

  const checkEmail = async (email) => {
    if (!email) return;
    try {
      setCheckingEmail(true);
      const res = await axios.get(`${API}/check-email/${email}`);
      if (res.data.exists) {
        setEmailStatus("exists");
        setEmailError("Email already registered");
      } else {
        setEmailStatus("available");
        setEmailError("");
      }
    } 
    catch (err) {
      console.log("Email check error:", err);
    } 
    finally {
      setCheckingEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      const error = validatePassword(value);
      setPasswordError(error);

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

    if (name === "email") {
      checkEmail(value);
    }
  };
console.log(formData)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || confirmError) {
      toast.error("Fix password errors");
      return;
    }

    if (emailStatus === "exists") {
      toast.error("Email already exists");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/register`, {
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

      toast.success(res.data.message || "Registration Successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center font-semibold text-5xl my-4">
        Create Account
      </h2>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          "& > :not(style)": {
            m: 2,
            width: "400px",
          },
        }}
        autoComplete="off"
      >
        <TextField
          name="firstName"
          label="First Name"
          onChange={handleChange}
          required
        />

        <TextField
          name="lastName"
          label="Last Name"
          onChange={handleChange}
          required
        />

        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={emailStatus === "exists"}
          helperText={
            emailStatus === "exists"
              ? "Email already registered"
              : emailStatus === "available"
                ? "Email available"
                : checkingEmail
                  ? "Checking..."
                  : ""
          }
        />

        <TextField name="phone" label="Phone" onChange={handleChange} />

        <FormControl fullWidth>
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
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
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
          type={showPassword ? "text" : "password"}
          onChange={handleChange}
          error={Boolean(passwordError)}
          helperText={passwordError}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          onChange={handleChange}
          error={Boolean(confirmError)}
          helperText={confirmError}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <button
          type="submit"
          disabled={loading || checkingEmail}
          className="text-white w-[400px] h-12 mx-auto mt-6 bg-[#263640] rounded-xl"
        >
          {loading ? "Registering..." : "Submit"}
        </button>
      </Box>

      <TermsCheckbox />

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
