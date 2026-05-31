import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// 1. MENGAMBIL SEMUA KATEGORI (Bisa diakses siapa saja)
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

// 2. MEMBUAT KATEGORI BARU (Hanya untuk Admin)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;

    // 1. Validasi: Pastikan data benar-benar terkirim dari Thunder Client
    if (!name || !slug) {
      res.status(400).json({ message: 'Nama dan slug kategori tidak boleh kosong!' });
      return;
    }

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

    res.status(201).json({ message: 'Kategori berhasil ditambahkan!', data: newCategory });
  } catch (error: any) {
    // 2. Tampilkan pesan error warna-warni di Terminal agar kita tahu masalahnya
    console.error("🔥 [ERROR DB]:", error.message || error);
    
    // 3. Kirim error yang sudah terbaca (bukan kosong) ke Thunder Client
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat membuat kategori', 
      detail: error.message || "Error tidak diketahui"
    });
  }
};