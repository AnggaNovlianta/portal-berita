import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

// RUTE PUBLIK: Pembaca biasa boleh melihat daftar kategori tanpa perlu login
router.get('/', getCategories);

// RUTE PRIVAT: Dijaga oleh 'verifyToken', hanya Redaktur yang bisa mengelola kategori
router.post('/', verifyToken, createCategory);
router.put('/:id', verifyToken, updateCategory);
router.delete('/:id', verifyToken, deleteCategory);

export default router;