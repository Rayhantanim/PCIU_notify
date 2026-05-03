import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
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
import StaffNoticeForm from "./Pages/staffNotice";
import StudentOverview from "./Components/dashboards/studentOverview";
import RoleBasedRoute from "./auth/RoleBasedRoute";
import HomePage from "./Pages/Home";
import RoutineViewer from "./Components/routine/routine";
import SocketProvider from "./Components/SocketProvider";

const App = () => {
  return (
    <div>
       <SocketProvider />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
       <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes with DashboardLayout */}
         <Route path="/home" element={< HomePage/>} />

// In your routes:
<Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  {/* Teacher only */}
  <Route 
    path="dashboardindex" 
    element={
      <RoleBasedRoute allowedRoles={["teacher"]}>
        <TeacherDashboard />
      </RoleBasedRoute>
    } 
  />
  
  {/* Staff only */}
  <Route 
    path="staffnotice" 
    element={
      <RoleBasedRoute allowedRoles={["staff"]}>
        <StaffNoticeForm />
      </RoleBasedRoute>
    } 
  />
  <Route 
    path="allstaff" 
    element={
      <RoleBasedRoute allowedRoles={["staff"]}>
        <AllStaff />
      </RoleBasedRoute>
    } 
  />
  
  {/* Student only */}
  <Route 
    path="overview" 
    element={
      <RoleBasedRoute allowedRoles={["student"]}>
        <StudentOverview />
      </RoleBasedRoute>
    } 
  />
  <Route 
    path="impnotices" 
    element={
      <RoleBasedRoute allowedRoles={["student"]}>
        <ImportantNotice />
      </RoleBasedRoute>
    } 
  />
  {/* Routine Page - Student only */}
          <Route 
            path="routine" 
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
                <RoutineViewer />
              </RoleBasedRoute>
            } 
          />
  
  {/* Accessible by multiple roles */}
  <Route 
    path="allnotices" 
    element={
      <RoleBasedRoute allowedRoles={["teacher", "staff", "student"]}>
        <AllNotices />
      </RoleBasedRoute>
    } 
  />
  <Route 
    path="stuNotices" 
    element={
      <RoleBasedRoute allowedRoles={[ "student"]}>
        <StudentNotices />
      </RoleBasedRoute>
    } 
  />
  <Route 
    path="allstudent" 
    element={
      <RoleBasedRoute allowedRoles={["teacher", "staff"]}>
        <AllStudent />
      </RoleBasedRoute>
    } 
  />
  <Route 
    path="allteacher" 
    element={
      <RoleBasedRoute allowedRoles={["admin", "staff"]}>
        <AllTeacher />
      </RoleBasedRoute>
    } 
  />
</Route>
        
       

        {/* Other Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
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