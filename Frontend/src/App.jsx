import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
import HomePage from "./Pages/HomePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./Pages/DashboardLayout/DashboardLayout";
import AllNotices from "./Pages/AllNotices";
import TeacherDashboard from "./Components/dashboards/TeacherDashboard";
import StudentNotices from "./Pages/StudentNotices";
import AllStudent from "./Pages/AllStudent";
import AllTeacher from "./Pages/AllTeacher";
import ImportantNotice from "./Pages/importantNotice";
import StaffDashboard from "./Components/dashboards/StaffDashboard";
import AllStaff from "./Pages/AllStaff";
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
      
      </Routes>
    <Routes>
  <Route path="dashboard" element={<DashboardLayout />}>
    <Route path="dashboardindex" element={<TeacherDashboard />} />
    <Route path="allnotices" element={<AllNotices/>} />
    <Route path="stuNotices" element={<StudentNotices/>} />
    <Route path="allstudent" element={<AllStudent/>} />
    <Route path="allteacher" element={<AllTeacher/>} />
    <Route path="impnotices" element={<ImportantNotice/>} />
    <Route path="view" element={<StaffDashboard/>} />
    <Route path="allstaff" element={<AllStaff/>} />

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
