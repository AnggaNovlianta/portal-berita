import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Wajib diimpor untuk pindah halaman
import api, { getErrorMessage } from './api';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

// 2. Ubah interface agar bisa menerima token
interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Tambahan UX: Mencegah spam klik
  
  const navigate = useNavigate(); // Inisialisasi fungsi navigasi

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // 3. Kirim token ke App.tsx, lalu paksa pindah ke Dashboard
      onLoginSuccess(data.token); 
      navigate('/dashboard');
      
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', { token: credentialResponse.credential });
      onLoginSuccess(response.data.token);
      navigate('/dashboard');
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border-t-4 border-navy-primary w-full max-w-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-navy-primary tracking-tight">
            PUSTAKA<span className="text-blue-500">PUBLIK</span>
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Ruang Redaksi</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Alamat Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium"
              placeholder="redaksi@email.com"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold">Kata Sandi</label>
              <Link to="/forgot-password" className="text-xs text-blue-600 font-bold hover:underline">Lupa Kata Sandi?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full px-6 py-4 bg-navy-primary text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>

          {GOOGLE_CLIENT_ID && (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Atau masuk dengan</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login dibatalkan/gagal.')} />
              </div>
            </GoogleOAuthProvider>
          )}
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline font-bold">Daftar sekarang</Link>
        </div>
      </div>
      </div>
  );
};

export default Login;