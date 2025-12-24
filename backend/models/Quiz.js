import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option
  explanation: { type: String, default: "" },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ['assessment', 'lesson', 'practice'], default: 'lesson' },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  topic: { type: String, default: "" }, // For assessment quizzes
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 }, // Percentage
  timeLimit: { type: Number, default: 0 }, // Minutes, 0 = no limit
  xpReward: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
