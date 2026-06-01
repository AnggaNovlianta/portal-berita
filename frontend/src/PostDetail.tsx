import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowLeft, Calendar } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  createdAt: string;
  views: number;
  category?: { name: string; slug: string; };
}

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndIncrementView = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/posts/slug/${slug}`);
        if (!response.ok) throw new Error('Berita tidak ditemukan');
        const data = await response.json();
        setPost(data);

        await fetch(`http://localhost:5050/api/posts/${slug}/views`, { method: 'PATCH' });
      } catch (error) {
        console.error('Gagal memuat berita:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPostAndIncrementView();
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-400">Memuat artikel...</div>;
  if (!post) return <div className="text-center py-20 font-bold text-slate-600">Artikel tidak ditemukan.</div>;

  const imageUrl = post.thumbnail ? `http://localhost:5050${post.thumbnail}` : '';

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <Helmet>
        <title>{post.title} | Pustaka Publik</title>
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
             <div className="flex items-center gap-2 font-medium">
                <Calendar size={18} /> {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
        </article>
      </main>
    </div>
  );
};

export default PostDetail;
