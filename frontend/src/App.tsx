import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BackToTop from './BackToTop';

// Menerapkan Lazy Loading pada setiap halaman agar di-load secara terpisah
const Dashboard = lazy(() => import('./Dashboard'));
const PostDetail = lazy(() => import('./PostDetail'));
const Home = lazy(() => import('./Home'));
const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const ResetPassword = lazy(() => import('./ResetPassword'));
const EditorialBoard = lazy(() => import('./EditorialBoard'));
const Disclaimer = lazy(() => import('./Disclaimer'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const PedomanMediaSiber = lazy(() => import('./PedomanMediaSiber'));
const CategoryArchive = lazy(() => import('./CategoryArchive'));

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Pengecekan sederhana apakah token JWT belum kedaluwarsa (expired)
    try {
      // JWT terdiri dari 3 bagian, index [1] adalah payload base64
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token'); // Hapus token jika sudah expired
        return false;
      }
      return true;
    } catch {
      return false; // Token palsu/tidak dapat diparse akan ditolak
    }
  });

  // Fungsi yang dipanggil saat login berhasil
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };
  // Fungsi yang dipanggil saat logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Router>
      <Helmet>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5208982615114695" 
          crossOrigin="anonymous"
        ></script>
      </Helmet>
      <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500 animate-pulse">Memuat halaman...</div>}>
        <Routes>
          {/* RUTE PUBLIK */}
          <Route path="/" element={<Home />} />
          <Route path="/berita/:slug" element={<PostDetail />} />
          <Route path="/kategori/:slug" element={<CategoryArchive />} />
          <Route path="/susunan-redaksi" element={<EditorialBoard />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/kebijakan-privasi" element={<PrivacyPolicy />} />
          <Route path="/pedoman-media-siber" element={<PedomanMediaSiber />} />
          
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
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* RUTE REDAKSI (Proteksi Penuh) */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          
          {/* RUTE FALLBACK (404) */}
          <Route path="*" element={<div className="p-20 text-center text-2xl font-bold">404 - Halaman Tidak Ditemukan</div>} />
        </Routes>
      </Suspense>
      
      <BackToTop />
    </Router>
  );
};

export default App;