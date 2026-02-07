import React from 'react'
import Navbar from './Components/Navbar'
import Login from './Pages/Login/Login'
import Signup from './Pages/SignUp/Signup'
import Profile from "./Pages/Profile";

import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <Navbar/>

      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
      



    </div>
  )
}

export default App