import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Signup } from './Pages/SignUp/Signup'
import { Login } from './Pages/Login/Login'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Signup/> */}
    <Login></Login>
  </StrictMode>,
)
