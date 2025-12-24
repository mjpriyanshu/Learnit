import mongoose from "mongoose";

const recommendationLogSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  recommendedPath: [{
    lessonId: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'},
    score: {type: Number},
    reason: {type: String}
  }],
  reason: {type: String, default: ""},
  timestamp: {type: Date, default: Date.now}
}, {timestamps: true});

const RecommendationLog = mongoose.model("RecommendationLog", recommendationLogSchema);
export default RecommendationLog;
