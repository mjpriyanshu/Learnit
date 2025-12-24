import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

// Generate a new certificate
export const generateCertificate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId, title } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if lesson is completed
        if (lessonId) {
            const progress = await Progress.findOne({ userId, lessonId, status: 'completed' });
            if (!progress) {
                return res.status(400).json({ success: false, message: "Lesson not completed yet" });
            }
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({ userId, lessonId });
        if (existingCert) {
            return res.json({ success: true, data: existingCert, message: "Certificate already exists" });
        }

        // Get lesson details if lessonId provided
        let lessonTitle = title || "Course Completion";
        let description = "Successfully completed the learning module";

        if (lessonId) {
            const lesson = await Lesson.findById(lessonId);
            if (lesson) {
                lessonTitle = lesson.title;
                description = `Successfully completed "${lesson.title}" on the LearnIt platform`;
            }
        }

        // Create certificate
        const certificate = await Certificate.create({
            userId,
            lessonId,
            title: lessonTitle,
            recipientName: user.name,
            description,
            completionDate: new Date()
        });

        res.json({ success: true, data: certificate });
    } catch (error) {
        console.error("Error generating certificate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get certificate by ID
export const getCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await Certificate.findOne({ certificateId: id })
            .populate('userId', 'name email')
            .populate('lessonId', 'title');

        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        res.json({ success: true, data: certificate });
    } catch (error) {
        console.error("Error getting certificate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all certificates for current user
export const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user._id;

        const certificates = await Certificate.find({ userId })
            .populate('lessonId', 'title')
            .sort({ completionDate: -1 });

        res.json({ success: true, data: certificates });
    } catch (error) {
        console.error("Error getting certificates:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify certificate (public endpoint)
export const verifyCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await Certificate.findOne({ certificateId: id, isValid: true })
            .populate('userId', 'name')
            .populate('lessonId', 'title');

        if (!certificate) {
            return res.json({ success: false, valid: false, message: "Certificate not found or invalid" });
        }

        res.json({
            success: true,
            valid: true,
            data: {
                certificateId: certificate.certificateId,
                recipientName: certificate.recipientName,
                title: certificate.title,
                completionDate: certificate.completionDate,
                issuerName: certificate.issuerName
            }
        });
    } catch (error) {
        console.error("Error verifying certificate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
