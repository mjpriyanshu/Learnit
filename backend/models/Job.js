import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["queued", "running", "succeeded", "failed"],
      default: "queued",
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    payload: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    error: {
      message: { type: String },
      stack: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
