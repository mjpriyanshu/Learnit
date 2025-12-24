import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },

    // Note Content
    title: { type: String, default: "" },
    content: { type: String, required: true }, // Markdown supported

    // Highlights/Bookmarks
    highlights: [{
        text: { type: String },
        color: { type: String, default: 'yellow' },
        timestamp: { type: Number, default: 0 } // For video timestamps
    }],

    // Tags for organization
    tags: [{ type: String }],

    // Metadata
    isBookmarked: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },

    // Character count
    wordCount: { type: Number, default: 0 }

}, { timestamps: true });

// Compound index for user's notes per lesson
noteSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// Pre-save to calculate word count
noteSchema.pre('save', function (next) {
    if (this.content) {
        this.wordCount = this.content.trim().split(/\s+/).length;
    }
    next();
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
