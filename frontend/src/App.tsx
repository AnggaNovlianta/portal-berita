import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import PostDetail from './PostDetail';
import Home from './Home';
import Login from './Login';
import Register from './Register';

const App: React.FC = () => {
  // KUNCI PERBAIKAN: Membaca localStorage langsung ke dalam useState (Lazy Initialization)
  // Cara ini menghilangkan render ganda dan tidak memerlukan useEffect sama sekali.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  // Fungsi yang dipanggil saat login berhasil
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // Fungsi yang dipanggil saat logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* RUTE PUBLIK */}
        <Route path="/" element={<Home />} />
        <Route path="/berita/:slug" element={<PostDetail />} />
        
        {/* RUTE LOGIN (Mencegah orang yang sudah login masuk ke halaman login lagi) */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        {/* RUTE REGISTER */}
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* RUTE REDAKSI (Proteksi Penuh) */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        
        {/* RUTE FALLBACK (404) */}
        <Route path="*" element={<div className="p-20 text-center text-2xl font-bold">404 - Halaman Tidak Ditemukan</div>} />
      </Routes>
    </Router>
  );
};

export default App;