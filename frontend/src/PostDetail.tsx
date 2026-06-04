import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowLeft, Calendar, Clock, User, Share2, Link2, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';
import Footer from './Footer';
import AdSlot from './AdSlot';
import DarkModeToggle from './DarkModeToggle';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  createdAt: string;
  views: number;
  category?: { name: string; slug: string; };
  author?: { name: string; };
}

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);

  // EFEK: Menghitung persentase gulir (scroll) halaman untuk Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // EFEK SAMPING: Menambah tayangan (views) dan menggulung layar ke atas setiap kali URL berubah
  useEffect(() => {
    if (slug) {
      window.scrollTo(0, 0);
      // Hanya ping ke server, tidak perlu menunggu proses selesai (fire-and-forget)
      api.patch(`/posts/${slug}/views`).catch(console.error);
    }
  }, [slug]);

  // QUERY 1: Menarik Detail Berita berdasarkan Slug
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await api.get(`/posts/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug
  });

  // QUERY 2: Menarik Berita Terkait (Dependent Query)
  // Query ini HANYA akan berjalan JIKA data post dan kategorinya sudah tersedia dari Query 1
  const categorySlug = post?.category?.slug;
  const { data: relatedPosts = [] } = useQuery<Post[]>({
    queryKey: ['relatedPosts', categorySlug, post?.id],
    queryFn: async () => {
      const response = await api.get(`/posts?category=${categorySlug}&limit=4`);
      const result = response.data;
      const actualRelated = result.data ? result.data : result;
      // Filter agar berita yang sedang dibaca tidak muncul di list "Berita Terkait"
      return actualRelated.filter((p: Post) => p.id !== post?.id).slice(0, 3);
    },
    enabled: !!categorySlug && !!post?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 animate-pulse">
        <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="w-24 h-6 bg-slate-200 rounded-md"></div>
          <div className="w-32 h-6 bg-slate-200 rounded-md"></div>
        </nav>
        <main className="max-w-3xl mx-auto px-6 pb-20">
          {/* Badge & Title Skeleton */}
          <div className="mb-6 w-24 h-6 bg-slate-200 rounded-full"></div>
          <div className="w-full h-12 bg-slate-200 rounded-lg mb-4"></div>
          <div className="w-3/4 h-12 bg-slate-200 rounded-lg mb-8"></div>
          
          {/* Meta Info Skeleton */}
          <div className="flex gap-6 mb-10 border-b border-slate-100 pb-8">
            <div className="w-24 h-5 bg-slate-200 rounded-md"></div>
            <div className="w-24 h-5 bg-slate-200 rounded-md"></div>
            <div className="w-24 h-5 bg-slate-200 rounded-md"></div>
          </div>
          
          {/* Thumbnail & Content Skeleton */}
          <div className="w-full aspect-[21/9] bg-slate-200 rounded-2xl mb-10"></div>
          <div className="space-y-4">
            <div className="w-full h-4 bg-slate-200 rounded-md"></div>
            <div className="w-full h-4 bg-slate-200 rounded-md"></div>
            <div className="w-5/6 h-4 bg-slate-200 rounded-md"></div>
            <div className="w-full h-4 bg-slate-200 rounded-md mt-6"></div>
            <div className="w-4/5 h-4 bg-slate-200 rounded-md"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) return <div className="text-center py-20 font-bold text-slate-600">Artikel tidak ditemukan.</div>;

  const imageUrl = post.thumbnail ? `${BASE_URL}${post.thumbnail}` : '';

  // Hitung estimasi waktu baca (Asumsi kecepatan baca rata-rata 200 kata per menit)
  const wordCount = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Fungsi Berbagi
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareToWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' - ' + shareUrl)}`);
  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  const shareToTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`);
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Tautan berita berhasil disalin!');
  };

  // Fungsi untuk memecah konten HTML menjadi potongan (chunks) per 3 paragraf
  const splitContent = (htmlContent: string) => {
    const paragraphs = htmlContent.split(/<\/p>/i).filter(p => p.trim() !== '');
    const chunks: string[] = [];
    
    // Loop dengan kelipatan 3
    for (let i = 0; i < paragraphs.length; i += 3) {
      const chunk = paragraphs.slice(i, i + 3).join('</p>') + '</p>';
      chunks.push(chunk);
    }
    
    return chunks;
  };

  const contentChunks = splitContent(post.content);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      {/* Reading Progress Bar (Bilah Indikator Membaca) */}
      <div className="fixed top-0 left-0 h-1.5 bg-blue-600 z-[60] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${scrollProgress}%` }}></div>

      {/* FLOATING SHARE BAR (Hanya tampil di Desktop) */}
      <div className="fixed left-8 top-1/3 hidden xl:flex flex-col gap-3 z-40">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Bagikan</span>
        <button onClick={shareToFacebook} className="p-3 bg-white text-[#1877F2] rounded-full shadow-lg border border-slate-100 hover:scale-110 hover:bg-[#1877F2] hover:text-white transition-all" title="Bagikan ke Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </button>
        <button onClick={shareToTwitter} className="p-3 bg-white text-slate-900 rounded-full shadow-lg border border-slate-100 hover:scale-110 hover:bg-slate-900 hover:text-white transition-all" title="Bagikan ke X">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </button>
        <button onClick={shareToWhatsApp} className="p-3 bg-white text-[#25D366] rounded-full shadow-lg border border-slate-100 hover:scale-110 hover:bg-[#25D366] hover:text-white transition-all" title="Kirim via WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      </div>

      <Helmet>
        <title>{post.title} | Pustaka Publik</title>
        <meta name="description" content={post.content.replace(/<[^>]+>/g, '').substring(0, 160)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.replace(/<[^>]+>/g, '').substring(0, 160)} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Navigasi */}
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold text-sm uppercase tracking-widest">Kembali</span>
        </Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <span className="text-sm font-black tracking-tighter">PUSTAKA<span className="text-blue-600">PUBLIK</span></span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <article className="w-full">
          <div className="mb-6 flex justify-center md:justify-start">
            {post.category ? (
              <Link to={`/kategori/${post.category.slug}`} className="inline-block text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-full border border-blue-100 transition-colors shadow-sm">
                {post.category.name}
              </Link>
            ) : (
              <span className="inline-block text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-5 py-2 rounded-full border border-blue-100 shadow-sm">
                Berita Umum
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] md:leading-[1.15] mb-8 break-words text-center md:text-left tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-sm mb-10 border-y border-slate-100 py-5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <User size={18} className="text-slate-400" />
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">Ditulis oleh</p>
                  <p className="font-bold text-slate-700 leading-none">{post.author?.name || 'Tim Redaksi'}</p>
               </div>
            </div>
            <span className="text-slate-300 hidden md:block text-lg font-light">/</span>
            <div className="flex items-center gap-2 font-medium">
               <Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <span className="text-slate-300 hidden md:block text-lg font-light">/</span>
            <div className="flex items-center gap-2 font-medium">
               <Clock size={16} /> {readingTime} Menit Baca
            </div>
            <span className="text-slate-300 hidden md:block text-lg font-light">/</span>
            <div className="flex items-center gap-2 font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
               <Eye size={16} /> {post.views} Tayangan
            </div>
          </div>

          {imageUrl && (
            <figure className="mb-12 flex flex-col items-center">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-slate-100 group inline-block max-w-full">
                <img src={imageUrl} alt={post.title} loading="lazy" className="w-auto h-auto max-w-full max-h-[70vh] object-contain group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
              </div>
              <figcaption className="text-center text-sm text-slate-400 mt-4 italic px-4">
                Ilustrasi: {post.title}
              </figcaption>
            </figure>
          )}

          {/* Slot Iklan Bawah Judul / Atas Artikel */}
          <AdSlot adKey="ad_article_top" height="90px" text="Space Iklan Banner Artikel Atas" className="mb-10" />

          {/* Loop melalui setiap potongan konten paragraf */}
          {contentChunks.map((chunk, index) => (
            <React.Fragment key={index}>
              <div 
                className={`prose prose-slate prose-lg md:prose-xl prose-p:leading-relaxed max-w-none w-full 
                           prose-headings:font-black prose-a:text-blue-600 prose-a:decoration-blue-300 prose-a:underline-offset-4 hover:prose-a:decoration-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:text-slate-700
                           prose-img:rounded-3xl prose-img:shadow-xl prose-img:max-w-full
                           prose-table:block prose-table:overflow-x-auto
                           break-words overflow-hidden dark:prose-invert ${index > 0 ? 'mt-8' : ''}`}
                dangerouslySetInnerHTML={{ __html: chunk }} 
              />
              
              {/* Tampilkan iklan setelah setiap chunk KECUALI chunk yang terakhir */}
              {index < contentChunks.length - 1 && (
                <AdSlot adKey="ad_article_middle" height="90px" text={`Space Iklan Tengah Paragraf ${index * 3 + 3}`} className="my-10" />
              )}
            </React.Fragment>
          ))}

          {/* Slot Iklan Akhir Artikel */}
          <AdSlot adKey="ad_article_bottom" height="90px" text="Space Iklan Banner Artikel Bawah" className="mt-12" />

          {/* Tombol Bagikan (User Engagement) */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between py-8 px-8 bg-slate-50/80 rounded-3xl border border-slate-100 gap-6 shadow-sm">
            <div className="text-center md:text-left">
               <h3 className="font-black text-slate-800 text-xl mb-1 flex items-center justify-center md:justify-start gap-2"><Share2 size={20} className="text-blue-600"/> Bagikan Artikel</h3>
               <p className="text-sm text-slate-500 font-medium">Bantu sebarluaskan informasi yang bermanfaat ke teman Anda.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={shareToWhatsApp} className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#20bd5a] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">WhatsApp</button>
              <button onClick={shareToFacebook} className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-xl text-sm font-bold hover:bg-[#166fe5] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Facebook</button>
              <button onClick={shareToTwitter} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">X / Twitter</button>
              <button onClick={copyLink} className="flex items-center gap-2 p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="Salin Tautan"><Link2 size={20} /></button>
            </div>
          </div>

          {/* Zona Komentar Pengguna (Placeholder/Integrasi Siap Pakai) */}
          <div className="mt-8 bg-slate-50/50 p-10 rounded-3xl border border-slate-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
               <MessageCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Punya Pendapat?</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
               Masuk atau daftar untuk ikut berdiskusi dan memberikan komentar pada artikel ini.
               <br/><i className="text-xs text-slate-400 mt-2 block">(Fitur komentar dalam tahap pengembangan)</i>
            </p>
          </div>

          {/* Bagian Berita Terkait */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Baca Juga</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {relatedPosts.map(rp => (
                  <Link to={`/berita/${rp.slug}`} key={rp.id} className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                    <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      {rp.thumbnail ? (
                        <img src={`${BASE_URL}${rp.thumbnail}`} alt={rp.title} className="w-full h-full object-contain bg-slate-100 group-hover:scale-105 transition-transform duration-500 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">Tanpa Gambar</div>
                      )}
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none"></div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="font-bold text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">{rp.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      {/* FOOTER INFORMASI LEGAL & REDAKSI */}
      <Footer />
    </div>
  );
};

export default PostDetail;
