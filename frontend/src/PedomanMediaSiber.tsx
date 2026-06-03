import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from './api';
import DarkModeToggle from './DarkModeToggle';

interface SiteSettings {
  [key: string]: string;
}

const PedomanMediaSiber: React.FC = () => {
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
        <title>Pedoman Media Siber | {siteName}</title>
        <meta name="description" content={`Pedoman Pemberitaan Media Siber di ${siteName}.`} />
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
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Pedoman Media Siber</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Pedoman Pemberitaan Media Siber yang menjadi acuan standar redaksional {siteName}.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl prose prose-slate prose-lg max-w-none prose-headings:font-black dark:prose-invert">
          <p>
            Kebebasan dalam berpendapat, berekspresi, serta kebebasan pers merupakan hak asasi yang dijamin oleh Pancasila, UUD 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Hadirnya media siber di Indonesia turut menjadi pilar penting dalam mewujudkan kebebasan berekspresi dan berpendapat tersebut.
          </p>
          <p>
            Sebagai bentuk tanggung jawab profesional, <strong>{siteName}</strong> mengikatkan diri pada standar Pedoman Pemberitaan Media Siber dari Dewan Pers, dengan rincian acuan sebagai berikut:
          </p>

          <h3>1. Ruang Lingkup</h3>
          <p>Segala platform di internet yang menjalankan aktivitas jurnalistik dan telah memenuhi kualifikasi UU Pers serta Standar Perusahaan Pers dari Dewan Pers digolongkan sebagai Media Siber.</p>

          <h3>2. Verifikasi dan Keberimbangan Berita</h3>
          <ul>
            <li>Redaksi kami mewajibkan adanya proses verifikasi untuk setiap informasi.</li>
            <li>Khusus untuk pemberitaan yang berpotensi merugikan pihak tertentu, verifikasi silang wajib dilakukan secara langsung dalam artikel yang sama guna menjaga prinsip keberimbangan <i>(cover both sides)</i> dan akurasi data.</li>
          </ul>

          <h3>3. Konten Buatan Pengguna (User Generated Content)</h3>
          <p>Pengunjung diwajibkan untuk mendaftar dan masuk (login) sebelum berpartisipasi dalam Konten Buatan Pengguna, seperti halnya mengisi kolom komentar. Redaksi <strong>{siteName}</strong> memegang hak penuh untuk mengedit hingga menghapus kiriman audiens yang terindikasi melanggar hukum, norma kesusilaan, atau mengandung unsur SARA.</p>

          <h3>4. Ralat, Koreksi, dan Hak Jawab</h3>
          <p>Prosedur penanganan ralat, perbaikan konten, dan fasilitasi hak jawab dilaksanakan secara ketat mengikuti ketentuan dalam UU Pers, Kode Etik Jurnalistik, dan regulasi turunan dari Dewan Pers.</p>

          <h3>5. Pencabutan Berita</h3>
          <p>Karya jurnalistik yang sudah dipublikasikan pada dasarnya pantang untuk dihapus akibat adanya desakan pihak eksternal. Pengecualian pencabutan hanya berlaku untuk kasus spesifik seperti pelanggaran norma kesusilaan, muatan SARA, perlindungan anak di bawah umur, mitigasi trauma, atau keadaan darurat lain yang dibenarkan oleh otoritas pers.</p>
        </div>
      </main>
    </div>
  );
};

export default PedomanMediaSiber;