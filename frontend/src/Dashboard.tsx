import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsForm from './NewsForm';
import { 
  Menu, X, LogOut, FileText, CheckCircle, Trash2, Edit2, LayoutDashboard, Tags, Plus, Users, Key, Settings, Upload, User 
} from 'lucide-react';
import api, { BASE_URL, getErrorMessage } from './api';

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
  authorId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: { name: string };
  isApproved: boolean;
}

interface SiteSettings {
  [key: string]: string;
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'profile' | 'categories' | 'users' | 'settings'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const navigate = useNavigate();

  const getAuthToken = useCallback((): string | null => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  }, [navigate]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Post | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleName, setUserRoleName] = useState('Jurnalis');
  
  // State untuk Pengaturan Website
  const [siteName, setSiteName] = useState('');
  const [siteLogoFile, setSiteLogoFile] = useState<File | null>(null);
  const [siteLogoPreview, setSiteLogoPreview] = useState<string | null>(null);

  // State untuk Profil Pengguna
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const refreshData = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Decode (Bongkar) payload JWT Token untuk mendapatkan roleName
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.roleName;
      const uid = payload.userId;
      setUserRole(role);
      setUserId(uid);

      const requests = [
        api.get('/posts?limit=100'),
        api.get('/categories'),
        api.get('/users/me'), // Ambil data profil pengguna yang login
      ];

      // Hanya minta data Jurnalis ke server JIKA rolenya Admin
      if (role === 'Admin') {
        requests.push(api.get('/users'));
        requests.push(api.get('/settings')); // Ambil juga data pengaturan
      }

      const responses = await Promise.all(requests);
      const postsResponse = responses[0].data;
      const catData = responses[1].data;
      const profileData = responses[2].data;
      let usersData: User[] = [];
      let settingsData: SiteSettings = {};
      if (role === 'Admin') {
        usersData = responses[3]?.data || [];
        settingsData = responses[4]?.data || {};
      }
      const actualPosts = postsResponse.data ? postsResponse.data : postsResponse;
      
      setPosts(actualPosts || []);
      setCategories(catData || []);
      setProfileName(profileData.name);
      setProfileEmail(profileData.email);
      setUsers(usersData || []);
      setSiteName(settingsData.site_name || 'Pustaka Publik');
      setSiteLogoPreview(settingsData.site_logo ? `${BASE_URL}${settingsData.site_logo}` : null);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  }, [getAuthToken]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, [refreshData]);

  const handleFormSubmit = async (formData: FormData) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      if (editingId) {
        await api.put(`/posts/${editingId}`, formData);
      } else {
        await api.post('/posts', formData);
      }
      
      await refreshData();
      setEditingId(null);
      setEditingData(null);
      alert(editingId ? 'Berita diperbarui!' : 'Berita diterbitkan!');
    } catch (error: unknown) {
      console.error(error);
      alert(getErrorMessage(error));
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Hapus berita permanen?')) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await api.delete(`/posts/${id}`);
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, { name: categoryName });
      } else {
        await api.post('/categories', { name: categoryName });
      }
      
      await refreshData();
      setCategoryName('');
      setEditingCategoryId(null);
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await api.delete(`/categories/${id}`);
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;
    
    try {
      await api.post('/users', { name: userName, email: userEmail, password: userPassword, roleName: userRoleName });
      
      await refreshData();
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRoleName('Jurnalis');
      alert('Pengguna berhasil ditambahkan!');
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Hapus pengguna ini?')) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await api.delete(`/users/${id}`);
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetPassword = async (id: string, userName: string) => {
    const newPassword = window.prompt(`Masukkan kata sandi baru untuk pengguna ${userName}:\n(Minimal 6 karakter)`);
    if (!newPassword) return; // Batal jika kosong atau cancel
    if (newPassword.length < 6) {
      alert('Kata sandi terlalu pendek! Minimal 6 karakter.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;
    try {
      await api.patch(`/users/${id}/reset-password`, { newPassword });
      alert(`Kata sandi untuk ${userName} berhasil diubah!`);
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleApproveUser = async (id: string, userName: string) => {
    if (!window.confirm(`Setujui akses untuk pengguna ${userName}?`)) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await api.patch(`/users/${id}/approve`);
      await refreshData();
    } catch (error) {
      console.error(error);
      alert('Gagal memproses persetujuan.');
    }
  };

  const handleSiteLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 2 * 1024 * 1024) {
        alert('Ukuran logo terlalu besar! Maksimal 2MB.');
        e.target.value = '';
        return;
      }
      setSiteLogoFile(selected);
      setSiteLogoPreview(URL.createObjectURL(selected));
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    const formData = new FormData();
    formData.append('site_name', siteName);
    if (siteLogoFile) {
      formData.append('site_logo', siteLogoFile);
    }

    try {
      await api.post('/settings', formData);
      alert('Pengaturan website berhasil diperbarui!');
      await refreshData();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      await api.put('/users/me', { name: profileName, email: profileEmail });
      alert('Profil berhasil diperbarui!');
      await refreshData(); // Refresh data untuk update nama di tempat lain jika ada
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      alert('Kata sandi berhasil diubah.');
      // Kosongkan field password setelah berhasil
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      alert(getErrorMessage(error));
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
          <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><User size={20} /> Profil Saya</button>
          {userRole === 'Admin' && (
            <>
              <button onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Tags size={20} /> Kelola Kategori</button>
              <button onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Users size={20} /> Kelola Pengguna</button>
              <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Settings size={20} /> Pengaturan</button>
            </>
          )}
          <div className="pt-10"><button onClick={onLogout} className="flex items-center gap-3 px-4 w-full text-red-400 hover:text-red-300 font-bold transition-colors"><LogOut size={20} /> Keluar Sistem</button></div>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">{activeTab === 'posts' ? 'Ruang Redaksi' : activeTab === 'profile' ? 'Pengaturan Profil' : activeTab === 'categories' ? 'Manajemen Rubrik' : activeTab === 'users' ? 'Manajemen Pengguna' : 'Pengaturan Website'}</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-100"><Menu /></button>
        </header>

        {activeTab === 'posts' && (
          <>
            <div className={`grid grid-cols-1 gap-6 mb-8 ${userRole === 'Admin' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {([
                { label: 'Total Artikel', val: posts.length, icon: FileText, color: 'text-blue-600' },
                { label: 'Telah Publik', val: posts.filter(p => p.published).length, icon: CheckCircle, color: 'text-green-600' },
                { label: 'Total Kategori', val: categories.length, icon: Tags, color: 'text-purple-600' },
                ...(userRole === 'Admin' ? [{ label: 'Total Pengguna', val: users.length, icon: Users, color: 'text-orange-600' }] : [])
              ]).map((stat, i) => (
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
                <NewsForm key={editingId || 'new_post'} userRole={userRole} initialData={editingData ? { title: editingData.title, slug: editingData.slug, content: editingData.content, categoryId: editingData.categoryId, thumbnail: editingData.thumbnail ? `${BASE_URL}${editingData.thumbnail}` : undefined } : undefined} onSubmit={handleFormSubmit} />
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
                          {userRole === 'Jurnalis' && (item.authorId !== userId || item.published) ? (
                            <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">Terkunci</span>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(item.id); setEditingData(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeletePost(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 gap-10">
            {/* Form Ubah Profil */}
            <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-xl font-black text-slate-800 mb-2">Profil Pengguna</h2>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border rounded-xl font-medium" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Alamat Email</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border rounded-xl font-medium" 
                  required
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl mt-4">Simpan Perubahan Profil</button>
            </form>

            {/* Form Ubah Password */}
            <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-xl font-black text-slate-800 mb-2">Ubah Kata Sandi</h2>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-bold" placeholder="Kata Sandi Saat Ini" required autoComplete="current-password" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-bold" placeholder="Kata Sandi Baru (Min. 6 Karakter)" required minLength={6} autoComplete="new-password" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-bold" placeholder="Konfirmasi Kata Sandi Baru" required minLength={6} autoComplete="new-password" />
              <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl mt-4">Ubah Kata Sandi</button>
            </form>
          </div>
        )}

        {activeTab === 'categories' && userRole === 'Admin' && (
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

        {activeTab === 'users' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={handleUserSubmit} autoComplete="off" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} /> Tambah Pengguna</h2>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="off" className="w-full p-4 bg-gray-50 border rounded-xl mb-4 font-bold" placeholder="Nama Lengkap" required />
                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} autoComplete="off" className="w-full p-4 bg-gray-50 border rounded-xl mb-4 font-bold" placeholder="Alamat Email" required />
                <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} autoComplete="new-password" className="w-full p-4 bg-gray-50 border rounded-xl mb-4 font-bold" placeholder="Kata Sandi (Min. 6 Karakter)" required minLength={6} />
                <select value={userRoleName} onChange={(e) => setUserRoleName(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl mb-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                  <option value="Jurnalis">Jurnalis</option>
                  <option value="Redaktur">Redaktur</option>
                  <option value="Admin">Administrator</option>
                </select>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl">Tambahkan</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                  <tr><th className="p-4 pl-6">Nama & Email</th><th className="p-4 text-center">Peran</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-600">
                        {user.role?.name || 'Jurnalis'}
                        <div className="mt-1">
                          {user.isApproved ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Aktif</span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">Menunggu</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {!user.isApproved && (
                          <button onClick={() => handleApproveUser(user.id, user.name)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2" title="Setujui Pengguna"><CheckCircle size={16} /></button>
                        )}
                        <button onClick={() => handleResetPassword(user.id, user.name)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-2" title="Reset Kata Sandi"><Key size={16} /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && userRole === 'Admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSettingsSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-xl font-black text-slate-800 mb-2">Pengaturan Umum</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nama Website</label>
                <input 
                  type="text" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border rounded-xl font-medium" 
                  placeholder="Nama Portal Berita Anda" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Logo Website</label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                    {siteLogoPreview ? (
                      <img src={siteLogoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-xs text-gray-400">Belum ada logo</span>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl flex items-center gap-2">
                    <Upload size={16} /> Ganti Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleSiteLogoChange} />
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl mt-4">Simpan Pengaturan</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;