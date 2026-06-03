"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// 1. UBAH KE MEMORY STORAGE
// Menahan file di RAM (buffer) agar bisa dikompres oleh Sharp nanti di Controller
const storage = multer_1.default.memoryStorage();
// 2. FILTER KEAMANAN (Dipertahankan dari kode Anda yang sangat baik)
// Blokir file yang bukan gambar untuk mencegah serangan upload file berbahaya
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Hanya file gambar (JPG/PNG/GIF/WEBP) yang diperbolehkan!'));
    }
};
// 3. EKSPOR MIDDLEWARE
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Batasi ukuran maksimal 2MB
    }
});
