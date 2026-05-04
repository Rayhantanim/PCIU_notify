import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, Navigate } from "react-router-dom";
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
import { useEffect, useState } from "react";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsAuthenticated(true);
          setUserRole(user.role || user.userType || "student");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    };

    checkAuth();
    
    // Listen for storage events (when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Get dashboard route based on user role
  const getDefaultDashboardRoute = () => {
    switch (userRole?.toLowerCase()) {
      case "teacher":
        return "/dashboard/dashboardindex";
      case "staff":
        return "/dashboard/staffnotice";
      case "student":
        return "/dashboard/overview";
      default:
        return "/dashboard/allnotices";
    }
  };

  // Redirect component for authenticated users from landing page
  const AuthRedirect = () => {
    if (isAuthenticated) {
      return <Navigate to={getDefaultDashboardRoute()} replace />;
    }
    return <LandingPage />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SocketProvider />
      <Routes>
        {/* Public Routes - Redirect if already logged in */}
        <Route path="/" element={<AuthRedirect />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to={getDefaultDashboardRoute()} replace /> : 
            <LoginPage />
          } 
        />
        
        {/* Protected Routes with DashboardLayout */}
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
            path="stunotices" 
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
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
          
          {/* Default redirect for dashboard */}
          <Route 
            index 
            element={<Navigate to={getDefaultDashboardRoute()} replace />} 
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
        
        {/* Catch all - redirect to dashboard or landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
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





































// import Profile from "./Pages/Profile";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Route, Routes } from "react-router-dom";
// import LandingPage from "./Pages/LandingPage";
// import LoginPage from "./Pages/LoginPage";
// import ProtectedRoute from "./auth/ProtectedRoute";
// import DashboardLayout from "./Pages/DashboardLayout/DashboardLayout";
// import AllNotices from "./Pages/AllNotices";
// import TeacherDashboard from "./Components/dashboards/TeacherDashboard";
// import StudentNotices from "./Pages/StudentNotices";
// import AllStudent from "./Pages/AllStudent";
// import AllTeacher from "./Pages/AllTeacher";
// import ImportantNotice from "./Pages/importantNotice";
// import StaffDashboard from "./Components/dashboards/StaffDashboard";
// import AllStaff from "./Pages/AllStaff";
// import StaffNoticeForm from "./Pages/staffNotice";
// import StudentOverview from "./Components/dashboards/studentOverview";
// import RoleBasedRoute from "./auth/RoleBasedRoute";
// import HomePage from "./Pages/Home";
// import RoutineViewer from "./Components/routine/routine";
// import SocketProvider from "./Components/SocketProvider";

// const App = () => {
//   return (
//     <div>
//        <SocketProvider />
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<LandingPage />} />
//        <Route path="/login" element={<LoginPage />} />
        
//         {/* Protected Routes with DashboardLayout */}
//          <Route path="/home" element={< HomePage/>} />

// // In your routes:
// <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
//   {/* Teacher only */}
//   <Route 
//     path="dashboardindex" 
//     element={
//       <RoleBasedRoute allowedRoles={["teacher"]}>
//         <TeacherDashboard />
//       </RoleBasedRoute>
//     } 
//   />
  
//   {/* Staff only */}
//   <Route 
//     path="staffnotice" 
//     element={
//       <RoleBasedRoute allowedRoles={["staff"]}>
//         <StaffNoticeForm />
//       </RoleBasedRoute>
//     } 
//   />
//   <Route 
//     path="allstaff" 
//     element={
//       <RoleBasedRoute allowedRoles={["staff"]}>
//         <AllStaff />
//       </RoleBasedRoute>
//     } 
//   />
  
//   {/* Student only */}
//   <Route 
//     path="overview" 
//     element={
//       <RoleBasedRoute allowedRoles={["student"]}>
//         <StudentOverview />
//       </RoleBasedRoute>
//     } 
//   />
//   <Route 
//     path="impnotices" 
//     element={
//       <RoleBasedRoute allowedRoles={["student"]}>
//         <ImportantNotice />
//       </RoleBasedRoute>
//     } 
//   />
//   {/* Routine Page - Student only */}
//           <Route 
//             path="routine" 
//             element={
//               <RoleBasedRoute allowedRoles={["student"]}>
//                 <RoutineViewer />
//               </RoleBasedRoute>
//             } 
//           />
  
//   {/* Accessible by multiple roles */}
//   <Route 
//     path="allnotices" 
//     element={
//       <RoleBasedRoute allowedRoles={["teacher", "staff", "student"]}>
//         <AllNotices />
//       </RoleBasedRoute>
//     } 
//   />
//   <Route 
//     path="stuNotices" 
//     element={
//       <RoleBasedRoute allowedRoles={[ "student"]}>
//         <StudentNotices />
//       </RoleBasedRoute>
//     } 
//   />
//   <Route 
//     path="allstudent" 
//     element={
//       <RoleBasedRoute allowedRoles={["teacher", "staff"]}>
//         <AllStudent />
//       </RoleBasedRoute>
//     } 
//   />
//   <Route 
//     path="allteacher" 
//     element={
//       <RoleBasedRoute allowedRoles={["admin", "staff"]}>
//         <AllTeacher />
//       </RoleBasedRoute>
//     } 
//   />
// </Route>
        
       

//         {/* Other Protected Routes */}
//         <Route 
//           path="/home" 
//           element={
//             <ProtectedRoute>
//               <HomePage />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route 
//           path="/profile" 
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>

//       <ToastContainer
//         position="top-center"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         pauseOnHover
//         theme="dark"
//         toastStyle={{
//           background: "rgba(255,255,255,0.1)",
//           backdropFilter: "blur(10px)",
//           border: "1px solid rgba(255,255,255,0.2)",
//           color: "#fff",
//         }}
//       />
//     </div>
//   );
// };

// export default App;