import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    generateCertificate,
    getCertificate,
    getMyCertificates,
    verifyCertificate
} from '../controllers/certificateController.js';

const router = express.Router();

// Generate new certificate
router.post('/generate', protect, generateCertificate);

// Get user's certificates
router.get('/my-certificates', protect, getMyCertificates);

// Get certificate by ID (protected)
router.get('/:id', protect, getCertificate);

// Verify certificate (public - for sharing)
router.get('/verify/:id', verifyCertificate);

export default router;
