import mongoose from "mongoose";

const skillTreeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interests: [{ type: String }],
  treeData: { type: Object, required: true }, // The complete skill tree JSON
  createdAt: { type: Date, default: Date.now }
});

// Index to ensure we can quickly find user's trees and limit them
skillTreeSchema.index({ userId: 1, createdAt: -1 });

const SkillTree = mongoose.model("SkillTree", skillTreeSchema);
export default SkillTree;
