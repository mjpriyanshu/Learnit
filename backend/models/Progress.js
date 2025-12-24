import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  lessonId: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true},
  status: {type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started'},
  score: {type: Number, default: 0, min: 0, max: 100},
  timeSpentMin: {type: Number, default: 0},
  addedToList: {type: Boolean, default: false}, // User explicitly added to their progress list
  collection: {type: String, default: 'Default'}, // Group/collection name for organizing
  dailyTimeLog: [{  // Track time spent per day for accurate heatmap
    date: {type: String, required: true}, // YYYY-MM-DD format
    minutesSpent: {type: Number, default: 0}
  }],
  lastUpdated: {type: Date, default: Date.now}
}, {timestamps: true});

progressSchema.index({userId: 1, lessonId: 1}, {unique: true});

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
