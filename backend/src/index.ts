import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import path from 'path'; // <-- Import dipindah ke susunan atas (Wajib)
import multer from 'multer';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes'; 
import postRoutes from './routes/postRoutes'; 
import prisma from './utils/prisma'; 
import { verifyToken, AuthRequest } from './middlewares/authMiddleware'; 
import settingRoutes from './routes/settingRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 5050;

// ==========================================
// PENCATATAN LOG ERROR (ERROR LOGGING)
// ==========================================
const logErrorToFile = (error: Error, type: string) => {
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}]\n${error.stack || error.message}\n\n`;
    
    fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
  } catch (err) {
    console.error("Gagal menulis log error ke file:", err);
  }
};

const requiredEnvs = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvs = requiredEnvs.filter((env) => !process.env[env]?.trim());
if (missingEnvs.length > 0) {
  console.error(`[FATAL] Environment variable(s) missing: ${missingEnvs.join(', ')}. Backend tidak dapat dijalankan tanpa env ini.`);
  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin tidak diperbolehkan.'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Buka akses folder uploads ke dunia luar (Menggunakan __dirname jauh lebih stabil)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// DAFTAR RUTE
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/users', userRoutes);

// PASANG SATPAM 'verifyToken' DI RUTE INI:
app.post('/api/auth/test', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({ 
    message: "Jalur rahasia berhasil ditembus!", 
    userData: req.user 
  });
});

// GLOBAL ERROR HANDLER (Khususnya untuk menangani error dari Multer)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logErrorToFile(err, `EXPRESS_ERROR: ${req.method} ${req.url}`);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ message: 'Ukuran gambar terlalu besar! Maksimal 2MB.' });
      return;
    }
    res.status(400).json({ message: `Gagal mengunggah gambar: ${err.message}` });
    return;
  }
  res.status(500).json({ message: err.message || 'Terjadi kesalahan internal server.' });
});

// ==========================================
// PENANGANAN CRASH APLIKASI (FATAL ERRORS)
// ==========================================
process.on('unhandledRejection', (reason: any) => {
  console.error('🔥 [FATAL] Unhandled Rejection:', reason);
  logErrorToFile(reason instanceof Error ? reason : new Error(String(reason)), 'UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error: Error) => {
  console.error('🔥 [FATAL] Uncaught Exception:', error);
  logErrorToFile(error, 'UNCAUGHT_EXCEPTION');
  // Disarankan mematikan proses agar PM2 / Docker bisa me-restart dengan state bersih
  process.exit(1); 
});

const startServer = async () => {
  try {
    await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    });
    console.log('[DATABASE] Role "Admin" sudah siap di MySQL.');

    app.listen(PORT, () => {
      console.log(`[SERVER] Backend berhasil menyala di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Gagal menyalakan server:", error);
  }
};

startServer();