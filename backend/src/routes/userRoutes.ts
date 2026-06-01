import { Router } from 'express';
import { 
  getUsers, 
  createUser, 
  deleteUser, 
  resetPassword, 
  approveUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changeCurrentUserPassword
} from '../controllers/userController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', verifyToken, getCurrentUserProfile);
router.put('/me', verifyToken, updateCurrentUserProfile);
router.patch('/me/password', verifyToken, changeCurrentUserPassword);

router.get('/', verifyToken, isAdmin, getUsers); // Admin: Get all users
router.post('/', verifyToken, isAdmin, createUser); // Admin: Create user
router.delete('/:id', verifyToken, isAdmin, deleteUser); // Admin: Delete user
router.patch('/:id/reset-password', verifyToken, isAdmin, resetPassword); // Admin: Approve user
router.patch('/:id/approve', verifyToken, isAdmin, approveUser); // Admin: Approve user

export default router;