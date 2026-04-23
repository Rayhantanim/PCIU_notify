import React from "react";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/SignUp/Signup";
import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
import HomePage from "./Pages/HomePage";
// import HomePage from "./Pages/Home";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./Pages/DashboardLayout/DashboardLayout";
import Dashboard from "./Components/dashboards/Dashboard";
import AllNotices from "./Pages/AllNotices";
import TeacherDashboard from "./Components/dashboards/TeacherDashboard";
import StudentNotices from "./Pages/StudentNotices";
import AllStudent from "./Pages/AllStudent";
import AllTeacher from "./Pages/AllTeacher";
import ImportantNotice from "./Pages/importantNotice";
import RoutineViewer from "./Components/routine/routine";

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<RoutineViewer/>} />
        {/* Protected Route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
          <Route path="/profile" element={<Profile />} />
        {/* <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        /> */}
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route path="dashboardindex" element={<TeacherDashboard />} />
          <Route path="allnotices" element={<AllNotices/>} />
          <Route path="stuNotices" element={<StudentNotices/>} />
          <Route path="allstudent" element={<AllStudent/>} />
          <Route path="allteacher" element={<AllTeacher/>} />
          <Route path="impnotices" element={<ImportantNotice/>} />
        </Route>
      </Routes>

      {/* <Routes> */}
      {/* <Route path="/" element={<LandingPage />} /> */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/home" element={<HomePage/>} /> */}
      {/* <Route path="/" element={<Login/>} /> */}
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/signup" element={<Signup />} /> */}
    
      {/* <Route path="/test" element={<LandingPage />} /> */}
      {/* </Routes> */}

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
