import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';
import Footer from './Footer';
import DarkModeToggle from './DarkModeToggle';

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
  category?: { name: string; slug: string; };
  author?: { name: string; };
}

interface SiteSettings {
  [key: string]: string;
}

const CategoryArchive: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    }
  });

  const currentCategory = categories.find((c) => c.slug === slug);
  const categoryName = currentCategory?.name || 'Memuat...';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['categoryArchive', slug],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/posts?category=${slug}&page=${pageParam}&limit=10`);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: !!slug
  });

  const stripHtml = (htmlString: string) => {
    return htmlString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  };

  const posts = data?.pages.flatMap(page => page.data ? page.data : page) || [];
  const siteName = settings?.site_name || 'PUSTAKA PUBLIK';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Helmet>
        <title>Arsip Kategori: {categoryName} | {siteName}</title>
        <meta name="description" content={`Kumpulan berita terbaru dan terlengkap seputar ${categoryName}.`} />
      </Helmet>

      {/* Header Sederhana */}
      <nav className="max-w-6xl w-full mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold text-sm uppercase tracking-widest">Beranda</span>
        </Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <span className="text-sm font-black tracking-tighter hidden sm:block">
            {siteName.toUpperCase()}
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-grow w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Rubrik <span className="text-blue-600">{categoryName}</span></h1>
          <p className="text-slate-500 font-medium">Menampilkan seluruh berita dan artikel dalam kategori ini.</p>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400 font-bold py-20 animate-pulse">Memuat Arsip Berita...</div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-8">
            {posts.map((post: Post) => (
              <Link to={`/berita/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-6 p-4 -mx-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-full sm:w-64 flex-shrink-0 aspect-video bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm">
                  {post.thumbnail ? (
                    <img src={`${BASE_URL}${post.thumbnail}`} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">Tanpa Gambar</div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 inline-block bg-blue-50 px-3 py-1 rounded-full w-fit">{post.category?.name || 'Kabar'}</span>
                  <h3 className="text-2xl font-black text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-4 leading-relaxed">{stripHtml(post.content)}</p>
                  <div className="flex items-center gap-3 mt-auto text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><User size={14} /> {post.author?.name || 'Redaksi'}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}

            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 group">
                  {isFetchingNextPage ? <><Loader2 className="animate-spin text-blue-400" size={20} /> Memanggil Data...</> : <>Muat Lebih Banyak <span className="group-hover:translate-y-1 transition-transform">&darr;</span></>}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-slate-400 font-bold text-xl mb-2">Belum ada berita</div>
            <p className="text-slate-500">Kategori ini masih kosong.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
export default CategoryArchive;