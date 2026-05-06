import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);

  useEffect(() => {
    // Extract oobCode from URL
    const oobCode = searchParams.get('oobCode');
    
    if (!oobCode) {
      setError("Invalid password reset link. Please request a new one.");
      return;
    }

    // Verify the password reset code
    const verifyCode = async () => {
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setIsValidCode(true);
      } catch (error) {
        console.error("Error verifying reset code:", error);
        switch (error.code) {
          case 'auth/invalid-action-code':
            setError("This password reset link is invalid or has expired. Please request a new one.");
            break;
          case 'auth/user-disabled':
            setError("This account has been disabled. Please contact support.");
            break;
          case 'auth/user-not-found':
            setError("No account found. Please check your email or sign up.");
            break;
          default:
            setError("Failed to verify reset link. Please try again.");
        }
        setIsValidCode(false);
      }
    };

    verifyCode();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const oobCode = searchParams.get('oobCode');
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      Swal.fire({
        title: "Password Reset Successful!",
        text: "You can now login with your new password.",
        icon: "success",
        draggable: true
      }).then(() => {
        navigate("/login");
      });
      
    } catch (error) {
      console.error("Error resetting password:", error);
      switch (error.code) {
        case 'auth/weak-password':
          setError("Password is too weak. Please use at least 6 characters.");
          break;
        case 'auth/invalid-action-code':
          setError("Reset link has expired. Please request a new one.");
          break;
        case 'auth/expired-action-code':
          setError("Reset link has expired. Please request a new one.");
          break;
        default:
          setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidCode && !error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          {email && (
            <p className="mt-2 text-center text-sm text-gray-600">
              For: {email}
            </p>
          )}
        </div>
        
        {error && !isValidCode ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <p>{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`appearance-none rounded-lg relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}