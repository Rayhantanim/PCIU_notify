import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
export default function RoleSignupForm({ role = "student", goBack }) {
  // const API = "http://localhost:5000";
  const API = "http://localhost:5000";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    teacherId: "",
    staffId: "",
    shortName: "",
    email: "",
    phone: "",
    dob: "",
    department: "",
    section: "",
    password: "",
    confirmPassword: "",
  });

  const formatId = (value) => {
    // Remove everything except letters & numbers
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    // Split parts
    let part1 = cleaned.slice(0, 3); // CSE
    let part2 = cleaned.slice(3, 6); // 031
    let part3 = cleaned.slice(6, 11); // 08177
    let formatted = part1;
    if (part2) formatted += " " + part2;
    if (part3) formatted += " " + part3;
    return formatted;
  };
  
  const [isFocused, setIsFocused] = useState(false);

  const [passwordValid, setPasswordValid] = useState({});
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departments = ["CSE", "EEE", "BBA", "ENG", "LLB", "BFT"];
  const sectionsByDepartment = {
    CSE: ["31A", "31B", "31C"],
    EEE: ["A", "B"],
    BBA: ["A", "B"],
    English: ["A"],
  };
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const { password } = formData;
    setPasswordValid({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
      minLength: password.length >= 8,
    });
  }, [formData.password]);

  const [emailValid, setEmailValid] = useState(null); // null | true | false
  const [emailAvailable, setEmailAvailable] = useState(null); // null = unknown, true = free, false = taken
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (!formData.email) {
      setEmailValid(null);
      setEmailAvailable(null);
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    setEmailValid(isValid);
    if (!isValid) {
      setEmailAvailable(null);
      return;
    }

  const currentEmail = formData.email;

const timer = setTimeout(async () => {
  setCheckingEmail(true);

  try {
    const res = await fetch(`${API}/api/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail }),
    });

    const data = await res.json();

if (res.ok) {
  localStorage.setItem("user", JSON.stringify(data.user));
}
    console.log("user", data)

    if (currentEmail === formData.email) {
      setEmailAvailable(data.available);
    }

  } catch (err) {
    console.error(err);
    setEmailAvailable(false);
  } finally {
    setCheckingEmail(false);
  }
}, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    //================Format Ids==================
    if (name === "studentId") {
      setFormData({
        ...formData,
        studentId: formatId(value),
      });
    } else if(name === "teacherId"){
      setFormData({
        ...formData,
        teacherId: formatId(value),
      });
    } else if(name === "staffId"){
      setFormData({
        ...formData,
        staffId: formatId(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Check password match
    if (name === "password" || name === "confirmPassword") {
      const newFormData = {
        ...formData,
        [name]: value,
      };
      if (newFormData.password && newFormData.confirmPassword) {
        setPasswordMismatch(newFormData.password !== newFormData.confirmPassword);
      } else {
        setPasswordMismatch(false);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }
    // Check if all password requirements are met
    if (!Object.values(passwordValid).every(Boolean)) {
      toast.error("Password does not meet requirements ⚠️");
      return;
    }
    // Check if email is available
    if (emailAvailable === false) {
      toast.error("Email already taken ❌");
      return;
    }
    try {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await res.json();
        console.log("sent data", data)
      if (!res.ok) {
        alert(data.message);
        return;
      }

      toast.success("Signup successful 🎉");
      console.log(data);
      navigate('/dashboard/overview')
    } 
    catch (err) {
      toast.error("Server error ⚠️");
    }
  };

  const availableSections = sectionsByDepartment[formData.department] || [];
  const glassSelect = "flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
  
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          {role.charAt(0).toUpperCase() + role.slice(1)} Sign Up
        </h1>
        {/* Name */}
        <div className="flex gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
          />
        </div>

        {/* Role-specific fields */}
        {role === "student" && (
          <>
            <input
              type="text"
              name="studentId"
              placeholder="CSE 031 08177"
              value={formData.studentId}
              onChange={handleChange}
              required
              maxLength={13}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
            />
            <div className="flex gap-4">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={glassSelect}
              >
                <option value="" className="text-black">
                  Select Department
                </option>
                {departments.map((dep) => (
                  <option key={dep} value={dep} className="text-black">
                    {dep}
                  </option>
                ))}
              </select>

              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className={glassSelect}
              >
                <option value="" className="text-black">
                  Select Section
                </option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec} className="text-black">
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {role === "teacher" && (
          <>
            <input
              type="text"
              name="teacherId"
              placeholder="Teacher ID"
              value={formData.teacherId}
              onChange={handleChange}
              required
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
            />
            <input
              type="text"
              name="shortName"
              placeholder="Short Name"
              value={formData.shortName}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
            />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className={glassSelect}
            //   className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
            >
              <option value="" className="text-black">Select Department</option>
              {departments.map((dep) => (
                <option key={dep} value={dep} className="text-black">
                  {dep}
                </option>
              ))}
            </select>
            


            
          </>
        )}

        {role === "staff" && (
          <input
            type="text"
            name="staffId"
            placeholder="Staff ID"
            value={formData.staffId}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
          />
        )}

        {/* Common Fields */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
        //   onChange={handleChange}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value.toLowerCase() })
          }
          required
          className={`px-4 py-2 rounded-lg bg-white/20 border ${
            emailValid === false
              ? "border-yellow-400"
              : emailAvailable === false
                ? "border-red-500"
                : emailAvailable === true
                  ? "border-green-400"
                  : "border-white/30"
          } text-white placeholder-gray-300`}
        />

        {formData.email && (
          <span className="text-sm">
            {emailValid === false && (
              <span className="text-yellow-400">Invalid email format ⚠️</span>
            )}
            {emailValid && checkingEmail && (
              <span className="text-blue-400">Checking availability...</span>
            )}
            {emailValid && emailAvailable && !checkingEmail && (
              <span className="text-green-400">Email is available ✅</span>
            )}
            {emailValid && emailAvailable === false && !checkingEmail && (
              <span className="text-red-400">Email already taken ❌</span>
            )}
          </span>
        )}

        <input
          type="tel"
          name="phone"
          placeholder="Phone (01XXXXXXXXX)"
          value={formData.phone}
          onChange={handleChange}
          pattern="01[0-9]{9}"
          required
          className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
        />

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
        />

        {/* Password with show/hide */}
        <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2 text-white/60"
        >
          {showPassword ? <VisibilityOff/> : <Visibility/>}
        </button>
      </div>

      {/* Show password rules only when input is focused */}
      {isFocused && (
        <div className="flex flex-col text-sm text-gray-300 mt-2">
          <span className={`flex items-center ${passwordValid.uppercase ? "text-green-400" : ""}`}>
            {passwordValid.uppercase && <span className="mr-1">✔</span>} At least one uppercase letter
          </span>
          <span className={`flex items-center ${passwordValid.lowercase ? "text-green-400" : ""}`}>
            {passwordValid.lowercase && <span className="mr-1">✔</span>} At least one lowercase letter
          </span>
          <span className={`flex items-center ${passwordValid.number ? "text-green-400" : ""}`}>
            {passwordValid.number && <span className="mr-1">✔</span>} At least one number
          </span>
          <span className={`flex items-center ${passwordValid.specialChar ? "text-green-400" : ""}`}>
            {passwordValid.specialChar && <span className="mr-1">✔</span>} At least one special character (!@#$%^&*)
          </span>
          <span className={`flex items-center ${passwordValid.minLength ? "text-green-400" : ""}`}>
            {passwordValid.minLength && <span className="mr-1">✔</span>} Minimum 8 characters
          </span>
        </div>
      )}

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg bg-white/20 border ${
              passwordMismatch ? "border-red-500" : "border-white/30"
            } text-white placeholder-gray-300`}
          />
          <button
            type="button"
            onClick={() => setShowConPassword(!showConPassword)}
            className="absolute right-3 top-2 text-white/60"
          >
           {showConPassword ? <VisibilityOff/> : <Visibility/>}
          </button>
        </div>
        {passwordMismatch && formData.confirmPassword && (
          <span className="text-red-400 text-sm">Passwords do not match ❌</span>
        )}

        <button
          type="submit"
          disabled={passwordMismatch || !Object.values(passwordValid).every(Boolean) || emailAvailable === false}
          className="mt-4 px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium transition"
        >
          Sign Up
        </button>

        <button
          type="button"
          onClick={goBack}
          className="mt-2 px-6 py-3 rounded-2xl border border-white/40 text-white font-medium hover:bg-white hover:text-black transition"
        >
          Go Back
        </button>
      </form>
    </div>
  );
}
