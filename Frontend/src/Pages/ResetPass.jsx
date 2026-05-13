import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPass() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const API = "https://pciunotifybackend.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    const res = await fetch(`${API}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: searchParams.get('token'), newPassword: password })
    });
    const data = await res.json();
    toast.success(data.message);
    if (res.ok) setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl w-96">
        <h2 className="text-2xl text-white mb-4">Reset Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white mb-4"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white mb-4"
          required
        />
        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-500">
          Reset Password
        </button>
      </form>
    </div>
  );
}