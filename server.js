import dotenv from 'dotenv';
import User from './models/User.js';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(console.error);

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ emailToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.isVerified = true;
    user.emailToken = null;
    await user.save();

    return res.redirect( 'http://localhost:5500/client/verify.html' );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
})

app.listen(5000, () => console.log("Server is running on port 5000"));