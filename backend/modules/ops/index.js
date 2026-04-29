import { Router } from "express";
import adminRoutes from "../../routes/adminRoutes.js";
import analyticsRoutes from "../../routes/analyticsRoutes.js";
import jobRoutes from "../../routes/jobRoutes.js";

const opsModule = Router();

opsModule.use("/admin", adminRoutes);
opsModule.use("/analytics", analyticsRoutes);
opsModule.use("/jobs", jobRoutes);

export default opsModule;
