import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Post Content
    title: { type: String, required: true, maxLength: 200 },
    content: { type: String, required: true },

    // Categorization
    category: {
        type: String,
        enum: ['general', 'javascript', 'python', 'react', 'node', 'database', 'career', 'help'],
        default: 'general'
    },
    tags: [{ type: String }],

    // Related Lesson (optional)
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },

    // Engagement
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },

    // Comments count (for quick access)
    commentCount: { type: Number, default: 0 },

    // Status
    isPinned: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false }, // For help/question posts
    isClosed: { type: Boolean, default: false },

    // Moderation
    isApproved: { type: Boolean, default: true },
    reportCount: { type: Number, default: 0 }

}, { timestamps: true });

// Virtual for vote score
postSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

// Index for search and sorting
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
