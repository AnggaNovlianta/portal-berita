import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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