import React from 'react'
import Navbar from './Components/Navbar'
import Login from './Pages/Login/Login'
import Signup from './Pages/SignUp/Signup'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <Navbar/>

      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
      



    </div>
  )
}

export default App