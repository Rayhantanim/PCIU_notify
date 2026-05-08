import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const API = "https://pciunotifybackend.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    toast.success(data.message);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="bg-white/10 p-8 rounded-xl text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-white text-xl mb-2">Check Your Email</h2>
          <p className="text-white/70">We sent a password reset link to {email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl w-96">
        <h2 className="text-2xl text-white mb-4">Forgot Password?</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white mb-4"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-500">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}