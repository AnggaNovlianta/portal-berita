import { Request, Response } from 'express';
import prisma from '../utils/prisma'; 
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { isNonEmptyString, parseIntSafe } from '../utils/validation';

// ==========================================
// FUNGSI BANTUAN: Mesin Kompresi Gambar ke WebP
// ==========================================
const processAndSaveImage = async (fileBuffer: Buffer): Promise<string> => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `berita-${Date.now()}.webp`;
  const outputPath = path.join(uploadDir, filename);

  await sharp(fileBuffer)
    .resize(800) 
    .webp({ quality: 80 }) 
    .toFile(outputPath);

  return `/uploads/${filename}`;
};

// ----------------------------------------------------
// FUNGSI-FUNGSI BERITA
// ----------------------------------------------------

// 1. GET: Mengambil Semua Berita (DENGAN PAGINASI, PENCARIAN, KATEGORI & SORTIR VIEWS)
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorySlug = req.query.category as string;
    const search = req.query.search as string; 
    const sort = req.query.sort as string; // Menangkap parameter sortir (?sort=views)

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // Pembaca hanya boleh melihat berita yang sudah diterbitkan (bukan draf)
    // Kecuali jika diakses dari dashboard, tapi rute ini khusus untuk publik
    whereCondition.published = true;

    if (categorySlug) whereCondition.category = { slug: categorySlug };
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // KUNCI FITUR TERPOPULER: Jika ada ?sort=views, urutkan berdasarkan views terbanyak
    const orderByCondition: any = sort === 'views' 
      ? { views: 'desc' } 
      : { createdAt: 'desc' };

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        include: { category: true, author: { select: { name: true } } },
        orderBy: orderByCondition, // Menggunakan urutan dinamis
        skip: skip,
        take: limit
      }),
      prisma.post.count({ where: whereCondition })
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
  } catch (error) {
    console.error("🔥 [ERROR DB GET POSTS]:", error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil berita' });
  }
};

// 2. GET: Mengambil 1 Berita Berdasarkan URL/Slug
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string; 
    const post = await prisma.post.findUnique({ 
      where: { slug }, include: { category: true, author: { select: { name: true } } } 
    });
    if (!post) { res.status(404).json({ message: 'Berita tidak ditemukan' }); return; }
    res.json(post); 
  } catch (error) {
    res.status(500).json({ message: 'Kesalahan mengambil detail berita' });
  }
};

// 3. GET: Mengambil 1 Berita Berdasarkan ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const post = await prisma.post.findUnique({ 
      where: { id }, include: { category: true, author: { select: { name: true } } } 
    });
    if (!post) { res.status(404).json({ message: 'Berita tidak ditemukan' }); return; }
    res.json(post); 
  } catch (error) {
    res.status(500).json({ message: 'Kesalahan mengambil detail berita' });
  }
};

// 4. POST: Menerbitkan / Menyimpan Berita Baru
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const roleName = (req as any).user?.roleName;

    const { title, slug, content, categoryId, published } = req.body;
    if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
      res.status(400).json({ message: 'Judul dan konten berita wajib diisi.' });
      return;
    }

    const parsedCategoryId = parseIntSafe(categoryId) ?? 1;
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
    if (roleName === 'Jurnalis') isPublished = false; 

    const postSlug = isNonEmptyString(slug)
      ? slug
      : title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    const newPost = await prisma.post.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Kesalahan saat menyimpan berita' });
  }
};

// 5. PUT: Memperbarui Berita
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const userId = (req as any).user?.userId;
    const roleName = (req as any).user?.roleName;

    const { title, slug, content, categoryId, published } = req.body;
    if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
      res.status(400).json({ message: 'Judul dan konten berita wajib diisi.' });
      return;
    }

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) { res.status(404).json({ message: 'Berita tidak ditemukan' }); return; }

    let isPublished = published === 'true';

    // RBAC: Jurnalis hanya boleh mengedit draf miliknya yang belum terbit
    if (roleName === 'Jurnalis') {
      if (existingPost.authorId !== userId) { res.status(403).json({ message: 'Ditolak: Anda hanya dapat mengedit berita Anda sendiri.' }); return; }
      if (existingPost.published) { res.status(403).json({ message: 'Ditolak: Berita yang sudah terbit tidak dapat diedit oleh Jurnalis.' }); return; }
      isPublished = false; // Memastikan status tetap Draf
    }

    const parsedCategoryId = parseIntSafe(categoryId) ?? 1;
    if (parsedCategoryId <= 0) {
      res.status(400).json({ message: 'Kategori tidak valid.' });
      return;
    }

    const updateData: any = { 
      title, 
      slug: isNonEmptyString(slug)
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
        const oldImagePath = path.join(__dirname, '../..', existingPost.thumbnail);
        if (fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath).catch(() => {}); // Hapus file secara asynchronous
      }
    }

    const updatedPost = await prisma.post.update({ where: { id }, data: updateData });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Kesalahan memperbarui berita' });
  }
};

// 6. DELETE: Menghapus Berita
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const userId = (req as any).user?.userId;
    const roleName = (req as any).user?.roleName;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) { res.status(404).json({ message: 'Berita tidak ditemukan' }); return; }

    // RBAC: Jurnalis hanya boleh menghapus draf miliknya
    if (roleName === 'Jurnalis') {
      if (existingPost.authorId !== userId) { res.status(403).json({ message: 'Ditolak: Anda hanya dapat menghapus berita Anda sendiri.' }); return; }
      if (existingPost.published) { res.status(403).json({ message: 'Ditolak: Berita yang sudah terbit tidak dapat dihapus oleh Jurnalis.' }); return; }
    }
    
    if (existingPost?.thumbnail) {
      const imagePath = path.join(__dirname, '../..', existingPost.thumbnail);
      if (fs.existsSync(imagePath)) await fs.promises.unlink(imagePath).catch(() => {}); // Hapus file secara asynchronous
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Berita dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Kesalahan menghapus berita' });
  }
};

// 7. PATCH: Menambah Jumlah Views (Setiap kali pembaca membuka berita)
export const incrementViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } }
    });
    res.json({ message: 'View ditambahkan' });
  } catch (error) {
    console.error("Gagal menambah view", error);
    res.status(500).json({ message: 'Gagal menambah view' });
  }
};