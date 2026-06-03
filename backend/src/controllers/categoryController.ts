import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ==========================================
// 1. GET: MENGAMBIL SEMUA KATEGORI
// ==========================================
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' } // Urutkan dari yang paling baru dibuat
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data kategori', error });
  }
};

// ==========================================
// 2. POST: MEMBUAT KATEGORI BARU
// ==========================================
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body; // Frontend cukup mengirimkan 'name' saja

    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Nama kategori tidak boleh kosong!' });
      return;
    }

    // Membuat slug otomatis (misal: "Kabar Daerah" -> "kabar-daerah")
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] }
    });

    if (existingCategory) {
      res.status(400).json({ message: 'Kategori dengan nama atau slug ini sudah ada!' });
      return;
    }

    const newCategory = await prisma.category.create({
      data: { name, slug }
    });

    // Mengembalikan langsung objek datanya agar frontend mudah menangkapnya
    res.status(201).json(newCategory); 
  } catch (error: any) {
    console.error("🔥 [ERROR DB CREATE]:", error.message || error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat membuat kategori', 
      detail: error.message || "Error tidak diketahui"
    });
  }
};

// ==========================================
// 3. PUT: MENGEDIT KATEGORI
// ==========================================
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'ID kategori tidak valid.' });
      return;
    }

    const { name } = req.body;
    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Nama kategori tidak boleh kosong!' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, slug }
    });
    
    res.json(updatedCategory);
  } catch (error: any) {
    console.error("🔥 [ERROR DB UPDATE]:", error.message || error);
    res.status(500).json({ message: 'Gagal memperbarui kategori', detail: error.message });
  }
};

// ==========================================
// 4. DELETE: MENGHAPUS KATEGORI
// ==========================================
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    
    // CEK KEAMANAN: Tolak penghapusan jika kategori masih dipakai oleh berita
    const postsCount = await prisma.post.count({ where: { categoryId: id } });
    if (postsCount > 0) {
       res.status(400).json({ message: 'Ditolak: Kategori ini masih memiliki artikel berita aktif!' });
       return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Kategori berhasil dihapus permanen' });
  } catch (error: any) {
    console.error("🔥 [ERROR DB DELETE]:", error.message || error);
    res.status(500).json({ message: 'Gagal menghapus kategori', detail: error.message });
  }
};