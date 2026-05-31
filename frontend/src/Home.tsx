import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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
  createdAt: string;
  category?: {
    name: string;
    slug: string;
  };
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const currentCategorySlug = searchParams.get('category') || '';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = currentCategorySlug
          ? `http://localhost:5050/api/posts?category=${currentCategorySlug}`
          : 'http://localhost:5050/api/posts';

        const response = await fetch(url);
        const data = await response.json();
        const publishedPosts = data.filter((post: Post) => post.published);
        setPosts(publishedPosts);
      } catch (error) {
        console.error('Gagal mengambil berita:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentCategorySlug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5050/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Gagal memuat kategori:', error);
      }
    };
    fetchCategories();
  }, []);

  const stripHtml = (htmlString: string) => {
    return htmlString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  };

  const headline = posts.length > 0 ? posts[0] : null;
  const mainPosts = posts.length > 1 ? posts.slice(1, 7) : []; // 6 Berita untuk kolom utama
  const sidebarPosts = posts.length > 7 ? posts.slice(7) : posts.slice(1, 5); // Sisanya untuk sidebar

  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* ========================================= */}
      {/* HEADER PROFESIONAL (3 LAPIS) */}
      {/* ========================================= */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        
        {/* Lapis 1: Top Bar (Tanggal & Login) */}
        <div className="bg-slate-900 text-slate-300 py-1.5 hidden md:block">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
            <span>{currentDate}</span>
            <Link to="/login" className="hover:text-white transition-colors">Ruang Redaksi &rarr;</Link>
          </div>
        </div>

        {/* Lapis 2: Logo Utama */}
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
            PUSTAKA<span className="text-blue-600">PUBLIK</span>
          </Link>
          
          {/* Menu Login untuk Mobile */}
          <Link to="/login" className="md:hidden text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md">
            Login
          </Link>
        </div>

        {/* Lapis 3: Navigasi Kategori (Scrollable) */}
        <div className="border-t border-gray-100">
          <nav className="max-w-6xl mx-auto px-4 flex items-center gap-6 overflow-x-auto hide-scrollbar">
            <Link 
              to="/" 
              className={`text-sm font-bold uppercase tracking-wide py-3 whitespace-nowrap transition-colors ${
                !currentCategorySlug ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Semua Kabar
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/?category=${cat.slug}`} 
                className={`text-sm font-bold uppercase tracking-wide py-3 whitespace-nowrap transition-colors ${
                  currentCategorySlug === cat.slug ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ========================================= */}
      {/* KONTEN UTAMA (KOLOM 70:30) */}
      {/* ========================================= */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400 font-bold animate-pulse">
            Menyusun Berita Terbaru...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            {/* KOLOM KIRI: HEADLINE & BERITA UTAMA (70%) */}
            <div className="lg:col-span-2">
              
              {/* Headline Berita */}
              {headline && (
                <article className="mb-10 pb-10 border-b-2 border-gray-100 group">
                  <Link to={`/berita/${headline.slug}`} className="block">
                    <div className="w-full aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden mb-5">
                      {headline.thumbnail ? (
                        <img 
                          src={`http://localhost:5050${headline.thumbnail}`} 
                          alt={headline.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Tanpa Gambar</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                        {headline.category?.name || 'Berita Utama'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(headline.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                      {headline.title}
                    </h1>
                    
                    <p className="text-slate-600 text-base md:text-lg line-clamp-3">
                      {stripHtml(headline.content)}
                    </p>
                  </Link>
                </article>
              )}

              {/* Daftar Berita Terkini (List View) */}
              {mainPosts.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-600 inline-block"></span> Berita Terkini
                  </h2>
                  
                  <div className="flex flex-col">
                    {mainPosts.map((post) => (
                      <Link to={`/berita/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-100 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg">
                        
                        {/* Gambar Kiri */}
                        <div className="w-full sm:w-[200px] aspect-video sm:aspect-square md:aspect-[4/3] flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                          {post.thumbnail ? (
                            <img 
                              src={`http://localhost:5050${post.thumbnail}`} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                          )}
                        </div>

                        {/* Teks Kanan */}
                        <div className="flex flex-col justify-center">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                            {post.category?.name || 'Kabar'}
                          </span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                            {stripHtml(post.content)}
                          </p>
                          <span className="text-[11px] text-gray-400 font-medium mt-auto">
                            {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {posts.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl">
                  Belum ada berita di rubrik ini.
                </div>
              )}
            </div>

            {/* KOLOM KANAN: SIDEBAR PILIHAN REDAKSI (30%) */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                
                <h2 className="text-lg font-black text-slate-900 mb-6 border-b-2 border-slate-900 pb-2">
                  Sorotan Editor
                </h2>

                <div className="flex flex-col gap-6">
                  {sidebarPosts.map((post, index) => (
                    <Link to={`/berita/${post.slug}`} key={post.id} className="group flex gap-4">
                      {/* Angka Unik Indikator */}
                      <span className="text-3xl font-black text-gray-200 group-hover:text-blue-500 transition-colors">
                        {index + 1}
                      </span>
                      
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                          {post.category?.name || 'Kabar'}
                        </span>
                        <h3 className="text-sm md:text-base font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  ))}

                  {sidebarPosts.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada sorotan tambahan.</p>
                  )}
                </div>

                {/* Banner Iklan Visual (Opsional untuk kesan profesional) */}
                <div className="mt-10 w-full h-64 bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200 rounded-lg">
                  <span className="text-xs uppercase tracking-widest font-bold mb-2">Space Iklan</span>
                  <span className="text-[10px]">300 x 250</span>
                </div>

              </div>
            </aside>

          </div>
        )}
      </main>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20 border-t-4 border-blue-600">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter text-white block mb-4">
              PUSTAKA<span className="text-blue-500">PUBLIK</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Portal berita terpercaya yang menyajikan informasi aktual, tajam, dan independen.
            </p>
            <p className="text-xs">&copy; {new Date().getFullYear()} Pustaka Publik Network.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Beranda Utama</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login Redaksi</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pedoman Media Siber</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Ikuti Kami</h4>
            <p className="text-sm mb-4">Dapatkan pemberitahuan berita terbaru langsung di beranda media sosial Anda.</p>
            {/* Tempat icon sosial media */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors"></div>
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-400 cursor-pointer transition-colors"></div>
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 cursor-pointer transition-colors"></div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;