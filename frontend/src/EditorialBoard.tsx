import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';
import DarkModeToggle from './DarkModeToggle';

interface SiteSettings {
  [key: string]: string;
}

interface BoardMember {
  id: string;
  name: string;
  role: string;
  description?: string;
  photo?: string | null;
}

const EditorialBoard: React.FC = () => {
  // Mengambil Pengaturan Website untuk nama dan logo
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

  const editorialBoardRaw = settings?.editorial_board;
  const boardMembers = editorialBoardRaw ? JSON.parse(editorialBoardRaw) : [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <Helmet>
        <title>Susunan Redaksi | {siteName}</title>
        <meta name="description" content={`Susunan redaksi dan tim jurnalis dari ${siteName}.`} />
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
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Susunan Redaksi</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Kami adalah tim profesional yang berdedikasi untuk menyajikan berita paling aktual, tajam, dan terpercaya bagi masyarakat luas dengan berpegang teguh pada kode etik jurnalistik.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {boardMembers.length > 0 ? (
            boardMembers.map((member: BoardMember) => (
              <div key={member.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center flex flex-col items-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-32 h-32 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-white shadow-md">
                  {member.photo ? (
                    <img src={`${BASE_URL}${member.photo}`} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1 rounded-full">{member.role}</h2>
                <h3 className="text-2xl font-black text-slate-800">{member.name}</h3>
                {member.description && <p className="text-sm text-slate-500 mt-4 leading-relaxed">{member.description}</p>}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500 py-10">
              Susunan redaksi belum dikonfigurasi oleh Administrator.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditorialBoard;