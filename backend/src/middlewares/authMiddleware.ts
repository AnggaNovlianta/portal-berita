import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

// Mengembangkan tipe data Request Express agar bisa menyimpan data 'user'
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Cek apakah ada token di dalam Header jaringan
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format biasanya: "Bearer <token>"

  // Jika tidak ada token sama sekali, tolak!
  if (!token) {
    res.status(401).json({ message: 'Akses ditolak! Token keamanan tidak ditemukan.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error("🔥 [ERROR]: JWT_SECRET tidak terdefinisi pada environment variables.");
    res.status(500).json({ message: 'Terjadi kesalahan konfigurasi server (Internal Error).' });
    return;
  }

  try {
    // 2. Verifikasi apakah token ini asli buatan server kita (menggunakan Secret Key)
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // 3. Jika asli, simpan data di dalamnya (seperti userId) dan izinkan lewat
    req.user = verified;
    next(); 
  } catch (error) {
    // Jika token palsu, diubah hacker, atau sudah expired
    res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Akses ditolak! User tidak teridentifikasi.' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true }
    });
    
    if (user?.role?.name !== 'Admin') {
      res.status(403).json({ message: 'Akses ditolak! Hanya Administrator yang diizinkan.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan sistem saat memverifikasi hak akses.' });
  }
};