import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Loader2, TrendingUp, User, DollarSign, CloudSun, Mail } from 'lucide-react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';
import Footer from './Footer';
import AdSlot from './AdSlot';

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  published: boolean;
  views: number;
  createdAt: string;
  category?: {
    name: string;
    slug: string;
  };
  author?: { name: string; };
}

interface SiteSettings {
  [key: string]: string;
}

// Komponen Jam Mandiri (Mencegah re-render seluruh halaman Home setiap 1 detik)
const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>;
};

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentCategorySlug = searchParams.get('category') || '';
  const currentSearchQuery = searchParams.get('q') || ''; 
  const [searchInput, setSearchInput] = useState(currentSearchQuery);

  // QUERY 1: Menarik Berita Utama & Berita Terkini dengan Infinite Scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['posts', currentCategorySlug, currentSearchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      if (currentCategorySlug) queryParams.append('category', currentCategorySlug);
      if (currentSearchQuery) queryParams.append('search', currentSearchQuery);
      
      queryParams.append('page', pageParam.toString());
      queryParams.append('limit', '10'); 

      const response = await api.get(`/posts?${queryParams.toString()}`);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    }
  });

  // QUERY 2: Menarik 5 Berita Terpopuler Globally
  const { data: popularPosts = [] } = useQuery<Post[]>({
    queryKey: ['popularPosts'],
    queryFn: async () => {
      const response = await api.get('/posts?limit=5&sort=views');
      const result = response.data;
      return result.data ? result.data : result;
    }
  });

  // QUERY 3: Menarik Daftar Kategori
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    }
  });

  // QUERY 4: Mengambil Pengaturan Website (Nama & Logo)
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  // QUERY 5: Mengambil Data Kurs & Cuaca (Widget Info Terkini)
  const { data: widgetData } = useQuery({
    queryKey: ['widgetData'],
    queryFn: async () => {
      try {
        // 1. Fetch USD to IDR (Tanpa API Key - Open Exchange Rates)
        const exchangeRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const exchangeData = await exchangeRes.json();
        const usdToIdr = exchangeData?.rates?.IDR || 15500;

        // 2. Fetch Cuaca Jakarta (Tanpa API Key - Open-Meteo)
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2146&longitude=106.8451&current_weather=true');
        const weatherData = await weatherRes.json();
        const temperature = weatherData?.current_weather?.temperature || 32;

        return { usdToIdr, temperature };
      } catch (error) {
        console.error("Gagal memuat widget", error);
        return { usdToIdr: null, temperature: null };
      }
    },
    refetchInterval: 15 * 60 * 1000, // Diperbarui otomatis setiap 15 menit
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    navigate(`/`);
  };

  const stripHtml = (htmlString: string) => {
    return htmlString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  };

    // Menggabungkan semua halaman data posts yang telah di-fetch
  const posts = data?.pages.flatMap(page => page.data ? page.data : page) || [];
  const isSearch = !!currentSearchQuery;
  const headline = !isSearch && posts.length > 0 ? posts[0] : null;
  const subHeadlines = !isSearch && posts.length > 2 ? posts.slice(1, 3) : [];
  const otherPosts = isSearch ? posts : (posts.length > 2 ? posts.slice(3) : (posts.length > 1 ? posts.slice(1) : []));
  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Logika untuk memecah nama website menjadi dua bagian untuk pewarnaan
  const siteName = settings?.site_name || 'PUSTAKA PUBLIK';
  const nameParts = siteName.split(' ');
  const lastWord = nameParts.pop() || '';
  const firstPart = nameParts.join(' ');

  const siteLogo = settings?.site_logo 
    ? `${BASE_URL}${settings.site_logo}` 
    : null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* HEADER UTAMA */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="bg-slate-900 text-slate-300 py-1.5 hidden md:block">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
            <span>{currentDate}</span>
            <Link to="/login" className="hover:text-white transition-colors">Ruang Redaksi &rarr;</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" onClick={clearSearch} className="flex items-center justify-center md:justify-start gap-4 text-4xl md:text-5xl font-black tracking-tighter text-slate-900 w-full md:w-auto text-center md:text-left">
            {siteLogo && (
              <img src={siteLogo} alt={siteName} className="h-12 md:h-14 object-contain" />
            )}
            <span>{firstPart} <span className="text-blue-600">{lastWord}</span></span>
          </Link>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari berita terkini..." 
              className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white border-2 border-transparent focus:border-blue-500 text-sm rounded-full py-3 pl-11 pr-10 outline-none transition-all shadow-inner font-medium text-slate-700"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        <div className="border-t border-gray-100">
          <nav className="max-w-6xl mx-auto px-4 flex items-center gap-6 overflow-x-auto hide-scrollbar">
            <Link 
              to="/" 
              onClick={clearSearch}
              className={`text-sm font-bold uppercase tracking-wide py-3 whitespace-nowrap transition-colors ${!currentCategorySlug && !currentSearchQuery ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Semua Kabar
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/?category=${cat.slug}`} 
                onClick={() => setSearchInput('')}
                className={`text-sm font-bold uppercase tracking-wide py-3 whitespace-nowrap transition-colors ${currentCategorySlug === cat.slug ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* RUNNING TEXT (NEWS TICKER) */}
      {posts.length > 0 && !isLoading && (
        <div className="bg-slate-900 text-white flex items-center overflow-hidden border-b-2 border-blue-600 shadow-sm relative z-40">
          <div className="bg-blue-600 text-white font-black px-4 sm:px-6 py-2.5 z-10 flex-shrink-0 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 relative"></span>
            Sekilas Info
          </div>
          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="animate-ticker whitespace-nowrap flex items-center w-max py-2.5">
              {posts.slice(0, 10).map((post: Post) => (
                <span key={post.id} className="inline-flex items-center">
                  <span className="font-black text-blue-500 mx-4 sm:mx-6">/ /</span>
                  <Link to={`/berita/${post.slug}`} className="hover:text-blue-300 transition-colors font-semibold text-sm">
                    {post.title}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Slot Iklan Banner Atas */}
        <AdSlot adKey="ad_leaderboard" height="100px" text="Space Iklan Leaderboard (728x90)" className="mb-8 hidden sm:flex" />
        
        {currentSearchQuery && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <h2 className="text-blue-800 font-medium">Menampilkan hasil pencarian untuk: <span className="font-black">"{currentSearchQuery}"</span></h2>
          </div>
        )}

        {isLoading ? (
          <>
            {/* Skeleton Hero Layout */}
            {!isSearch && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-12 animate-pulse">
                <div className="lg:col-span-8 flex flex-col">
                  <div className="w-full aspect-[16/9] md:aspect-[2/1] bg-slate-200 rounded-3xl mb-5"></div>
                  <div className="w-24 h-6 bg-slate-200 rounded-full mb-3"></div>
                  <div className="w-full h-10 bg-slate-200 rounded-lg mb-2"></div>
                  <div className="w-2/3 h-10 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="w-1/3 h-4 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-8">
                  {[1, 2].map(i => (
                    <div key={i} className="flex-1 flex flex-col">
                      <div className="w-full aspect-video bg-slate-200 rounded-2xl mb-4"></div>
                      <div className="w-20 h-5 bg-slate-200 rounded-full mb-2"></div>
                      <div className="w-full h-6 bg-slate-200 rounded-lg mb-2"></div>
                      <div className="w-4/5 h-6 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 animate-pulse mt-8">
              <div className="lg:col-span-2">
                <div>
                  <div className="w-48 h-6 bg-slate-200 rounded mb-6"></div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-100">
                      <div className="w-full sm:w-[200px] aspect-video sm:aspect-square md:aspect-[4/3] bg-slate-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex flex-col flex-1 py-2">
                        <div className="w-20 h-3 bg-slate-200 rounded mb-2"></div>
                        <div className="w-full h-6 bg-slate-200 rounded mb-2"></div>
                        <div className="w-3/4 h-6 bg-slate-200 rounded mb-4"></div>
                        <div className="w-full h-3 bg-slate-200 rounded mb-2"></div>
                        <div className="w-1/2 h-3 bg-slate-200 rounded mt-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="lg:col-span-1 hidden lg:block">
                <div className="w-48 h-6 bg-slate-200 rounded mb-6"></div>
                <div className="flex flex-col gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-24 h-3 bg-slate-200 rounded mb-2"></div>
                        <div className="w-full h-4 bg-slate-200 rounded mb-1"></div>
                        <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </>
        ) : (
          <>
            {/* HERO SECTION (Tampil Mewah & Profesional) */}
            {(headline || subHeadlines.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-12">
                {/* Headline Utama (Kiri - 8 Kolom) */}
                {headline && (
                  <Link to={`/berita/${headline.slug}`} className={`group flex flex-col ${subHeadlines.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-lg mb-5 relative">
                      {headline.thumbnail ? (
                        <img src={`${BASE_URL}${headline.thumbnail}`} alt={headline.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">Tanpa Gambar</div>
                      )}
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none"></div>
                    </div>
                    <div>
                      <span className="inline-block bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
                        {headline.category?.name || 'Berita Utama'}
                      </span>
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] mb-4 group-hover:text-blue-600 transition-colors">
                        {headline.title}
                      </h1>
                      <div className="flex items-center gap-3 text-slate-500 text-xs sm:text-sm font-medium">
                        <span className="flex items-center gap-1.5"><User size={14} /> {headline.author?.name || 'Redaksi'}</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <span>{new Date(headline.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Sub Headline (Kanan - 4 Kolom) */}
                {subHeadlines.length > 0 && (
                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-8">
                    {subHeadlines.map(post => (
                      <Link to={`/berita/${post.slug}`} key={post.id} className="group flex-1 flex flex-col">
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md mb-4 relative">
                          {post.thumbnail ? (
                            <img src={`${BASE_URL}${post.thumbnail}`} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">Tanpa Gambar</div>
                          )}
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none"></div>
                        </div>
                        <div>
                          <span className="inline-block bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-2">
                            {post.category?.name || 'Kabar'}
                          </span>
                          <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                            {post.title}
                          </h2>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              {/* KOLOM KIRI (70%) */}
              <div className="lg:col-span-2">

              {otherPosts.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-600 inline-block"></span> Berita Terkini
                  </h2>
                  <div className="flex flex-col">
                    {otherPosts.map((post) => (
                      <Link to={`/berita/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-100 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg">
                        <div className="w-full sm:w-[200px] aspect-video sm:aspect-square md:aspect-[4/3] flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden relative">
                          {post.thumbnail ? (
                            <img src={`${BASE_URL}${post.thumbnail}`} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 bg-blue-50 px-2.5 py-0.5 rounded-full w-fit">{post.category?.name || 'Kabar'}</span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">{stripHtml(post.content)}</p>
                          <span className="text-[11px] text-gray-400 font-medium mt-auto flex items-center gap-2">{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} <span className="w-1 h-1 bg-gray-300 rounded-full"></span> {post.author?.name || 'Redaksi'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Widget Berlangganan (Newsletter) Mewah */}
                  {!isSearch && (
                    <div className="my-12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight flex items-center justify-center md:justify-start gap-3"><Mail className="text-blue-400" size={28} /> Dapatkan Akses Eksklusif</h3>
                          <p className="text-blue-100 font-medium text-sm md:text-base">Berlangganan buletin kami untuk mendapatkan ringkasan berita pilihan langsung ke email Anda setiap pagi.</p>
                        </div>
                        <div className="w-full md:w-auto flex-shrink-0">
                          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert('Terima kasih telah berlangganan!'); }}>
                            <input type="email" placeholder="Alamat email Anda..." required className="px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all font-medium min-w-[250px]" />
                            <button type="submit" className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl transition-colors shadow-lg hover:shadow-blue-500/50">Berlangganan</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasNextPage && (
                    <div className="mt-10 mb-8 flex justify-center">
                      <button 
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed group"
                      >
                        {isFetchingNextPage ? (
                          <><Loader2 className="animate-spin text-blue-400" size={20} /> Memanggil Data...</>
                        ) : (
                          <>Muat Lebih Banyak Berita <span className="group-hover:translate-y-1 transition-transform">&darr;</span></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {posts.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="text-slate-400 font-bold text-lg mb-2">Pencarian Tidak Ditemukan</div>
                  <p className="text-sm text-gray-500">Belum ada berita di rubrik ini.</p>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* KOLOM KANAN (30%): TANGGA BERITA TERPOPULER */}
            {/* ======================================================== */}
            <aside className="lg:col-span-1 mt-12 lg:mt-0 pt-10 lg:pt-0 border-t-4 border-slate-100 lg:border-none">
              <div className="sticky top-28">

                {/* Slot Iklan Sidebar (Kotak) */}
                <AdSlot adKey="ad_sidebar" height="250px" text="Space Iklan Kotak (300x250)" className="mb-10" />

                {/* Widget Data Pelengkap (Placeholder) */}
                <div className="mb-10 relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-t-4 border-blue-500 group">
                  {/* Animated Background Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                      <h3 className="font-black text-lg flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        LIVE INFO
                      </h3>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-400 font-mono tracking-wider"><LiveClock /> WIB</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{currentDate}</div>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm font-medium">
                      <div className="flex justify-between items-center group/item hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors cursor-default">
                        <span className="text-slate-300 flex items-center gap-2">
                          <TrendingUp size={16} className="text-green-400 group-hover/item:scale-110 transition-transform" /> IHSG
                        </span>
                        <span className="text-green-400 font-bold">▲ 7,234.56 <span className="text-[10px] bg-green-900/50 px-1.5 py-0.5 rounded text-green-300 ml-1">+0.45%</span></span>
                      </div>
                      <div className="flex justify-between items-center group/item hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors cursor-default">
                        <span className="text-slate-300 flex items-center gap-2">
                          <DollarSign size={16} className="text-amber-400 group-hover/item:scale-110 transition-transform" /> USD/IDR
                        </span>
                        <span className="text-amber-400 font-bold">
                          {widgetData?.usdToIdr ? `Rp ${widgetData.usdToIdr.toLocaleString('id-ID')}` : <Loader2 size={14} className="animate-spin inline" />}
                        </span>
                      </div>
                      <div className="flex justify-between items-center group/item hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors cursor-default">
                        <span className="text-slate-300 flex items-center gap-2">
                          <CloudSun size={16} className="text-sky-400 group-hover/item:scale-110 transition-transform" /> Cuaca JKT
                        </span>
                        <span className="text-sky-400 font-bold flex items-center gap-1">
                          {widgetData?.temperature ? `${widgetData.temperature}°C` : <Loader2 size={14} className="animate-spin inline" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-black text-slate-900 mb-6 border-b-2 border-slate-900 pb-2 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" /> Berita Terpopuler
                </h2>
                <div className="flex flex-col gap-6">
                  {popularPosts.map((post, index) => (
                    <Link to={`/berita/${post.slug}`} key={post.id} className="group flex gap-4 items-start">
                      {/* Nomor Urut Tangga Populer */}
                      <span className="text-4xl font-black text-gray-200 group-hover:text-blue-600 transition-colors w-10 text-center font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                          {post.category?.name || 'Kabar'} 
                          <span className="text-gray-400 font-normal lowercase"> • {post.views} pembaca</span>
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                  {popularPosts.length === 0 && <p className="text-sm text-gray-400">Belum ada data statistik pembaca.</p>}
                </div>
              </div>
            </aside>
            </div>
          </>
        )}
      </main>

      {/* FOOTER INFORMASI LEGAL & REDAKSI */}
      <Footer />
    </div>
  );
};

export default Home;