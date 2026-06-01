import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // EFEK: Memantau posisi scroll layar
  useEffect(() => {
    const toggleVisibility = () => {
      // Tampilkan tombol jika layar digulir lebih dari 300px ke bawah
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // FUNGSI: Menggulir layar kembali ke atas secara mulus (smooth)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button onClick={scrollToTop} aria-label="Kembali ke Atas" className={`fixed bottom-8 right-8 z-[90] p-3.5 bg-blue-600 text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all duration-300 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
    </button>
  );
};

export default BackToTop;