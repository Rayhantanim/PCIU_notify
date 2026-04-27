import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import Home from "./Pages/Home";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>

     <App />
    </AuthProvider>
 
    </BrowserRouter>
  </StrictMode>
);




// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import { Signup } from './Pages/SignUp/Signup'
// import { Login } from './Pages/Login/Login'
// import App from './App'
// import Navbar from './Components/Navbar'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Navbar/>
//     <Login></Login>
//     <Signup/>
//   </StrictMode>,
// )
