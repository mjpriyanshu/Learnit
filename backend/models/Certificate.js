import mongoose from "mongoose";
import crypto from "crypto";

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },

    // Certificate Details
    certificateId: { type: String, unique: true },
    title: { type: String, required: true },
    recipientName: { type: String, required: true },
    description: { type: String, default: "" },

    // Completion Info
    completionDate: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },

    // Certificate Metadata
    issuerName: { type: String, default: "LearnIt Platform" },
    isValid: { type: Boolean, default: true }

}, { timestamps: true });

// Generate unique certificate ID before saving
certificateSchema.pre('save', function (next) {
    if (!this.certificateId) {
        this.certificateId = 'CERT-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }
    next();
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
