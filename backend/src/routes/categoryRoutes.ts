import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// RUTE PUBLIK: Pembaca biasa boleh melihat daftar kategori tanpa perlu login
router.get('/', getCategories);

// RUTE ADMIN: Hanya Admin yang bisa mengelola kategori
router.post('/', verifyToken, isAdmin, createCategory);
router.put('/:id', verifyToken, isAdmin, updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

export default router;