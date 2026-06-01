import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna' });
  }
};

export const getCurrentUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User tidak terautentikasi.' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) {
      res.status(404).json({ message: 'Profil pengguna tidak ditemukan.' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil profil pengguna.' });
  }
};

export const updateCurrentUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, email } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'User tidak terautentikasi.' });
      return;
    }

    if (!name || !email) {
      res.status(400).json({ message: 'Nama dan email wajib diisi.' });
      return;
    }

    const existingUserWithEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
      res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true }
    });
    res.json({ message: 'Profil berhasil diperbarui.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, roleName = 'Jurnalis' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nama, email, dan password wajib diisi!' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email sudah terdaftar!' });
      return;
    }

    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        roleId: role.id, 
        isApproved: true // <-- Pengguna yang dibuat oleh Admin otomatis aktif
      },
    });

    res.status(201).json({ message: 'User berhasil ditambahkan', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const targetUser = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!targetUser) {
      res.status(404).json({ message: 'User tidak ditemukan' }); return;
    }
    if (targetUser.role?.name === 'Admin') {
      res.status(403).json({ message: 'Ditolak: Akun Administrator tidak boleh dihapus!' }); return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
};

export const approveUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.update({ where: { id }, data: { isApproved: true } });
    res.json({ message: 'Akun pengguna berhasil disetujui.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyetujui pengguna.' });
  }
};

export const changeCurrentUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'User tidak terautentikasi.' });
      return;
    }

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'Kata sandi saat ini dan kata sandi baru (minimal 6 karakter) wajib diisi.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Kata sandi saat ini salah.' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });
    res.json({ message: 'Kata sandi berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah kata sandi.' });
  }
};

export const resetPassword = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'Kata sandi baru minimal 6 karakter!' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ message: 'User tidak ditemukan' }); return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    res.json({ message: 'Kata sandi berhasil diatur ulang' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengatur ulang kata sandi pengguna' });
  }
};