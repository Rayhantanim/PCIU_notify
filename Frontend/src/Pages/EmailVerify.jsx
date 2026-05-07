import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function EmailVerify() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const API = "http://localhost:5000";

  useEffect(() => {
    fetch(`${API}/api/verify-email?token=${searchParams.get('token')}`)
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setIsError(!data.message.includes('success'));
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(() => {
        setMessage('Verification failed');
        setIsError(true);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="bg-white/10 p-8 rounded-xl text-center">
        <div className={`text-4xl mb-4 ${isError ? 'text-red-400' : 'text-green-400'}`}>
          {isError ? '✗' : '✓'}
        </div>
        <p className="text-white text-xl">{message}</p>
        <p className="text-white/60 mt-4">Redirecting to login...</p>
      </div>
    </div>
  );
}