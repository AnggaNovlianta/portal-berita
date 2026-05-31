import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

// 1. FUNGSI REGISTRASI (Mendaftar Akun)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, roleId } = req.body;

    // Cek apakah email sudah terdaftar sebelumnya
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email sudah terdaftar!' });
      return;
    }

    // Acak (hash) password agar tidak bisa dibaca di database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Simpan data ke PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};

// 2. FUNGSI LOGIN (Masuk Akun)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Cari user di database
    const user = await prisma.user.findUnique({ where: { email } });
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

    // Jika cocok, buatkan Token JWT (Kartu Akses Digital)
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({ message: 'Login berhasil!', token });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};