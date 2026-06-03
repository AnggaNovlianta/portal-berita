import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Upload, X, Layers, Save, Send } from 'lucide-react'; // Menambahkan ikon Save dan Send untuk tombol Draf & Terbitkan
import api from './api';

interface Category {
  id: number | string;
  name: string;
}

interface NewsFormProps {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    categoryId: string | number;
    thumbnail?: string;
  };
  userRole: string;
  onSubmit: (formData: FormData) => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ initialData, userRole, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    categoryId: initialData?.categoryId?.toString() || '',
  });

  const [preview, setPreview] = useState<string | null>(initialData?.thumbnail || null);
  const [file, setFile] = useState<File | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);

  // Mengambil daftar kategori dari backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const data = response.data;
        setCategories(data);
        
        if (!initialData?.categoryId && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id.toString() }));
        }
      } catch (error) {
        console.error('Gagal memuat kategori:', error);
      }
    };
    fetchCategories();
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      // Validasi ukuran maksimal 2MB (2 * 1024 * 1024 bytes)
      if (selected.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 2MB.');
        e.target.value = ''; // Reset input file
        return;
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Konfigurasi Toolbar Multimedia untuk Editor
  const quillModules = React.useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'], // Fitur multimedia: gambar dan video
      ['clean']
    ],
  }), []);

  // =========================================
  // FUNGSI SUBMIT DENGAN STATUS DRAF/PUBLIK
  // =========================================
  const handleSubmitAction = (isPublished: boolean) => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert('Judul, isi, dan kategori wajib diisi!');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug);
    data.append('content', formData.content);
    data.append('categoryId', formData.categoryId);
    
    // MENGIRIM STATUS: true (Tayang Publik) atau false (Draf)
    data.append('published', String(isPublished)); 
    
    if (file) data.append('thumbnail', file);
    
    onSubmit(data);
  };

  // Mencegah submit default dari form (karena kita pakai tombol custom)
  const preventEnterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={preventEnterSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
      <h2 className="text-xl font-black text-slate-800 border-b border-gray-100 pb-4">
        {initialData ? '📝 Mode Edit Berita' : '✍️ Terbitkan Berita Baru'}
      </h2>

      {/* Thumbnail Upload */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Thumbnail Utama</label>
        <div className="relative w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group hover:bg-gray-100 transition-all">
          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover" alt="preview" />
              <button 
                type="button" 
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                title="Hapus Gambar"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
              <Upload size={32} />
              <span className="mt-2 text-xs font-bold">Upload Gambar</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </div>

      {/* Grid untuk Judul dan Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Input Judul (Lebar 2/3) */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Judul Artikel</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({
              ...formData, 
              title: e.target.value, 
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
            })}
            className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium transition-all"
            placeholder="Tulis judul yang menarik..." 
            required
          />
        </div>

        {/* Dropdown Kategori (Lebar 1/3) */}
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kategori</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Layers size={18} />
            </div>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none font-medium text-slate-700 cursor-pointer transition-all"
              required
            >
              <option value="" disabled>Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor Konten */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Konten Berita</label>
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[450px] [&_.ql-editor]:text-slate-700 [&_.ql-editor]:text-lg [&_.ql-editor]:leading-relaxed">
          <ReactQuill 
            theme="snow" 
            modules={quillModules}
            value={formData.content} 
            onChange={(val: string) => setFormData({...formData, content: val})} 
            placeholder="Ketik isi berita di sini..."
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* DUA TOMBOL AKSI: SIMPAN DRAF & TERBITKAN */}
      {/* ========================================= */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
        
        {/* Tombol Simpan Draf (false) */}
        <button 
          type="button" 
          onClick={() => handleSubmitAction(false)}
          className="flex-1 py-4 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-2xl transition-all border border-amber-100"
        >
          <Save size={18} /> Simpan sbg Draf
        </button>
        
        {/* Tombol Terbitkan (true) */}
        {userRole !== 'Jurnalis' && (
          <button 
            type="button" 
            onClick={() => handleSubmitAction(true)}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-white font-black rounded-2xl transition-all shadow-lg ${
              initialData ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            <Send size={18} /> {initialData ? 'Perbarui Publikasi' : 'Terbitkan Sekarang'}
          </button>
        )}

      </div>
    </form>
  );
};

export default NewsForm;