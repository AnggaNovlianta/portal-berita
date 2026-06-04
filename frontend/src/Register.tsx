import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from './api';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('Jurnalis');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await api.post('/auth/register', { name, email, password, roleName });

      alert('Registrasi berhasil! Akun Anda sedang menunggu persetujuan Admin sebelum bisa digunakan.');
      navigate('/login');
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
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
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
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Daftar Akun Baru</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Nama Lengkap</label>
            <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium" placeholder="Nama Anda" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Alamat Email</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium" placeholder="redaksi@email.com" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Kata Sandi</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium" placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <label htmlFor="roleName" className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Pilih Peran</label>
            <select id="roleName" name="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition-all font-medium cursor-pointer">
              <option value="Jurnalis">Jurnalis</option>
              <option value="Redaktur">Redaktur</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="mt-4 w-full px-6 py-4 bg-navy-primary text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>

            {GOOGLE_CLIENT_ID && (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Atau daftar dengan</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Sign-In dibatalkan atau gagal.')}
                  />
                </div>
              </GoogleOAuthProvider>
            )}
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 font-medium">Sudah punya akun? <Link to="/login" className="text-blue-600 hover:underline font-bold">Masuk di sini</Link></div>
      </div>
    </div>
  );
};
export default Register;