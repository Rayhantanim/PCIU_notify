import React from 'react'
import FormPropsTextFields from '../../Components/Form/Form'
import StateTextFields from '../../Components/Form/Form'
import signUpimg from '../../assets/login-bg-removebg-preview.png'

const Signup = () => {
  return (
    <div className='w-screen min-h-screen flex justify-center items-center bg-[#E6F0F4]'>
        <div className='w-3/4 h-auto flex justify-center rounded-4xl border-transparent gap-20 bg-white '>
     <div className='w-full rounded-l-4xl  max-h-1/2 bg-[#E4E3E8]'>
     <h2 className='text-5xl text-center my-2'>Welcome to Student Portal</h2>
    <img className='w-full flex justify-center items-center ' src={signUpimg} alt="" />
     </div>

<div className='w-full max-h-1/2'>
    <StateTextFields/>
</div>
</div>
    </div>
  )
}

export default Signup;
