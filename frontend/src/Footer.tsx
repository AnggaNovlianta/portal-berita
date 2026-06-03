import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from './api';

interface SiteSettings {
  [key: string]: string;
}

const Footer: React.FC = () => {
  // Footer mandiri: bisa mengambil datanya sendiri (di-cache oleh React Query)
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

  // Data Dinamis
  const siteMotto = settings?.site_motto || 'Portal berita profesional dan terpercaya yang menyajikan informasi aktual, tajam, dan berimbang. Kami tunduk pada Kode Etik Jurnalistik dan Pedoman Pemberitaan Media Siber.';
  const companyAddress = settings?.company_address || 'Gedung Jurnalistik Lt. 5\nJl. Jend. Sudirman Kav. 1, Jakarta Pusat';
  const companyPhone = settings?.company_phone || '(021) 1234-5678';
  const companyEmail = settings?.company_email || 'redaksi@pustakapublik.com';
  const socialFacebook = settings?.social_facebook || '';
  const socialTwitter = settings?.social_twitter || '';
  const socialInstagram = settings?.social_instagram || '';
  const socialYoutube = settings?.social_youtube || '';

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t-4 border-blue-600">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="sm:col-span-2 md:col-span-2">
          <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">
            {firstPart} <span className="text-blue-500">{lastWord}</span>
          </h2>
          <p className="text-sm leading-relaxed mb-4 pr-10">
            {siteMotto}
          </p>
          <p className="text-xs">© {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Redaksi & Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/susunan-redaksi" className="hover:text-blue-400 transition-colors">Susunan Redaksi</Link></li>
            <li><Link to="/pedoman-media-siber" className="hover:text-blue-400 transition-colors">Pedoman Media Siber</Link></li>
            <li><Link to="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link></li>
            <li><Link to="/kebijakan-privasi" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hubungi Kami</h3>
          <address className="not-italic text-sm space-y-2 whitespace-pre-line">
            <p>{companyAddress}</p>
            <p>Telp: {companyPhone}</p>
            <p>Email: <a href={`mailto:${companyEmail}`} className="text-blue-400 hover:underline">{companyEmail}</a></p>
          </address>
          <div className="flex gap-4 mt-6">
            {socialFacebook && <a href={socialFacebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>}
            {socialTwitter && <a href={socialTwitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>}
            {socialInstagram && <a href={socialInstagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>}
            {socialYoutube && <a href={socialYoutube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-500 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;