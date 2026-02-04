import React from "react";
import StateTextFields from "../../Components/Form/Form";
import signUpimg from "../../assets/login-bg-removebg-preview.png";

const Signup = () => {
  return (
    <div className="w-screen min-h-screen  flex justify-center items-center bg-[#E6F0F4] px-4">
      
      {/* Main Container */}
      <div className="w-full max-w-6xl  my-6 bg-white rounded-3xl shadow-lg
                      flex flex-col lg:flex-row overflow-hidden">

        {/* Left Side (Image Section) */}
        <div className="w-full lg:w-1/2 bg-[#E4E3E8]  p-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-center mb-4">
            Welcome to Student Portal
          </h2>
          <img
            src={signUpimg}
            alt="Signup"
            className="w-3/4 md:w-2/3 lg:w-full max-w-sm"
          />
        </div>
        {/* Right Side (Form Section) */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex justify-center items-center">
          <div className="w-full max-w-md">
            <StateTextFields />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
