import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, default: ""},
  lessons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
  tags: [{type: String}],
  difficulty: {type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner'},
  estimatedTimeMin: {type: Number, default: 0}
}, {timestamps: true});

const Course = mongoose.model("Course", courseSchema);
export default Course;
