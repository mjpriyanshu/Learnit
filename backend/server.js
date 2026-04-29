import express from 'express';
import "dotenv/config";
import cors from 'cors';
import { connectDB } from './lib/db.js';
import apiModules from './modules/index.js';
import { startJobRunner } from './lib/jobRunner.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

// Middleware
app.use(express.json({limit: '4mb'}));
app.use(cors());
app.use(requestLogger);

// Routes
app.use('/api', apiModules);

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
await startJobRunner();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
