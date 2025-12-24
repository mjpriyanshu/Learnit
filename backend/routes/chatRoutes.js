import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    sendMessage,
    getChatHistory,
    getSessions,
    deleteSession
} from '../controllers/chatController.js';

const router = express.Router();

// Send message to chatbot
router.post('/message', protect, sendMessage);

// Get all chat sessions
router.get('/sessions', protect, getSessions);

// Get specific chat history
router.get('/sessions/:sessionId', protect, getChatHistory);

// Delete chat session
router.delete('/sessions/:sessionId', protect, deleteSession);

export default router;
