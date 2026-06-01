import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/', getSettings);

router.post('/', verifyToken, isAdmin, upload.single('site_logo'), updateSettings);

export default router;