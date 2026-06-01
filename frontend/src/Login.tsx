import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Wajib diimpor untuk pindah halaman
import api, { getErrorMessage } from './api';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border-t-4 border-navy-primary w-full max-w-md">
        
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
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Kata Sandi</label>
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
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline font-bold">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;