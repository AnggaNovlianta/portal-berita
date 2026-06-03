"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// RUTE PUBLIK: Pembaca biasa boleh melihat daftar kategori tanpa perlu login
router.get('/', categoryController_1.getCategories);
// RUTE ADMIN: Hanya Admin yang bisa mengelola kategori
router.post('/', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, categoryController_1.createCategory);
router.put('/:id', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, categoryController_1.updateCategory);
router.delete('/:id', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, categoryController_1.deleteCategory);
exports.default = router;
