"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const verifyToken = (req, res, next) => {
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
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3. Jika asli, simpan data di dalamnya (seperti userId) dan izinkan lewat
        req.user = verified;
        next();
    }
    catch (error) {
        // Jika token palsu, diubah hacker, atau sudah expired
        res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            res.status(401).json({ message: 'Akses ditolak! User tidak teridentifikasi.' });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            include: { role: true }
        });
        if (user?.role?.name !== 'Admin') {
            res.status(403).json({ message: 'Akses ditolak! Hanya Administrator yang diizinkan.' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan sistem saat memverifikasi hak akses.' });
    }
};
exports.isAdmin = isAdmin;
