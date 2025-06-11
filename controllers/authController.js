import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { generateToken } from '../utils/generateToken.js';

export async function register(req, res) {
  const { username, email, phone, password } = req.body;
  const emailToken = randomBytes(64).toString('hex');

  const user = new User({ username, email, phone, password, emailToken });
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify.html?token=${emailToken}`;
  await sendEmail(email, 'Verify your email', `Click here: ${verificationUrl}`);

  res.status(201).json({ message: 'Registration successful, check your email.' });
}

export async function verifyEmail(req, res) {
  const user = await User.findOne({ emailToken: req.query.token });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.isVerified = true;
  user.emailToken = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully.' });
}

export async function login(req, res) {
  const { identifier, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
  });

  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.isVerified)
    return res.status(403).json({ message: 'Please verify your email first' });

  const token = generateToken(user._id);
  res.json({ token });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  const resetToken = randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail(email, 'Reset Password', `Click here: ${resetUrl}`);

  res.json({ message: 'Reset link sent to email' });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
}
