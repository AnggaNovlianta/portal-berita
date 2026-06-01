import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from './api';

interface SiteSettings {
  [key: string]: string;
}

const Disclaimer: React.FC = () => {
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
        <title>Disclaimer | {siteName}</title>
        <meta name="description" content={`Halaman penyangkalan (disclaimer) dan aturan layanan dari ${siteName}.`} />
      </Helmet>

      {/* Navigasi */}
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold text-sm uppercase tracking-widest">Kembali ke Beranda</span>
        </Link>
        <span className="text-sm font-black tracking-tighter hidden sm:block">
          {firstPart} <span className="text-blue-600">{lastWord}</span>
        </span>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Disclaimer</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Pasal Sanggahan dan Aturan Layanan (Terms of Service) penggunaan portal berita {siteName}.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl prose prose-slate prose-lg max-w-none prose-headings:font-black dark:prose-invert">
          <p>
            Seluruh layanan yang diberikan mengikuti aturan main yang ditetapkan dan dipatuhi oleh <strong>{siteName}</strong>.
          </p>
          
          <h3>Pasal Sanggahan (Disclaimer):</h3>
          <ol>
            <li><strong>{siteName}</strong> tidak bertanggung-jawab atas tidak tersampaikannya data/informasi yang disampaikan oleh pembaca melalui berbagai jenis saluran komunikasi (email, formulir online, dan komentar) karena faktor kesalahan teknis yang tidak diduga-duga sebelumnya.</li>
            <li><strong>{siteName}</strong> berhak untuk memuat, tidak memuat, mengedit, dan/atau menghapus data/informasi yang disampaikan oleh pembaca demi menjaga kenyamanan bersama dan menghindari konten yang berbau SARA, hoaks, atau pencemaran nama baik.</li>
            <li>Data dan/atau informasi yang tersedia di <strong>{siteName}</strong> hanya sebagai rujukan/referensi belaka, dan tidak diharapkan untuk tujuan perdagangan saham, transaksi keuangan/bisnis maupun transaksi lainnya.</li>
            <li>Walau berbagai upaya telah dilakukan untuk menampilkan data dan/atau informasi seakurat mungkin, <strong>{siteName}</strong> dan semua mitra yang menyediakan data dan informasi, termasuk para pengelola halaman konsultasi, tidak bertanggung jawab atas segala kesalahan dan keterlambatan memperbarui data atau informasi, atau segala kerugian yang timbul karena tindakan yang berkaitan dengan penggunaan data/informasi yang disajikan.</li>
          </ol>

          <h3>Komentar Pengguna (User Generated Content)</h3>
          <p>
            Segala komentar dan konten dari pengguna adalah tanggung jawab penuh dari pengguna yang bersangkutan. <strong>{siteName}</strong> dibebaskan dari segala tuntutan hukum atas pernyataan, opini, atau komentar yang ditulis oleh pembaca di kolom komentar atau forum diskusi.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Disclaimer;