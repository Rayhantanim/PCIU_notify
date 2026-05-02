import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Mock signup function - replace with your actual backend call
  const signup = async (email, password, firstName, lastName, role) => {
    // This should call your backend API
    const API = "https://pciunotifybackend.onrender.com";
    const response = await fetch(`${API}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return { user: { uid: Date.now().toString(), email } };
  };

  const value = {
    signup,
    // Add other auth methods as needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}