import api from "./api";

export async function waitForJob(jobId, { intervalMs = 1500, timeoutMs = 90000 } = {}) {
  const start = Date.now();

  while (Date.now() - start <= timeoutMs) {
    const elapsed = Date.now() - start;
    void elapsed;

    const res = await api.get(`/jobs/${jobId}`);
    const job = res.data?.data;

    if (!res.data?.success || !job) {
      throw new Error(res.data?.message || "Failed to fetch job status");
    }

    if (job.status === "succeeded") return job;
    if (job.status === "failed") {
      const msg = job.error?.message || "Job failed";
      throw new Error(msg);
    }

    // wait
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error("Job timed out");
}
