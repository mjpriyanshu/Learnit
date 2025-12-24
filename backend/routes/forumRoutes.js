import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    votePost,
    markResolved,
    addComment,
    voteComment,
    acceptAnswer,
    deleteComment,
    getCategories
} from '../controllers/forumController.js';

const router = express.Router();

// Categories
router.get('/categories', protect, getCategories);

// Posts
router.get('/posts', protect, getPosts);
router.get('/posts/:postId', protect, getPost);
router.post('/posts', protect, createPost);
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);
router.post('/posts/:postId/vote', protect, votePost);
router.patch('/posts/:postId/resolve', protect, markResolved);

// Comments
router.post('/posts/:postId/comments', protect, addComment);
router.post('/comments/:commentId/vote', protect, voteComment);
router.post('/posts/:postId/comments/:commentId/accept', protect, acceptAnswer);
router.delete('/comments/:commentId', protect, deleteComment);

export default router;
