import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone } from 'lucide-react';
import api, { BASE_URL } from './api';

interface SiteSettings {
  [key: string]: string;
}

interface AdSlotProps {
  width?: string;
  height?: string;
  text?: string;
  className?: string;
  adKey?: string; // Tambahan prop untuk mendeteksi ID Iklan di database
}

const AdSlot: React.FC<AdSlotProps> = ({ width = '100%', height = '90px', text = 'Space Iklan (Advertisement)', className = '', adKey }) => {
  // Komponen ini cukup cerdas untuk mengambil datanya sendiri (atau dari cache)
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const imageUrl = adKey && settings?.[adKey] ? `${BASE_URL}${settings[adKey]}` : null;
  const linkUrl = adKey && settings?.[`${adKey}_link`] ? settings[`${adKey}_link`] : '#';
  const adSlotId = adKey ? settings?.[`${adKey}_slot`] : undefined;
  const companyEmail = settings?.company_email || 'redaksi@pustakapublik.com';
  const adRef = useRef<HTMLModElement | null>(null);
  const hasPushedRef = useRef(false);

  const shouldRenderAdSense = Boolean(adSlotId) && !imageUrl;

  // Memicu (trigger) Google AdSense hanya sekali per slot, untuk menghindari error strict mode
  useEffect(() => {
    if (!shouldRenderAdSense || hasPushedRef.current) {
      return;
    }

    const adNode = adRef.current;
    if (!adNode) {
      return;
    }

    const win = window as Window & { adsbygoogle?: unknown[] };
    win.adsbygoogle = win.adsbygoogle || [];

    if ((adNode as any).dataset.adsbygoogleLoaded === 'true') {
      return;
    }

    try {
      (win.adsbygoogle as unknown[]).push({});
      (adNode as any).dataset.adsbygoogleLoaded = 'true';
      hasPushedRef.current = true;
    } catch (e) {
      console.error('AdSense Error:', e);
    }
  }, [shouldRenderAdSense]);

  if (imageUrl) {
    return (
      <div className={`overflow-hidden rounded-xl flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity ${className}`} style={{ width, minHeight: height }}>
        <a href={linkUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
          <img src={imageUrl} alt="Advertisement" loading="lazy" className="w-full h-full object-cover" />
        </a>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-slate-50 border-2 border-dashed border-gray-200 ${className}`} style={{ width, minHeight: height }}>
      
      {/* DUMMY AD (Tampil sebagai latar belakang jika AdSense masih kosong/diblokir) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-0 bg-gradient-to-br from-slate-50 to-blue-50/60 overflow-hidden">
        {/* Ornamen Grafis Latar Belakang */}
        <Megaphone className="absolute text-blue-600 opacity-[0.05] w-48 h-48 -right-8 -bottom-8 -rotate-12 pointer-events-none animate-pulse" />
        <div className="absolute w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl -top-10 -left-10 pointer-events-none animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 shadow-md animate-bounce">Space Iklan Tersedia</span>
          <span className="text-slate-700 font-black text-sm sm:text-base mb-1 animate-pulse">{text}</span>
          <span className="text-slate-500 text-[10px] sm:text-xs leading-relaxed max-w-[250px]">Promosikan bisnis & produk Anda di sini.<br/>Email: <b className="text-blue-600">{companyEmail}</b></span>
        </div>
      </div>

      {/* KODE ADSENSE (Akan menimpa Dummy Ad di atas jika Google sudah menyetujui iklan) */}
      {shouldRenderAdSense && (
        <div className="relative z-10 w-full h-full">
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client="ca-pub-5208982615114695" 
            data-ad-slot={adSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      )}
    </div>
  );
};

export default AdSlot;