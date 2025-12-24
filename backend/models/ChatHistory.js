import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Session info
    sessionId: { type: String, required: true },
    sessionTitle: { type: String, default: "New Chat" },

    // Messages
    messages: [messageSchema],

    // Context (for AI context)
    context: {
        currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
        currentTopic: { type: String, default: null },
        userLevel: { type: String, default: 'beginner' }
    },

    // Metadata
    messageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // Feedback
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: null }

}, { timestamps: true });

// Index for efficient querying
chatHistorySchema.index({ userId: 1, isActive: 1, updatedAt: -1 });
chatHistorySchema.index({ sessionId: 1 }, { unique: true });

// Pre-save to update message count
chatHistorySchema.pre('save', function (next) {
    this.messageCount = this.messages.length;
    next();
});

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
export default ChatHistory;
