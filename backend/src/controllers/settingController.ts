import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Fungsi bantuan untuk memproses dan menyimpan gambar dinamis
const processAndSaveImage = async (fileBuffer: Buffer, prefix: string, width: number): Promise<string> => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}.webp`;
  const outputPath = path.join(uploadDir, filename);

  await sharp(fileBuffer)
    .resize({ width }) 
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
    const { 
      site_name, site_motto, 
      company_address, company_phone, company_email, 
      social_facebook, social_twitter, social_instagram, social_youtube,
      ad_leaderboard_link, ad_sidebar_link, ad_article_top_link, ad_article_bottom_link,
      ad_leaderboard_slot, ad_sidebar_slot, ad_article_top_slot, ad_article_bottom_slot,
      smtp_host, smtp_port, smtp_user, smtp_pass, editorial_board 
    } = req.body;

    const settingsToUpdate = [
      { key: 'site_name', value: site_name },
      { key: 'site_motto', value: site_motto },
      { key: 'company_address', value: company_address },
      { key: 'company_phone', value: company_phone },
      { key: 'company_email', value: company_email },
      { key: 'social_facebook', value: social_facebook },
      { key: 'social_twitter', value: social_twitter },
      { key: 'social_instagram', value: social_instagram },
      { key: 'social_youtube', value: social_youtube },
      { key: 'ad_leaderboard_link', value: ad_leaderboard_link },
      { key: 'ad_sidebar_link', value: ad_sidebar_link },
      { key: 'ad_article_top_link', value: ad_article_top_link },
      { key: 'ad_article_bottom_link', value: ad_article_bottom_link },
      { key: 'ad_leaderboard_slot', value: ad_leaderboard_slot },
      { key: 'ad_sidebar_slot', value: ad_sidebar_slot },
      { key: 'ad_article_top_slot', value: ad_article_top_slot },
      { key: 'ad_article_bottom_slot', value: ad_article_bottom_slot },
      { key: 'smtp_host', value: smtp_host },
      { key: 'smtp_port', value: smtp_port },
      { key: 'smtp_user', value: smtp_user },
      { key: 'smtp_pass', value: smtp_pass },
    ];

    for (const setting of settingsToUpdate) {
      if (setting.value !== undefined) {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        });
      }
    }

    const files = req.files as Express.Multer.File[];
    let siteLogoPath: string | undefined;
    const boardPhotoPaths: Record<string, string> = {};

    // Deteksi apakah file tersebut adalah Logo Web atau Wajah Redaksi
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file.fieldname === 'site_logo') {
          siteLogoPath = await processAndSaveImage(file.buffer, 'logo', 200);
        } else if (file.fieldname.startsWith('board_photo_')) {
          const id = file.fieldname.split('_')[2];
          boardPhotoPaths[id] = await processAndSaveImage(file.buffer, 'board', 400);
        } else if (file.fieldname.startsWith('ad_')) {
          const adPath = await processAndSaveImage(file.buffer, file.fieldname, 800);
          await prisma.setting.upsert({
            where: { key: file.fieldname },
            update: { value: adPath },
            create: { key: file.fieldname, value: adPath },
          });
        }
      }
    }

    if (siteLogoPath) {
      await prisma.setting.upsert({
        where: { key: 'site_logo' },
        update: { value: siteLogoPath },
        create: { key: 'site_logo', value: siteLogoPath },
      });
    }

    // Menggabungkan data teks redaksi dengan tautan gambar yang baru disimpan
    if (editorial_board) {
      let parsedBoard = JSON.parse(editorial_board);
      parsedBoard = parsedBoard.map((member: { id: string; photo?: string; [key: string]: unknown }) => {
        if (boardPhotoPaths[member.id]) member.photo = boardPhotoPaths[member.id];
        return member;
      });
      await prisma.setting.upsert({
        where: { key: 'editorial_board' },
        update: { value: JSON.stringify(parsedBoard) },
        create: { key: 'editorial_board', value: JSON.stringify(parsedBoard) },
      });
    }

    res.json({ message: 'Pengaturan berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui pengaturan.' });
  }
};