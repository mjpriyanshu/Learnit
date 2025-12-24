import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, default: ""},
  contentURL: {type: String, required: true},
  sourceType: {type: String, enum: ['video', 'article', 'docs', 'tutorial', 'course'], default: 'article'},
  tags: [{type: String}],
  difficulty: {type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner'},
  estimatedTimeMin: {type: Number, default: 30},
  provider: {type: String, default: ""},
  isExternal: {type: Boolean, default: true},
  prerequisites: [{type: String}],
  rating: {type: Number, default: 0, min: 0, max: 5},
  visits: {type: Number, default: 0},
  
  // Dynamic content fields
  createdBy: {type: String, enum: ['system', 'user', 'gemini'], default: 'system'}, // Source of lesson
  isCustom: {type: Boolean, default: false}, // User-imported lesson
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}, // Owner for custom lessons
  geminiGenerated: {type: Boolean, default: false}, // AI-generated lesson
  personalizedFor: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // Users this was generated for
  visibility: {type: String, enum: ['public', 'private', 'curated'], default: 'public'} // Lesson visibility
}, {timestamps: true});

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
