import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from './api';
import DarkModeToggle from './DarkModeToggle';

interface SiteSettings {
  [key: string]: string;
}

const PrivacyPolicy: React.FC = () => {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const siteName = settings?.site_name || 'PUSTAKA PUBLIK';
  const nameParts = siteName.split(' ');
  const lastWord = nameParts.pop() || '';
  const firstPart = nameParts.join(' ');

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <Helmet>
        <title>Kebijakan Privasi | {siteName}</title>
        <meta name="description" content={`Kebijakan Privasi (Privacy Policy) dari ${siteName}.`} />
      </Helmet>

      {/* Navigasi */}
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold text-sm uppercase tracking-widest">Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <span className="text-sm font-black tracking-tighter hidden sm:block">
            {firstPart} <span className="text-blue-600">{lastWord}</span>
          </span>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Kebijakan Privasi</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Komitmen kami untuk melindungi data dan privasi pengunjung portal berita {siteName}.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl prose prose-slate prose-lg max-w-none prose-headings:font-black dark:prose-invert">
          <p>
            Privasi Anda sebagai pengunjung <strong>{siteName}</strong> adalah hal yang sangat penting bagi kami. Dokumen ini menguraikan jenis informasi pribadi yang diterima dan dikumpulkan oleh <strong>{siteName}</strong> dan bagaimana informasi tersebut digunakan.
          </p>
          
          <h3>Pengumpulan Data</h3>
          <p>
            Saat Anda mengakses <strong>{siteName}</strong>, infrastruktur kami mengumpulkan jejak rekam (log) aktivitas secara anonim. Informasi yang terekam meliputi detail teknis semacam alamat IP, varian peramban, nama ISP, hingga stempel waktu (time stamp). Kumpulan data ini murni didedikasikan untuk analisis pola trafik, pemeliharaan server, dan evaluasi tren pengunjung secara kolektif, bukan untuk mengidentifikasi profil individu secara spesifik.
          </p>

          <h3>Cookies dan Web Beacons</h3>
          <p>
            Guna memberikan pengalaman membaca berita yang lebih personal dan optimal, <strong>{siteName}</strong> memanfaatkan teknologi <i>cookies</i>. Melalui fasilitas ini, sistem kami dapat mengingat preferensi navigasi Anda serta menyesuaikan tata letak halaman web agar senantiasa relevan dengan perangkat dan pengaturan yang Anda gunakan.
          </p>

          <h3>Komentar dan Pendaftaran Akun</h3>
          <p>
            Jika Anda meninggalkan komentar atau mendaftar akun di situs kami, Anda mungkin diminta untuk memberikan nama dan alamat email. Kami menyimpan data ini dengan aman dan tidak akan menjual, menukar, atau menyewakan informasi pribadi pengguna kepada pihak ketiga mana pun tanpa persetujuan Anda terlebih dahulu.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;