"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const path_1 = __importDefault(require("path")); // <-- Import dipindah ke susunan atas (Wajib)
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5050;
// ==========================================
// PENCATATAN LOG ERROR (ERROR LOGGING)
// ==========================================
const logErrorToFile = (error, type) => {
    try {
        const logDir = path_1.default.join(__dirname, '../logs');
        if (!fs_1.default.existsSync(logDir))
            fs_1.default.mkdirSync(logDir, { recursive: true });
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}]\n${error.stack || error.message}\n\n`;
        fs_1.default.appendFileSync(path_1.default.join(logDir, 'error.log'), logMessage);
    }
    catch (err) {
        console.error("Gagal menulis log error ke file:", err);
    }
};
const requiredEnvs = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvs = requiredEnvs.filter((env) => !process.env[env]?.trim());
if (missingEnvs.length > 0) {
    console.error(`[FATAL] Environment variable(s) missing: ${missingEnvs.join(', ')}. Backend tidak dapat dijalankan tanpa env ini.`);
    process.exit(1);
}
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS policy: Origin tidak diperbolehkan.'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
// Buka akses folder uploads ke dunia luar (Menggunakan __dirname jauh lebih stabil)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// DAFTAR RUTE
app.use('/api/auth', authRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
app.use('/api/settings', settingRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// PASANG SATPAM 'verifyToken' DI RUTE INI:
app.post('/api/auth/test', authMiddleware_1.verifyToken, (req, res) => {
    res.json({
        message: "Jalur rahasia berhasil ditembus!",
        userData: req.user
    });
});
// GLOBAL ERROR HANDLER (Khususnya untuk menangani error dari Multer)
app.use((err, req, res, next) => {
    logErrorToFile(err, `EXPRESS_ERROR: ${req.method} ${req.url}`);
    if (err instanceof multer_1.default.MulterError) {
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
process.on('unhandledRejection', (reason) => {
    console.error('🔥 [FATAL] Unhandled Rejection:', reason);
    logErrorToFile(reason instanceof Error ? reason : new Error(String(reason)), 'UNHANDLED_REJECTION');
});
process.on('uncaughtException', (error) => {
    console.error('🔥 [FATAL] Uncaught Exception:', error);
    logErrorToFile(error, 'UNCAUGHT_EXCEPTION');
    // Disarankan mematikan proses agar PM2 / Docker bisa me-restart dengan state bersih
    process.exit(1);
});
const startServer = async () => {
    try {
        await prisma_1.default.role.upsert({
            where: { name: 'Admin' },
            update: {},
            create: { name: 'Admin' },
        });
        console.log('[DATABASE] Role "Admin" sudah siap di MySQL.');
        app.listen(PORT, () => {
            console.log(`[SERVER] Backend berhasil menyala di http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Gagal menyalakan server:", error);
    }
};
startServer();
