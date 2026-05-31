import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';

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
  createdAt: string;
  category?: {
    name: string;
    slug: string;
  };
}

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/posts/slug/${slug}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Gagal memuat berita:', error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchPost();
    fetchCategories();
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-500 animate-pulse">Memuat artikel...</div>;
  if (!post) return <div className="flex h-screen items-center justify-center text-red-500 font-bold text-xl">Berita tidak ditemukan!</div>;

  const plainTextContent = post.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...';
  const imageUrl = post.thumbnail ? `http://localhost:5050${post.thumbnail}` : 'http://localhost:5050/default-thumbnail.jpg';
  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-800">
      
      <Helmet>
        <title>{post.title} | Pustaka Publik</title>
        <meta name="description" content={plainTextContent} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={plainTextContent} />
        <meta property="og:image" content={imageUrl} />
      </Helmet>

      {/* Header Navigasi */}
      <nav className="bg-slate-900 text-white shadow-md mb-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter mr-8">
            PUSTAKA<span className="text-blue-500">PUBLIK</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 flex-1 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/?category=${cat.slug}`} className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
          <Link to="/" className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg transition-colors ml-4">
            &larr; Beranda
          </Link>
        </div>
      </nav>

      {/* Konten Utama */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* PERBAIKAN 1: Ditambahkan 'overflow-hidden' dan 'break-words' agar kontainer utama tidak bisa jebol */}
        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-12 overflow-hidden break-words">
          
          <div className="mb-4">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-blue-100">
              {post.category?.name || 'Berita Umum'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>
          
          <div className="text-xs font-medium text-slate-400 mb-8 pb-4 border-b border-gray-100">
            Diterbitkan: <span className="font-bold text-slate-600">{new Date(post.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          
          {post.thumbnail && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-md bg-gray-50">
              <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* ========================================================================= */}
          {/* PERBAIKAN 2: JALUR AMAN RENDER KONTEN (Anti Tabrakan Layout)              */}
          {/* ========================================================================= */}
          <div 
            className="text-slate-700 leading-relaxed text-base md:text-lg space-y-4
                       break-words overflow-hidden
                       [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_img]:mx-auto
                       [&_iframe]:max-w-full [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-6
                       [&_p]:mb-4 [&_p]:leading-relaxed
                       [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-6 [&_h1]:mb-3
                       [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                       [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                       [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all
                       [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_td]:border [&_td]:p-2"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
        </article>
      </div>

    </div>
  );
};

export default PostDetail;