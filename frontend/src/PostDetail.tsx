import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';

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

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
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
        <span className="text-sm font-black tracking-tighter">PUSTAKA<span className="text-blue-600">PUBLIK</span></span>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <article className="w-full">
          <div className="mb-6">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              {post.category?.name || 'Berita Umum'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-8 break-words">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-slate-400 text-sm mb-10 border-b border-slate-100 pb-8">
             <div className="flex items-center gap-2 font-medium text-slate-600">
                <User size={18} /> Oleh: <span className="font-bold">{post.author?.name || 'Tim Redaksi'}</span>
             </div>
             <div className="flex items-center gap-2 font-medium">
                <Calendar size={18} /> {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
             </div>
             <div className="flex items-center gap-2 font-medium">
                <Clock size={18} /> {readingTime} Menit Baca
             </div>
             <div className="flex items-center gap-2 font-bold text-blue-600">
                <Eye size={18} /> {post.views} Tayangan
             </div>
          </div>

          {imageUrl && (
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-lg bg-slate-100">
              <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="prose prose-slate prose-lg max-w-none w-full 
                       prose-headings:font-black prose-a:text-blue-600 
                       prose-img:rounded-2xl prose-img:shadow-lg prose-img:max-w-full
                       prose-table:block prose-table:overflow-x-auto
                       break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          {/* Bagian Berita Terkait */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-100">
              <h3 className="text-2xl font-black mb-6">Mungkin Anda Suka</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map(rp => (
                  <Link to={`/berita/${rp.slug}`} key={rp.id} className="group block">
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                      {rp.thumbnail ? (
                        <img src={`${BASE_URL}${rp.thumbnail}`} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Tanpa Gambar</div>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{rp.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default PostDetail;
