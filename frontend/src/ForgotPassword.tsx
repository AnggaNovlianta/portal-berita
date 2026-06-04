import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from './api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setIsLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Tautan pemulihan telah dikirim!');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border-t-4 border-navy-primary w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-navy-primary tracking-tight">Lupa Kata Sandi?</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium">{error}</div>}
        {message && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-sm font-medium">{message}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Alamat Email</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium" placeholder="email@anda.com" required />
          </div>
          <button type="submit" disabled={isLoading} className="mt-4 w-full px-6 py-4 bg-navy-primary text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-70">
            {isLoading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm font-medium"><Link to="/login" className="text-blue-600 hover:underline font-bold">&larr; Kembali ke halaman Masuk</Link></div>
      </div>
    </div>
  );
};
export default ForgotPassword;