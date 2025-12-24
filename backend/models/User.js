import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  role: {type: String, enum: ['student', 'admin'], default: 'student'},
  isSuperAdmin: {type: Boolean, default: false},
  isActive: {type: Boolean, default: true},
  interests: [{type: String}],
  skill_levels: {type: Map, of: Number, default: {}},
  learning_goals: [{type: String}],
  resetPasswordOTP: {type: String},
  resetPasswordOTPExpires: {type: Date}
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;
