import multer from 'multer';

// 1. UBAH KE MEMORY STORAGE
// Menahan file di RAM (buffer) agar bisa dikompres oleh Sharp nanti di Controller
const storage = multer.memoryStorage();

// 2. FILTER KEAMANAN (Dipertahankan dari kode Anda yang sangat baik)
// Blokir file yang bukan gambar untuk mencegah serangan upload file berbahaya
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG/PNG/GIF/WEBP) yang diperbolehkan!'));
  }
};

// 3. EKSPOR MIDDLEWARE
export const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // Batasi ukuran maksimal 2MB
  }
});