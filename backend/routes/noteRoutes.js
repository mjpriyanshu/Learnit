import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getNotes,
    getAllNotes,
    saveNote,
    toggleBookmark,
    deleteNote
} from '../controllers/noteController.js';

const router = express.Router();

// Get all notes for user
router.get('/', protect, getAllNotes);

// Get note for specific lesson
router.get('/lesson/:lessonId', protect, getNotes);

// Save note for lesson
router.post('/lesson/:lessonId', protect, saveNote);

// Toggle bookmark
router.patch('/lesson/:lessonId/bookmark', protect, toggleBookmark);

// Delete note
router.delete('/lesson/:lessonId', protect, deleteNote);

export default router;
