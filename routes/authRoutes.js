// routes/authRoutes.js
import { Router } from 'express';
const router = Router();
import { register, verifyEmail, login, forgotPassword, resetPassword } from '../controllers/authController.js';

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
