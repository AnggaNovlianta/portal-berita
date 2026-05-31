import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// 1. Siapkan mesin Adapter PostgreSQL
const adapter = new PrismaPg({
  connectionString: "postgresql://postgres:adminsupersu@localhost:5432/portal_berita?schema=public"
});

// 2. Suntikkan Adapter ke dalam Prisma
const prisma = new PrismaClient({ adapter });

// ==========================================
// FUNGSI BANTUAN: Mesin Kompresi Gambar ke WebP
// ==========================================
const processAndSaveImage = async (fileBuffer: Buffer): Promise<string> => {
  // Lokasi folder uploads (mundur 2 level: src/controllers -> src -> root)
  const uploadDir = path.join(__dirname, '../../uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `berita-${Date.now()}.webp`;
  const outputPath = path.join(uploadDir, filename);

  // Proses kompresi
  await sharp(fileBuffer)
    .resize(800) // Ukuran lebar ideal untuk artikel berita
    .webp({ quality: 80 }) // Kualitas 80% agar ringan dan tetap tajam
    .toFile(outputPath);

  return `/uploads/${filename}`;
};

// ----------------------------------------------------
// FUNGSI-FUNGSI BERITA
// ----------------------------------------------------

// GET: Mengambil Semua Berita (Untuk Halaman Beranda/Home)
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorySlug = req.query.category as string;
    const posts = await prisma.post.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : {}, 
      include: { category: true }, // Menampilkan data kategori
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET: Mengambil 1 Berita Berdasarkan URL/Slug (Untuk Halaman Baca/SEO)
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string; 
    const post = await prisma.post.findUnique({ 
      where: { slug },
      include: { category: true } // Menampilkan data kategori
    });
    
    if (!post) { 
      res.status(404).json({ message: 'Berita tidak ditemukan' }); 
      return; 
    }
    
    res.json(post); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil detail berita' });
  }
};

// GET: Mengambil 1 Berita Berdasarkan ID (Untuk Dashboard Redaksi)
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const post = await prisma.post.findUnique({ 
      where: { id },
      include: { category: true } 
    });
    
    if (!post) { 
      res.status(404).json({ message: 'Berita tidak ditemukan' }); 
      return; 
    }
    
    res.json(post); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil detail berita' });
  }
};

// POST: Menerbitkan Berita Baru
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, categoryId } = req.body;
    
    // Gunakan sharp jika ada file yang diunggah
    let thumbnail = null;
    if (req.file) {
      thumbnail = await processAndSaveImage(req.file.buffer);
    }

    const newPost = await prisma.post.create({
      data: { 
        title, 
        slug, 
        content, 
        categoryId: categoryId ? parseInt(categoryId) : 1, 
        thumbnail, 
        published: true 
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan berita' });
  }
};

// PUT: Memperbarui Berita
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const { title, slug, content, categoryId } = req.body;
    
    const updateData: any = { 
      title, 
      slug, 
      content, 
      categoryId: categoryId ? parseInt(categoryId) : 1 
    };

    // Jika redaktur mengunggah gambar BARU
    if (req.file) {
      // 1. Cari data gambar lama di database
      const existingPost = await prisma.post.findUnique({ where: { id } });
      
      // 2. Buat gambar WebP yang baru
      updateData.thumbnail = await processAndSaveImage(req.file.buffer);
      
      // 3. Hapus gambar lama dari folder server agar harddisk tetap lega
      if (existingPost?.thumbnail) {
        const oldImagePath = path.join(__dirname, '../..', existingPost.thumbnail);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }

    const updatedPost = await prisma.post.update({ where: { id }, data: updateData });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui berita' });
  }
};

// DELETE: Menghapus Berita
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    
    // Hapus file gambar dari server sebelum menghapus data di database
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (existingPost?.thumbnail) {
      const imagePath = path.join(__dirname, '../..', existingPost.thumbnail);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus berita' });
  }
};