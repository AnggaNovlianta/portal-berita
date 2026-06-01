import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Fungsi bantuan untuk memproses dan menyimpan gambar logo
const processAndSaveLogo = async (fileBuffer: Buffer): Promise<string> => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `logo-${Date.now()}.webp`;
  const outputPath = path.join(uploadDir, filename);

  await sharp(fileBuffer)
    .resize({ width: 200 }) // Ubah ukuran logo agar tidak terlalu besar
    .webp({ quality: 90 })
    .toFile(outputPath);

  return `/uploads/${filename}`;
};

// 1. GET: Mengambil semua pengaturan
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as { [key: string]: string });
    res.json(settingsObject);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil pengaturan' });
  }
};

// 2. POST: Memperbarui pengaturan
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { site_name } = req.body;

    if (site_name) {
      await prisma.setting.upsert({
        where: { key: 'site_name' },
        update: { value: site_name },
        create: { key: 'site_name', value: site_name },
      });
    }

    if (req.file) {
      const newLogoPath = await processAndSaveLogo(req.file.buffer);
      await prisma.setting.upsert({
        where: { key: 'site_logo' },
        update: { value: newLogoPath },
        create: { key: 'site_logo', value: newLogoPath },
      });
    }

    res.json({ message: 'Pengaturan berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui pengaturan.' });
  }
};