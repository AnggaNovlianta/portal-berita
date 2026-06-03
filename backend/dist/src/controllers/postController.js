"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementViews = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getPostBySlug = exports.getPosts = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const validation_1 = require("../utils/validation");
// ==========================================
// FUNGSI BANTUAN: Mesin Kompresi Gambar ke WebP
// ==========================================
const processAndSaveImage = async (fileBuffer) => {
    const uploadDir = path_1.default.join(__dirname, '../../uploads');
    if (!fs_1.default.existsSync(uploadDir))
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    const filename = `berita-${Date.now()}.webp`;
    const outputPath = path_1.default.join(uploadDir, filename);
    await (0, sharp_1.default)(fileBuffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(outputPath);
    return `/uploads/${filename}`;
};
// ----------------------------------------------------
// FUNGSI-FUNGSI BERITA
// ----------------------------------------------------
// 1. GET: Mengambil Semua Berita (DENGAN PAGINASI, PENCARIAN, KATEGORI & SORTIR VIEWS)
const getPosts = async (req, res) => {
    try {
        const categorySlug = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort; // Menangkap parameter sortir (?sort=views)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let whereCondition = {};
        // Pembaca hanya boleh melihat berita yang sudah diterbitkan (bukan draf)
        // Kecuali jika diakses dari dashboard, tapi rute ini khusus untuk publik
        whereCondition.published = true;
        if (categorySlug)
            whereCondition.category = { slug: categorySlug };
        if (search) {
            whereCondition.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }
        // KUNCI FITUR TERPOPULER: Jika ada ?sort=views, urutkan berdasarkan views terbanyak
        const orderByCondition = sort === 'views'
            ? { views: 'desc' }
            : { createdAt: 'desc' };
        const [posts, totalPosts] = await Promise.all([
            prisma_1.default.post.findMany({
                where: whereCondition,
                include: { category: true, author: { select: { name: true } } },
                orderBy: orderByCondition, // Menggunakan urutan dinamis
                skip: skip,
                take: limit
            }),
            prisma_1.default.post.count({ where: whereCondition })
        ]);
        res.json({
            data: posts,
            meta: {
                total: totalPosts,
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalPosts / limit)
            }
        });
    }
    catch (error) {
        console.error("🔥 [ERROR DB GET POSTS]:", error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil berita' });
    }
};
exports.getPosts = getPosts;
// 2. GET: Mengambil 1 Berita Berdasarkan URL/Slug
const getPostBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const post = await prisma_1.default.post.findUnique({
            where: { slug }, include: { category: true, author: { select: { name: true } } }
        });
        if (!post) {
            res.status(404).json({ message: 'Berita tidak ditemukan' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ message: 'Kesalahan mengambil detail berita' });
    }
};
exports.getPostBySlug = getPostBySlug;
// 3. GET: Mengambil 1 Berita Berdasarkan ID
const getPostById = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await prisma_1.default.post.findUnique({
            where: { id }, include: { category: true, author: { select: { name: true } } }
        });
        if (!post) {
            res.status(404).json({ message: 'Berita tidak ditemukan' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ message: 'Kesalahan mengambil detail berita' });
    }
};
exports.getPostById = getPostById;
// 4. POST: Menerbitkan / Menyimpan Berita Baru
const createPost = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const roleName = req.user?.roleName;
        const { title, slug, content, categoryId, published } = req.body;
        if (!(0, validation_1.isNonEmptyString)(title) || !(0, validation_1.isNonEmptyString)(content)) {
            res.status(400).json({ message: 'Judul dan konten berita wajib diisi.' });
            return;
        }
        const parsedCategoryId = (0, validation_1.parseIntSafe)(categoryId) ?? 1;
        if (parsedCategoryId <= 0) {
            res.status(400).json({ message: 'Kategori tidak valid.' });
            return;
        }
        let thumbnail = null;
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                res.status(400).json({ message: 'File thumbnail harus berupa gambar.' });
                return;
            }
            if (req.file.size > 2 * 1024 * 1024) { // Maksimal 2MB
                res.status(400).json({ message: 'Ukuran file thumbnail maksimal 2MB.' });
                return;
            }
            thumbnail = await processAndSaveImage(req.file.buffer);
        }
        let isPublished = published === 'true';
        // RBAC: Jurnalis hanya bisa Draf, Redaktur/Admin bebas
        if (roleName === 'Jurnalis')
            isPublished = false;
        const postSlug = (0, validation_1.isNonEmptyString)(slug)
            ? slug
            : title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
        const newPost = await prisma_1.default.post.create({
            data: {
                title,
                slug: postSlug,
                content,
                thumbnail,
                published: isPublished,
                categoryId: parsedCategoryId,
                authorId: userId // Mengambil ID otomatis dari Token Login (Sangat Aman)
            }
        });
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ message: 'Kesalahan saat menyimpan berita' });
    }
};
exports.createPost = createPost;
// 5. PUT: Memperbarui Berita
const updatePost = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        const roleName = req.user?.roleName;
        const { title, slug, content, categoryId, published } = req.body;
        if (!(0, validation_1.isNonEmptyString)(title) || !(0, validation_1.isNonEmptyString)(content)) {
            res.status(400).json({ message: 'Judul dan konten berita wajib diisi.' });
            return;
        }
        const existingPost = await prisma_1.default.post.findUnique({ where: { id } });
        if (!existingPost) {
            res.status(404).json({ message: 'Berita tidak ditemukan' });
            return;
        }
        let isPublished = published === 'true';
        // RBAC: Jurnalis hanya boleh mengedit draf miliknya yang belum terbit
        if (roleName === 'Jurnalis') {
            if (existingPost.authorId !== userId) {
                res.status(403).json({ message: 'Ditolak: Anda hanya dapat mengedit berita Anda sendiri.' });
                return;
            }
            if (existingPost.published) {
                res.status(403).json({ message: 'Ditolak: Berita yang sudah terbit tidak dapat diedit oleh Jurnalis.' });
                return;
            }
            isPublished = false; // Memastikan status tetap Draf
        }
        const parsedCategoryId = (0, validation_1.parseIntSafe)(categoryId) ?? 1;
        if (parsedCategoryId <= 0) {
            res.status(400).json({ message: 'Kategori tidak valid.' });
            return;
        }
        const updateData = {
            title,
            slug: (0, validation_1.isNonEmptyString)(slug)
                ? slug
                : title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim(),
            content,
            published: isPublished,
            categoryId: parsedCategoryId
        };
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                res.status(400).json({ message: 'File thumbnail harus berupa gambar.' });
                return;
            }
            if (req.file.size > 2 * 1024 * 1024) { // Maksimal 2MB
                res.status(400).json({ message: 'Ukuran file thumbnail maksimal 2MB.' });
                return;
            }
            updateData.thumbnail = await processAndSaveImage(req.file.buffer);
            if (existingPost?.thumbnail) {
                const oldImagePath = path_1.default.join(__dirname, '../..', existingPost.thumbnail);
                if (fs_1.default.existsSync(oldImagePath))
                    await fs_1.default.promises.unlink(oldImagePath).catch(() => { }); // Hapus file secara asynchronous
            }
        }
        const updatedPost = await prisma_1.default.post.update({ where: { id }, data: updateData });
        res.json(updatedPost);
    }
    catch (error) {
        res.status(500).json({ message: 'Kesalahan memperbarui berita' });
    }
};
exports.updatePost = updatePost;
// 6. DELETE: Menghapus Berita
const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        const roleName = req.user?.roleName;
        const existingPost = await prisma_1.default.post.findUnique({ where: { id } });
        if (!existingPost) {
            res.status(404).json({ message: 'Berita tidak ditemukan' });
            return;
        }
        // RBAC: Jurnalis hanya boleh menghapus draf miliknya
        if (roleName === 'Jurnalis') {
            if (existingPost.authorId !== userId) {
                res.status(403).json({ message: 'Ditolak: Anda hanya dapat menghapus berita Anda sendiri.' });
                return;
            }
            if (existingPost.published) {
                res.status(403).json({ message: 'Ditolak: Berita yang sudah terbit tidak dapat dihapus oleh Jurnalis.' });
                return;
            }
        }
        if (existingPost?.thumbnail) {
            const imagePath = path_1.default.join(__dirname, '../..', existingPost.thumbnail);
            if (fs_1.default.existsSync(imagePath))
                await fs_1.default.promises.unlink(imagePath).catch(() => { }); // Hapus file secara asynchronous
        }
        await prisma_1.default.post.delete({ where: { id } });
        res.json({ message: 'Berita dihapus' });
    }
    catch (error) {
        res.status(500).json({ message: 'Kesalahan menghapus berita' });
    }
};
exports.deletePost = deletePost;
// 7. PATCH: Menambah Jumlah Views (Setiap kali pembaca membuka berita)
const incrementViews = async (req, res) => {
    try {
        const slug = req.params.slug;
        await prisma_1.default.post.update({
            where: { slug },
            data: { views: { increment: 1 } }
        });
        res.json({ message: 'View ditambahkan' });
    }
    catch (error) {
        console.error("Gagal menambah view", error);
        res.status(500).json({ message: 'Gagal menambah view' });
    }
};
exports.incrementViews = incrementViews;
