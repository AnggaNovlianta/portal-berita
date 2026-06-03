"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = (0, express_1.Router)();
// ==========================================
// 1. RUTE PUBLIK (Bisa diakses tanpa login)
// ==========================================
router.get('/', postController_1.getPosts);
router.get('/slug/:slug', postController_1.getPostBySlug);
router.patch('/:slug/views', postController_1.incrementViews); // <-- 2. Rute untuk menambah Views
// ==========================================
// 2. RUTE REDAKSI (Wajib Login & Dukungan Upload Gambar)
// ==========================================
router.post('/', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.single('thumbnail'), postController_1.createPost);
router.put('/:id', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.single('thumbnail'), postController_1.updatePost);
router.delete('/:id', authMiddleware_1.verifyToken, postController_1.deletePost);
// ==========================================
// 3. RUTE SPESIFIK (Digunakan oleh Dashboard)
// ==========================================
router.get('/:id', postController_1.getPostById);
exports.default = router;
