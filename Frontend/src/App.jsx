import React from "react";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/SignUp/Signup";
import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";

const App = () => {
  return (
    <div>
      {/* <Navbar/> */}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/" element={<Login/>} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/test" element={<LandingPage />} />
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
        }}
      />
    </div>
  );
};

export default App;
