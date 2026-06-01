import React, { useEffect, useState, useCallback } from 'react';
import NewsForm from './NewsForm';
import { 
  Menu, X, LogOut, FileText, CheckCircle, Trash2, Edit2, LayoutDashboard, Tags, Plus 
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  thumbnail: string | null;
  createdAt: string;
  categoryId: string | number; 
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Post | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [postsRes, catRes] = await Promise.all([
        fetch('http://localhost:5050/api/posts?limit=100'),
        fetch('http://localhost:5050/api/categories')
      ]);
      const postsResponse = await postsRes.json();
      const catData = await catRes.json();
      const actualPosts = postsResponse.data ? postsResponse.data : postsResponse;
      
      setPosts(actualPosts || []);
      setCategories(catData || []);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, [refreshData]);

  const handleFormSubmit = async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const url = editingId ? `http://localhost:5050/api/posts/${editingId}` : 'http://localhost:5050/api/posts';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Gagal memproses berita.');
      
      await refreshData();
      setEditingId(null);
      setEditingData(null);
      alert(editingId ? 'Berita diperbarui!' : 'Berita diterbitkan!');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Hapus berita permanen?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5050/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingCategoryId ? `http://localhost:5050/api/categories/${editingCategoryId}` : 'http://localhost:5050/api/categories';
    const method = editingCategoryId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: categoryName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal memproses kategori.');
      
      await refreshData();
      setCategoryName('');
      setEditingCategoryId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5050/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Memuat CMS...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 transition-transform md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-lg font-black tracking-wider text-white">PUSTAKA<span className="text-blue-500">PUBLIK</span></h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400"><X /></button>
        </div>
        <nav className="space-y-2">
          <button onClick={() => { setActiveTab('posts'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> Kelola Berita</button>
          <button onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Tags size={20} /> Kelola Kategori</button>
          <div className="pt-10"><button onClick={onLogout} className="flex items-center gap-3 px-4 w-full text-red-400 hover:text-red-300 font-bold transition-colors"><LogOut size={20} /> Keluar Sistem</button></div>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">{activeTab === 'posts' ? 'Ruang Redaksi' : 'Manajemen Rubrik'}</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-100"><Menu /></button>
        </header>

        {activeTab === 'posts' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Artikel', val: posts.length, icon: FileText, color: 'text-blue-600' },
                { label: 'Telah Publik', val: posts.filter(p => p.published).length, icon: CheckCircle, color: 'text-green-600' },
                { label: 'Total Kategori', val: categories.length, icon: Tags, color: 'text-purple-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-800">{stat.val}</p>
                  </div>
                  <stat.icon className={`${stat.color} w-8 h-8 opacity-80`} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <NewsForm key={editingId || 'new_post'} initialData={editingData ? { title: editingData.title, slug: editingData.slug, content: editingData.content, categoryId: editingData.categoryId, thumbnail: editingData.thumbnail ? `http://localhost:5050${editingData.thumbnail}` : undefined } : undefined} onSubmit={handleFormSubmit} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                    <tr><th className="p-4 pl-6">Artikel</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {posts.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4 pl-6 font-bold text-slate-800">{item.title}</td>
                        <td className="p-4 text-center">
                          {item.published ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> PUBLIK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> DRAF
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => { setEditingId(item.id); setEditingData(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeletePost(item.id)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={handleCategorySubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">{editingCategoryId ? 'Edit Kategori' : <><Plus size={20} /> Tambah Rubrik</>}</h2>
                <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl mb-4 font-bold" placeholder="Nama Kategori" required />
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl">{editingCategoryId ? 'Simpan' : 'Tambahkan'}</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                  <tr><th className="p-4">Nama Rubrik</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="p-4 font-bold">{cat.name}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setEditingCategoryId(cat.id); setCategoryName(cat.name); }} className="p-2 text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;