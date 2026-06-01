import { Router } from 'express';
import { 
  getPosts, 
  createPost, 
  deletePost, 
  getPostById, 
  updatePost,
  getPostBySlug,
  incrementViews // <-- 1. Tambahkan ini
} from '../controllers/postController';
import { verifyToken } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// ==========================================
// 1. RUTE PUBLIK (Bisa diakses tanpa login)
// ==========================================
router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);
router.patch('/:slug/views', incrementViews); // <-- 2. Rute untuk menambah Views

// ==========================================
// 2. RUTE REDAKSI (Wajib Login & Dukungan Upload Gambar)
// ==========================================
router.post('/', verifyToken, upload.single('thumbnail'), createPost); 
router.put('/:id', verifyToken, upload.single('thumbnail'), updatePost);
router.delete('/:id', verifyToken, deletePost); 

// ==========================================
// 3. RUTE SPESIFIK (Digunakan oleh Dashboard)
// ==========================================
router.get('/:id', getPostById);                

export default router;