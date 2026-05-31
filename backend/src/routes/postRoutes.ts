import { Router } from 'express';
import { 
  getPosts, 
  createPost, 
  deletePost, 
  getPostById, 
  updatePost,
  getPostBySlug 
} from '../controllers/postController';
import { verifyToken } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// ==========================================
// 1. RUTE PUBLIK (Bisa diakses tanpa login)
// ==========================================

// Mengambil semua berita (digunakan di halaman Beranda)
router.get('/', getPosts);

// Mengambil 1 berita berdasarkan URL SEO (digunakan di halaman Baca Berita)
// PERHATIAN: Rute ini WAJIB berada di atas rute '/:id' 
router.get('/slug/:slug', getPostBySlug);


// ==========================================
// 2. RUTE REDAKSI (Wajib Login & Dukungan Upload Gambar)
// ==========================================

// Menerbitkan berita baru
router.post('/', verifyToken, upload.single('thumbnail'), createPost); 

// Mengedit berita yang sudah ada
router.put('/:id', verifyToken, upload.single('thumbnail'), updatePost);

// Menghapus berita secara permanen
router.delete('/:id', verifyToken, deletePost); 


// ==========================================
// 3. RUTE SPESIFIK (Digunakan oleh Dashboard)
// ==========================================

// Mengambil 1 berita berdasarkan ID (digunakan untuk memuat data di form Edit)
router.get('/:id', getPostById);                

export default router;