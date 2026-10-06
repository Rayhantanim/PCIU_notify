import React from 'react'
import { createBrowserRouter } from 'react-router-dom';
import Signup from '../Pages/Signup/Signup';
import PhoneSignup from '../Pages/Signup/PhoneSignup';
import Login from '../Pages/Login/Login';
import CreateAccount from '../Pages/Signup/CreateAccount';
import ForgetPass from '../Components/ForgetPass';
import Home from '../Pages/Home/Home';
import RideManagement from '../Pages/Ridemanagement/RideManagement';
import Support from '../Pages/Support/Support';
import VerifyOtp from '../Pages/VerifyOtp/VerifyOtp';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Signup></Signup>,
  },
  {
     path:"/home",
    element:<Home></Home>
  },
  {
     path:"/ride-management",
     element:<RideManagement></RideManagement>
  },
  {
    path:"/support",
    element: <Support></Support>
  },
  {
    path:"verify-otp",
    element:<VerifyOtp/>
  },
  {
    path: "/phone-signup",
    element:<PhoneSignup></PhoneSignup>
  },
  {
    path:"/login",
    element: <Login></Login>
  },
  {
    path:"/signup",
    element: <CreateAccount></CreateAccount>
  },
  {
    path:'/forgetPass',
    element:<ForgetPass></ForgetPass>
  }
]);

export default router
