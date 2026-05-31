import React, { useEffect, useState, useCallback } from 'react';
import NewsForm from './NewsForm';
import { 
  Menu, X, LogOut, FileText, CheckCircle, Clock, Trash2, Edit2, LayoutDashboard 
} from 'lucide-react';

// 1. PERBAIKAN: Menambahkan categoryId agar dikenali oleh TypeScript
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Post | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5050/api/posts');
      const data = await response.json();
      setPosts(data || []);
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

  const handleDelete = async (id: string) => {
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

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Memuat CMS...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 transition-transform md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-lg font-bold tracking-wider">PUSTAKA PUBLIK</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden"><X /></button>
        </div>
        
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400 font-medium"><LayoutDashboard size={20} /> Dashboard</div>
          <button onClick={onLogout} className="flex items-center gap-3 w-full text-red-400 mt-10 hover:text-red-300 transition-colors">
            <LogOut size={20} /> Keluar
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Redaksi News</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-100"><Menu /></button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Artikel', val: posts.length, icon: FileText, color: 'text-blue-600' },
            { label: 'Telah Publik', val: posts.filter(p => p.published).length, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Draf / Menunggu', val: posts.filter(p => !p.published).length, icon: Clock, color: 'text-amber-600' }
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

        {/* Editor & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <NewsForm 
              key={editingId || 'new_post'} 
              initialData={editingData ? {
                title: editingData.title,
                slug: editingData.slug,
                content: editingData.content,
                
                // 2. PERBAIKAN: Mengambil kategori dari database, bukan lagi angka '1'
                categoryId: editingData.categoryId, 
                
                thumbnail: editingData.thumbnail ? `http://localhost:5050${editingData.thumbnail}` : undefined
              } : undefined} 
              onSubmit={handleFormSubmit} 
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-slate-700">Arsip Berita</h3>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{posts.length} dokumen</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Informasi Artikel</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.length > 0 ? posts.map((item) => (
                    <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors ${editingId === item.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-gray-400 mt-1 font-mono">{item.slug}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          {item.published ? 'PUBLIK' : 'DRAF'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => { setEditingId(item.id); setEditingData(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Berita"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Permanen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-gray-400 font-medium">
                        Belum ada berita yang diterbitkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;