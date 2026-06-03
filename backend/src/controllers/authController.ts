import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { isValidEmail, isMinLength, isNonEmptyString } from '../utils/validation';

// 1. FUNGSI REGISTRASI (Mendaftar Akun)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, roleName = 'Jurnalis' } = req.body;

    if (!isNonEmptyString(name) || !isValidEmail(email) || !isMinLength(password, 6)) {
      res.status(400).json({ message: 'Nama, email valid, dan password minimal 6 karakter wajib diisi.' });
      return;
    }

    if (roleName === 'Admin') {
      res.status(403).json({ message: 'Tidak diizinkan mendaftar sebagai Admin!' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email sudah terdaftar!' });
      return;
    }

    // Pastikan Role ada di database
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    // Acak (hash) password agar tidak bisa dibaca di database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Simpan data ke PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: role.id,
        isApproved: false // Pendaftar mandiri butuh persetujuan
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};

// 3. FUNGSI LUPA KATA SANDI (Request Pemulihan)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const genericMessage = 'Jika email tersebut terdaftar, Anda akan menerima tautan pemulihan dalam beberapa menit.';

    if (!isValidEmail(email)) {
      res.status(200).json({ message: genericMessage });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(200).json({ message: genericMessage });
      return;
    }

    // Buat token acak (hex) sepanjang 32 bytes
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Kedaluwarsa dalam 1 jam

    await prisma.user.update({
      where: { email },

      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Ambil pengaturan SMTP dan nama website dari database
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'site_name'] } }
    });
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const smtpHost = settingsMap['smtp_host'] || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(settingsMap['smtp_port'] || process.env.SMTP_PORT || '587');
    const smtpUser = settingsMap['smtp_user'] || process.env.SMTP_USER;
    const smtpPass = settingsMap['smtp_pass'] || process.env.SMTP_PASS;
    const siteName = settingsMap['site_name'] || 'Pustaka Publik';

    // Konfigurasi Email
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const mailOptions = {
      from: `"${siteName}" <${smtpUser || 'noreply@pustakapublik.com'}>`,
      to: user.email,
      subject: `Pemulihan Kata Sandi - ${siteName}`,
      html: `<p>Anda (atau seseorang) meminta pengaturan ulang kata sandi.</p>
             <p>Silakan klik tautan di bawah ini untuk mereset kata sandi Anda:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>`
    };

    // JALUR CADANGAN: Jika SMTP belum dikonfigurasi di DB/env, tampilkan link di console backend
    if (!smtpUser || !smtpPass) {
      console.log('\n[MOCK EMAIL PEMULIHAN] Klik tautan ini:', resetUrl, '\n');
      res.json({ message: 'Tautan pemulihan terkirim! (Cek console terminal backend karena SMTP belum dikonfigurasi)' });
      return;
    }

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Tautan pemulihan telah dikirim ke email Anda!' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses permintaan pemulihan.' });
  }
};

// 4. FUNGSI RESET KATA SANDI (Menggunakan Token)
export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!isNonEmptyString(token) || !isMinLength(newPassword, 6)) {
      res.status(400).json({ message: 'Token dan kata sandi baru minimal 6 karakter wajib diisi.' });
      return;
    }

    const user = await prisma.user.findFirst({ where: { resetPasswordToken: token, resetPasswordExpires: { gte: new Date() } } });
    if (!user) { res.status(400).json({ message: 'Token pemulihan tidak valid atau sudah kedaluwarsa.' }); return; }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null } });

    res.json({ message: 'Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru Anda.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengatur ulang kata sandi.' });
  }
};

// 2. FUNGSI LOGIN (Masuk Akun)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      res.status(400).json({ message: 'Email dan password wajib diisi dengan format yang benar.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      res.status(401).json({ message: 'Email atau password salah!' });
      return;
    }

    // Cocokkan password yang diketik dengan password acak di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email atau password salah!' });
      return;
    }

    // Cek apakah akun sudah disetujui oleh Admin (Akun Administrator dikecualikan dan bebas masuk)
    if (!user.isApproved && user.role?.name !== 'Admin') {
      res.status(403).json({ message: 'Akun Anda belum disetujui oleh Admin. Silakan tunggu.' });
      return;
    }

    // Jika cocok, buatkan Token JWT (Kartu Akses Digital)
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.role.name }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({ message: 'Login berhasil!', token });
  } catch (error) {
    console.error('🔥 [ERROR LOGIN]:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};

// 5. FUNGSI GOOGLE LOGIN/REGISTER (Single Sign-On)
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!isNonEmptyString(token)) {
      res.status(400).json({ message: 'Token Google wajib diisi.' });
      return;
    }

    // Verifikasi token dari Google
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = await googleResponse.json();
    
    if (!googleResponse.ok) {
      res.status(400).json({ message: 'Token Google tidak valid.' });
      return;
    }

    const { email, name } = payload;
    let user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

    // Jika user belum pernah mendaftar, daftarkan secara otomatis
    if (!user) {
      const role = await prisma.role.upsert({ where: { name: 'Jurnalis' }, update: {}, create: { name: 'Jurnalis' } });
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: { email, name, password: hashedPassword, roleId: role.id, isApproved: false },
        include: { role: true }
      });
      res.status(403).json({ message: 'Akun berhasil didaftarkan. Silakan tunggu persetujuan Admin.' });
      return;
    }

    if (!user.isApproved && user.role?.name !== 'Admin') {
      res.status(403).json({ message: 'Akun Anda belum disetujui oleh Admin. Silakan tunggu.' });
      return;
    }

    const jwtToken = jwt.sign({ userId: user.id, roleId: user.roleId, roleName: user.role.name }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login berhasil!', token: jwtToken });
  } catch (error) {
    console.error('🔥 [ERROR GOOGLE LOGIN]:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat Google Login', error });
  }
};