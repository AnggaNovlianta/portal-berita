import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Loader2, TrendingUp, User } from 'lucide-react'; // Tambah ikon Trending & User
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';

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
  const headline = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.length > 1 ? posts.slice(1) : [];
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

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {currentSearchQuery && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <h2 className="text-blue-800 font-medium">Menampilkan hasil pencarian untuk: <span className="font-black">"{currentSearchQuery}"</span></h2>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 animate-pulse">
            <div className="lg:col-span-2">
              {/* Skeleton Berita Utama */}

              <div>
                <div className="w-48 h-6 bg-slate-200 rounded mb-6"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-100">
                    <div className="w-full sm:w-[200px] aspect-video sm:aspect-square md:aspect-[4/3] bg-slate-200 rounded-lg"></div>
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
            {/* Skeleton Tangga Berita Populer (Sidebar) */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="w-48 h-6 bg-slate-200 rounded mb-6"></div>
              <div className="flex flex-col gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-slate-200 rounded"></div>
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
                        {/* KOLOM KIRI (70%) */}
            <div className="lg:col-span-2">
              
              {headline && (
                <article className="mb-10 pb-10 border-b-2 border-gray-100 group">
                  <Link to={`/berita/${headline.slug}`} className="block">
                    <div className="w-full aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden mb-5 relative">

                      {headline.thumbnail ? (
                        <img src={`${BASE_URL}${headline.thumbnail}`} alt={headline.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Tanpa Gambar</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{headline.category?.name || 'Berita Utama'}</span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1 border-l border-gray-300 pl-3"><User size={12} /> {headline.author?.name || 'Redaksi'}</span>
                      <span className="text-xs text-gray-400 font-medium">{new Date(headline.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{headline.title}</h1>
                    <p className="text-slate-600 text-base md:text-lg line-clamp-3">{stripHtml(headline.content)}</p>
                  </Link>
                </article>
              )}

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
                            <img src={`${BASE_URL}${post.thumbnail}`} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">{post.category?.name || 'Kabar'}</span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">{stripHtml(post.content)}</p>
                          <span className="text-[11px] text-gray-400 font-medium mt-auto flex items-center gap-2">{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} <span className="w-1 h-1 bg-gray-300 rounded-full"></span> {post.author?.name || 'Redaksi'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

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
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-32">
                <h2 className="text-lg font-black text-slate-900 mb-6 border-b-2 border-slate-900 pb-2 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" /> Berita Terpopuler
                </h2>
                <div className="flex flex-col gap-6">
                  {popularPosts.map((post, index) => (
                    <Link to={`/berita/${post.slug}`} key={post.id} className="group flex gap-4 items-start">
                      {/* Nomor Urut Tangga Populer */}
                      <span className="text-4xl font-black text-gray-200 group-hover:text-blue-600 transition-colors w-10 text-center font-mono">
                        {String(index + 1).padStart(2, '0')}
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
        )}
      </main>
    </div>
  );
};

export default Home;