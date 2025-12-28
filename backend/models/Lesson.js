import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String, default: "" },

  // Original watch URL (keep for backward compatibility)
  contentURL: { type: String, required: true },

  // NEW: iframe-safe embed URL (CRITICAL FIX)
  embedURL: { type: String, default: "" },

  // NEW: YouTube video ID (optional, useful for analytics)
  videoId: { type: String, default: "" },

  sourceType: {
    type: String,
    enum: ['video', 'article', 'docs', 'tutorial', 'course'],
    default: 'article'
  },

  tags: [{ type: String }],

  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },

  estimatedTimeMin: { type: Number, default: 30 },

  provider: { type: String, default: "" },

  isExternal: { type: Boolean, default: true },

  prerequisites: [{ type: String }],

  rating: { type: Number, default: 0, min: 0, max: 5 },

  visits: { type: Number, default: 0 },

  // Dynamic content fields
  createdBy: {
    type: String,
    enum: ['system', 'user', 'gemini'],
    default: 'system'
  },

  isCustom: { type: Boolean, default: false },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  geminiGenerated: { type: Boolean, default: false },

  personalizedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  visibility: {
    type: String,
    enum: ['public', 'private', 'curated'],
    default: 'public'
  }

}, { timestamps: true });

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
