import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Content
    content: { type: String, required: true },

    // Threading (for nested replies)
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, default: 0, max: 3 }, // Limit nesting depth

    // Engagement
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Status
    isAcceptedAnswer: { type: Boolean, default: false }, // For Q&A style posts
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },

    // Moderation
    isApproved: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// Virtual for vote score
commentSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

// Index for efficient querying
commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
