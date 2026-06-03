"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// ==========================================
// 1. GET: MENGAMBIL SEMUA KATEGORI
// ==========================================
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            orderBy: { createdAt: 'desc' } // Urutkan dari yang paling baru dibuat
        });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data kategori', error });
    }
};
exports.getCategories = getCategories;
// ==========================================
// 2. POST: MEMBUAT KATEGORI BARU
// ==========================================
const createCategory = async (req, res) => {
    try {
        const { name } = req.body; // Frontend cukup mengirimkan 'name' saja
        if (!name) {
            res.status(400).json({ message: 'Nama kategori tidak boleh kosong!' });
            return;
        }
        // Membuat slug otomatis (misal: "Kabar Daerah" -> "kabar-daerah")
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
        const existingCategory = await prisma_1.default.category.findFirst({
            where: { OR: [{ name }, { slug }] }
        });
        if (existingCategory) {
            res.status(400).json({ message: 'Kategori dengan nama atau slug ini sudah ada!' });
            return;
        }
        const newCategory = await prisma_1.default.category.create({
            data: { name, slug }
        });
        // Mengembalikan langsung objek datanya agar frontend mudah menangkapnya
        res.status(201).json(newCategory);
    }
    catch (error) {
        console.error("🔥 [ERROR DB CREATE]:", error.message || error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat membuat kategori',
            detail: error.message || "Error tidak diketahui"
        });
    }
};
exports.createCategory = createCategory;
// ==========================================
// 3. PUT: MENGEDIT KATEGORI
// ==========================================
const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Nama kategori tidak boleh kosong!' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
        const updatedCategory = await prisma_1.default.category.update({
            where: { id },
            data: { name, slug }
        });
        res.json(updatedCategory);
    }
    catch (error) {
        console.error("🔥 [ERROR DB UPDATE]:", error.message || error);
        res.status(500).json({ message: 'Gagal memperbarui kategori', detail: error.message });
    }
};
exports.updateCategory = updateCategory;
// ==========================================
// 4. DELETE: MENGHAPUS KATEGORI
// ==========================================
const deleteCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // CEK KEAMANAN: Tolak penghapusan jika kategori masih dipakai oleh berita
        const postsCount = await prisma_1.default.post.count({ where: { categoryId: id } });
        if (postsCount > 0) {
            res.status(400).json({ message: 'Ditolak: Kategori ini masih memiliki artikel berita aktif!' });
            return;
        }
        await prisma_1.default.category.delete({ where: { id } });
        res.json({ message: 'Kategori berhasil dihapus permanen' });
    }
    catch (error) {
        console.error("🔥 [ERROR DB DELETE]:", error.message || error);
        res.status(500).json({ message: 'Gagal menghapus kategori', detail: error.message });
    }
};
exports.deleteCategory = deleteCategory;
