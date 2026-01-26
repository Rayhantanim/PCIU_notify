import React from 'react'
import {
  Box,
  TextField,
} from '@mui/material';

export const Login = () => {
  return (
  <div className='w-screen min-h-screen flex justify-center items-center  bg-[#E6F0F4]'>
         <div className='w-3/4 h-auto flex justify-center border-transparent rounded-4xl gap-20 bg-white '>
      <div className='w-full  max-h-1/2 rounded-4xl bg-[#E4E3E8]'>
      {/* <h2 className='text-5xl text-center my-2'>Welcome to Student Portal</h2> */}
     <img className='w-full flex justify-center items-center ' src="https://static.vecteezy.com/system/resources/thumbnails/004/112/232/small/forgot-password-and-account-login-for-web-page-protection-security-key-access-system-in-smartphone-or-computer-flat-illustration-vector.jpg" alt="" />
      </div>
 
 <div className='w-full max-h-1/2'>
   <h2 className="text-center font-semibold text-5xl my-8">
        Login
      </h2>
        <Box className='flex flex-col justify-center items-center'
            component="form"
            sx={{ '& > :not(style)': { m: 1, width: '500px' } }}

            autoComplete="off"
          >
     
            <TextField name="SId" label="Student Id"  type="text"
  inputProps={{ pattern: "[A-Za-z0-9]{5,10}" }}/>
          
    
    
            <TextField
              name="pass"
              label="password"
              type="password"
              
            />
         
    </Box>
     <div className='text-white w-[500px] h-14 text-center mx-auto flex justify-center items-center  bg-[#263640] rounded-2xl border my-10'>
      <p className='' >Submit</p>
      </div>
 </div>
 </div>
     </div>
  )
}
