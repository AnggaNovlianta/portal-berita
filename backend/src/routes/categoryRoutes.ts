import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

// RUTE PUBLIK: Pembaca biasa boleh melihat daftar kategori tanpa perlu login
router.get('/', getCategories);

// RUTE PRIVAT: Dijaga oleh 'verifyToken', hanya Admin yang bisa membuat kategori
router.post('/', verifyToken, createCategory);

export default router;