import { Request, Response } from 'express';
import prisma from '../utils/prisma'; 
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

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
        include: { category: true },
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
      where: { slug }, include: { category: true } 
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
      where: { id }, include: { category: true } 
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
    // Menangkap status 'published' dari Frontend
    const { title, slug, content, categoryId, published } = req.body;
    let thumbnail = null;
    
    if (req.file) thumbnail = await processAndSaveImage(req.file.buffer);

    const newPost = await prisma.post.create({
      data: { 
        title, 
        slug, 
        content, 
        thumbnail, 
        published: published === 'true', // Mengubah string form menjadi boolean
        categoryId: categoryId ? parseInt(categoryId) : 1
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
    const { title, slug, content, categoryId, published } = req.body;
    
    const updateData: any = { 
      title, 
      slug, 
      content, 
      published: published === 'true', // Mengubah string form menjadi boolean
      categoryId: categoryId ? parseInt(categoryId) : 1 
    };

    if (req.file) {
      const existingPost = await prisma.post.findUnique({ where: { id } });
      updateData.thumbnail = await processAndSaveImage(req.file.buffer);
      if (existingPost?.thumbnail) {
        const oldImagePath = path.join(__dirname, '../..', existingPost.thumbnail);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
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
    const existingPost = await prisma.post.findUnique({ where: { id } });
    
    if (existingPost?.thumbnail) {
      const imagePath = path.join(__dirname, '../..', existingPost.thumbnail);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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