import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from './api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Konfirmasi kata sandi tidak cocok!'); return; }
    if (!token) { setError('Token pemulihan tidak ditemukan di URL.'); return; }

    setError(''); setMessage(''); setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border-t-4 border-navy-primary w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-navy-primary tracking-tight">Atur Ulang Kata Sandi</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Buat kata sandi baru untuk akun Anda.</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium">{error}</div>}
        {message && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-sm font-medium">{message}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Kata Sandi Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Ulangi Kata Sandi Baru</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" disabled={isLoading} className="mt-4 w-full px-6 py-4 bg-navy-primary text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-70">
            {isLoading ? 'Memproses...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;