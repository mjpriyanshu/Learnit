import Job from "../models/Job.js";

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Basic access control: if job is tied to a user, only that user can read it.
    if (job.createdBy && userId && job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
      success: true,
      data: {
        id: job._id,
        type: job.type,
        status: job.status,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
