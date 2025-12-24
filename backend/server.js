import express from 'express';
import "dotenv/config";
import cors from 'cors';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
// New feature routes
import goalRoutes from './routes/goalRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import skillTreeRoutes from './routes/skillTreeRoutes.js';

const app = express();

// Middleware
app.use(express.json({ limit: '4mb' }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/certificate', certificateRoutes);
// New feature routes
app.use('/api/goals', goalRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/skill-tree', skillTreeRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.json({ success: false, message: err.message || "Internal server error" });
});

// Database connection
await connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
