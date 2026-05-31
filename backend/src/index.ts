import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import path from 'path'; // <-- Import dipindah ke susunan atas (Wajib)

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes'; 
import postRoutes from './routes/postRoutes'; 
import prisma from './utils/prisma'; 
import { verifyToken, AuthRequest } from './middlewares/authMiddleware'; 

const app = express();
const PORT = 5050;

app.use(cors()); 
app.use(express.json()); 

// Buka akses folder uploads ke dunia luar (Menggunakan __dirname jauh lebih stabil)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// DAFTAR RUTE
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/posts', postRoutes); 

// PASANG SATPAM 'verifyToken' DI RUTE INI:
app.post('/api/auth/test', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({ 
    message: "Jalur rahasia berhasil ditembus!", 
    userData: req.user 
  });
});

const startServer = async () => {
  try {
    await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    });
    console.log('[DATABASE] Role "Admin" sudah siap di PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`[SERVER] Backend berhasil menyala di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Gagal menyalakan server:", error);
  }
};

startServer();