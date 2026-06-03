"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.verifyToken, userController_1.getCurrentUserProfile);
router.put('/me', authMiddleware_1.verifyToken, userController_1.updateCurrentUserProfile);
router.patch('/me/password', authMiddleware_1.verifyToken, userController_1.changeCurrentUserPassword);
router.get('/', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.getUsers); // Admin: Get all users
router.post('/', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.createUser); // Admin: Create user
router.delete('/:id', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.deleteUser); // Admin: Delete user
router.patch('/:id/reset-password', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.resetPassword); // Admin: Approve user
router.patch('/:id/approve', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.approveUser); // Admin: Approve user
router.patch('/:id/role', authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, userController_1.updateUserRole); // Admin: Update user role
exports.default = router;
