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

interface BoardMemberState {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string | null;
  file?: File | null;
  preview?: string | null;
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

  // State untuk Informasi & Sosial Media
  const [siteMotto, setSiteMotto] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');

  const [boardMembers, setBoardMembers] = useState<BoardMemberState[]>([]);

  // State untuk Iklan
  const [adLinks, setAdLinks] = useState({ ad_leaderboard: '', ad_sidebar: '', ad_article_top: '', ad_article_bottom: '' });
  const [adSlots, setAdSlots] = useState({ ad_leaderboard: '', ad_sidebar: '', ad_article_top: '', ad_article_bottom: '' });
  const [adPreviews, setAdPreviews] = useState({ ad_leaderboard: null as string|null, ad_sidebar: null as string|null, ad_article_top: null as string|null, ad_article_bottom: null as string|null });
  const [adFiles, setAdFiles] = useState<{ [key: string]: File }>({});

  // State untuk Pengaturan Email SMTP
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

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
      setSiteMotto(settingsData.site_motto || '');
      setCompanyAddress(settingsData.company_address || '');
      setCompanyPhone(settingsData.company_phone || '');
      setCompanyEmail(settingsData.company_email || '');
      setSocialFacebook(settingsData.social_facebook || '');
      setSocialTwitter(settingsData.social_twitter || '');
      setSocialInstagram(settingsData.social_instagram || '');
      setSocialYoutube(settingsData.social_youtube || '');
      
      setAdLinks({
        ad_leaderboard: settingsData.ad_leaderboard_link || '',
        ad_sidebar: settingsData.ad_sidebar_link || '',
        ad_article_top: settingsData.ad_article_top_link || '',
        ad_article_bottom: settingsData.ad_article_bottom_link || ''
      });
      setAdSlots({
        ad_leaderboard: settingsData.ad_leaderboard_slot || '',
        ad_sidebar: settingsData.ad_sidebar_slot || '',
        ad_article_top: settingsData.ad_article_top_slot || '',
        ad_article_bottom: settingsData.ad_article_bottom_slot || ''
      });
      setAdPreviews({
        ad_leaderboard: settingsData.ad_leaderboard ? `${BASE_URL}${settingsData.ad_leaderboard}` : null,
        ad_sidebar: settingsData.ad_sidebar ? `${BASE_URL}${settingsData.ad_sidebar}` : null,
        ad_article_top: settingsData.ad_article_top ? `${BASE_URL}${settingsData.ad_article_top}` : null,
        ad_article_bottom: settingsData.ad_article_bottom ? `${BASE_URL}${settingsData.ad_article_bottom}` : null,
      });

      setSmtpHost(settingsData.smtp_host || 'smtp.gmail.com');
      setSmtpPort(settingsData.smtp_port || '587');
      setSmtpUser(settingsData.smtp_user || '');
      setSmtpPass(settingsData.smtp_pass || '');
      setBoardMembers(settingsData.editorial_board ? JSON.parse(settingsData.editorial_board) : []);
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

  const handleUpdateUserRole = async (id: string, newRole: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi ${newRole}?`)) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await api.patch(`/users/${id}/role`, { roleName: newRole });
      await refreshData();
      alert('Peran pengguna berhasil diperbarui!');
    } catch (error: unknown) {
      console.error(error);
      alert(getErrorMessage(error));
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

  // Fungsi Tambahan untuk Susunan Redaksi
  const handleAddMember = () => {
    setBoardMembers([...boardMembers, { id: Date.now().toString(), name: '', role: '', description: '', photo: null }]);
  };

  const handleRemoveMember = (index: number) => {
    if (!window.confirm('Hapus anggota ini dari struktur redaksi?')) return;
    const newMembers = [...boardMembers];
    newMembers.splice(index, 1);
    setBoardMembers(newMembers);
  };

  const handleMemberChange = (index: number, field: keyof BoardMemberState, value: string) => {
    const newMembers = [...boardMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setBoardMembers(newMembers);
  };

  const handleMemberPhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { alert('Maksimal 2MB.'); e.target.value = ''; return; }
      const newMembers = [...boardMembers];
      newMembers[index].file = file;
      newMembers[index].preview = URL.createObjectURL(file);
      setBoardMembers(newMembers);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    const formData = new FormData();
    formData.append('site_name', siteName);
    formData.append('site_motto', siteMotto);
    formData.append('company_address', companyAddress);
    formData.append('company_phone', companyPhone);
    formData.append('company_email', companyEmail);
    formData.append('social_facebook', socialFacebook);
    formData.append('social_twitter', socialTwitter);
    formData.append('social_instagram', socialInstagram);
    formData.append('social_youtube', socialYoutube);
    formData.append('ad_leaderboard_link', adLinks.ad_leaderboard);
    formData.append('ad_sidebar_link', adLinks.ad_sidebar);
    formData.append('ad_article_top_link', adLinks.ad_article_top);
    formData.append('ad_article_bottom_link', adLinks.ad_article_bottom);
    formData.append('ad_leaderboard_slot', adSlots.ad_leaderboard);
    formData.append('ad_sidebar_slot', adSlots.ad_sidebar);
    formData.append('ad_article_top_slot', adSlots.ad_article_top);
    formData.append('ad_article_bottom_slot', adSlots.ad_article_bottom);
    formData.append('smtp_host', smtpHost);
    formData.append('smtp_port', smtpPort);
    formData.append('smtp_user', smtpUser);
    formData.append('smtp_pass', smtpPass);
    if (siteLogoFile) {
      formData.append('site_logo', siteLogoFile);
    }

    const boardToSave = boardMembers.map(m => ({ id: m.id, name: m.name, role: m.role, description: m.description, photo: m.photo }));
    formData.append('editorial_board', JSON.stringify(boardToSave));
    boardMembers.forEach(m => {
      if (m.file) {
        formData.append(`board_photo_${m.id}`, m.file);
      }
    });
    
    Object.keys(adFiles).forEach(key => {
      formData.append(key, adFiles[key]);
    });

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
                        {user.id !== userId ? (
                          <select
                            value={user.role?.name || 'Jurnalis'}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="Jurnalis">Jurnalis</option>
                            <option value="Redaktur">Redaktur</option>
                            <option value="Admin">Administrator</option>
                          </select>
                        ) : (
                          <span>{user.role?.name || 'Jurnalis'}</span>
                        )}
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

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Motto / Slogan (Tampil di Footer)</label>
                  <textarea value={siteMotto} onChange={(e) => setSiteMotto(e.target.value)} rows={2} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="Portal berita profesional dan terpercaya..."></textarea>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2 mt-8 pt-8 border-t border-gray-100">Informasi Kontak & Alamat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-2">Alamat Kantor</label>
                  <textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} rows={3} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="Gedung Jurnalistik Lt. 5..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Nomor Telepon</label>
                  <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="(021) 1234-5678" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Email Perusahaan</label>
                  <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="redaksi@pustakapublik.com" />
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2 mt-8 pt-8 border-t border-gray-100">Tautan Sosial Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Facebook</label>
                  <input type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">X / Twitter</label>
                  <input type="url" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="https://twitter.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Instagram</label>
                  <input type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">YouTube</label>
                  <input type="url" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="https://youtube.com/..." />
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2 mt-8 pt-8 border-t border-gray-100">Susunan Redaksi</h2>
              <p className="text-sm text-gray-500 mb-4">Atur profil tim redaksi untuk ditampilkan di halaman Susunan Redaksi.</p>
              <div className="space-y-6">
                {boardMembers.map((member, index) => (
                  <div key={member.id} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row gap-6 relative">
                    <button type="button" onClick={() => handleRemoveMember(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Hapus Anggota"><Trash2 size={18}/></button>
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-24 h-24 bg-white rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {member.preview || member.photo ? (
                          <img src={member.preview || `${BASE_URL}${member.photo}`} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-300" />
                        )}
                      </div>
                      <label className="block text-center mt-3 cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">
                        Ganti Foto
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMemberPhotoChange(index, e)} />
                      </label>
                    </div>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">Nama Lengkap</label>
                        <input type="text" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} className="w-full p-3 bg-white border rounded-xl font-medium text-sm" placeholder="Nama Lengkap" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">Jabatan / Peran</label>
                        <input type="text" value={member.role} onChange={(e) => handleMemberChange(index, 'role', e.target.value)} className="w-full p-3 bg-white border rounded-xl font-medium text-sm" placeholder="Misal: Pemimpin Redaksi" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-2">Deskripsi Singkat (Opsional)</label>
                        <input type="text" value={member.description} onChange={(e) => handleMemberChange(index, 'description', e.target.value)} className="w-full p-3 bg-white border rounded-xl font-medium text-sm" placeholder="Deskripsi tugas atau bio singkat..." />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddMember} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Plus size={18} /> Tambah Anggota Redaksi
                </button>
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2 mt-8 pt-8 border-t border-gray-100">Manajemen Iklan (Banners)</h2>
              <p className="text-sm text-gray-500 mb-4">Unggah gambar banner dan tautan manual, <b>ATAU</b> masukkan ID Slot AdSense untuk menampilkan iklan otomatis dari Google.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'ad_leaderboard', label: 'Leaderboard (Atas Beranda)' },
                  { id: 'ad_sidebar', label: 'Sidebar (Samping Kanan)' },
                  { id: 'ad_article_top', label: 'Banner (Atas Artikel)' },
                  { id: 'ad_article_bottom', label: 'Banner (Bawah Artikel)' },
                ].map(ad => (
                  <div key={ad.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-4">
                    <label className="block text-sm font-bold text-gray-600">{ad.label}</label>
                    <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                      {adPreviews[ad.id as keyof typeof adPreviews] ? (
                        <img src={adPreviews[ad.id as keyof typeof adPreviews]!} alt="preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">Belum ada gambar</span>
                      )}
                    </div>
                    <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                      Pilih Gambar Iklan
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 2 * 1024 * 1024) { alert('Maks 2MB'); return; }
                          setAdFiles(prev => ({...prev, [ad.id]: file}));
                          setAdPreviews(prev => ({...prev, [ad.id]: URL.createObjectURL(file)}));
                        }
                      }} />
                    </label>
                    <input type="url" value={adLinks[ad.id as keyof typeof adLinks]} onChange={(e) => setAdLinks(prev => ({...prev, [ad.id]: e.target.value}))} placeholder="https://link-tujuan.com" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium" />
                    <input type="text" value={adSlots[ad.id as keyof typeof adSlots]} onChange={(e) => setAdSlots(prev => ({...prev, [ad.id]: e.target.value}))} placeholder="ID Slot AdSense (misal: 1234567890)" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium" />
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-2 mt-8 pt-8 border-t border-gray-100">Pengaturan Email (SMTP)</h2>
              <p className="text-sm text-gray-500 mb-4">Pengaturan ini diperlukan agar sistem dapat mengirimkan email tautan "Lupa Kata Sandi".</p>
              
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6">
                <h4 className="font-bold text-blue-800 text-sm mb-2">Panduan Pengaturan Gmail:</h4>
                <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
                  <li>Pastikan akun Google Anda sudah mengaktifkan <strong>Verifikasi 2 Langkah</strong>.</li>
                  <li>Buka pengaturan Akun Google &rarr; Keamanan &rarr; <strong>Sandi Aplikasi (App Passwords)</strong>.</li>
                  <li>Buat sandi aplikasi baru (misal: "Portal Berita").</li>
                  <li>Salin 16 digit huruf yang diberikan Google dan masukkan ke kolom <strong>Sandi Aplikasi</strong> di bawah.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">SMTP Host</label>
                  <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">SMTP Port</label>
                  <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="587" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Alamat Email (SMTP User)</label>
                  <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} autoComplete="off" className="w-full p-4 bg-gray-50 border rounded-xl font-medium" placeholder="emailanda@gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Sandi Aplikasi (SMTP Password)</label>
                  <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} autoComplete="new-password" className="w-full p-4 bg-gray-50 border rounded-xl font-bold" placeholder="••••••••" />
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