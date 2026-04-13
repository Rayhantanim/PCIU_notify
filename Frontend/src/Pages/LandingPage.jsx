import React, { useEffect, useState } from "react";
import pciubg from "../assets/pciubg.png";
import RoleSignup from "../Components/RoleSignup";
import RoleSignupForm from "../Components/RoleSignupForm";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${pciubg})` }}
      ></div>
      <div className="absolute inset-0 bg-black/50"></div>

      {showSignup ? (
        <div className="relative z-10 h-full flex items-center justify-center">
          {selectedRole ? (
            // Show the form if role is selected
            <RoleSignupForm
              role={selectedRole}
              goBack={() => setSelectedRole("")}
            />
          ) : (
            // Show role selection cards
            <RoleSignup
              selectRole={(role) => setSelectedRole(role)}
              goBack={() => setShowSignup(false)}
            />
          )}
        </div>
      ) : (
        <>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white px-8 py-10 max-w-2xl w-full mx-4 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                PCIU Notify
              </h1>
              <h1 className="text-4xl md:text-4x font-bold mb-4">
                Stay Updated, Instantly
              </h1>

              <p className="text-lg md:text-xl mb-8 text-gray-200">
                A smart notification system that keeps you informed about
                important updates, announcements, and events in real-time.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 text-lg rounded-2xl bg-white/80 text-black font-medium backdrop-blur-md hover:bg-white transition"
                >
                  Sign In
                </button>

                <button
                  onClick={() => setShowSignup(true)}
                  className="px-6 py-3 text-lg rounded-2xl border border-white/40 text-white font-medium backdrop-blur-md hover:bg-white hover:text-black transition"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Animations */}
          <style jsx>{`
            .animate-slide {
              animation: slideFade 0.6s ease;
            }

            @keyframes slideFade {
              0% {
                opacity: 0;
                transform: translateY(-20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
