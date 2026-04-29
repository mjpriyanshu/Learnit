import { Router } from "express";
import progressRoutes from "../../routes/progressRoutes.js";
import goalRoutes from "../../routes/goalRoutes.js";
import gamificationRoutes from "../../routes/gamificationRoutes.js";
import forumRoutes from "../../routes/forumRoutes.js";
import certificateRoutes from "../../routes/certificateRoutes.js";
import notificationRoutes from "../../routes/notificationRoutes.js";

const engagementModule = Router();

engagementModule.use("/progress", progressRoutes);
engagementModule.use("/goals", goalRoutes);
engagementModule.use("/gamification", gamificationRoutes);
engagementModule.use("/forum", forumRoutes);
engagementModule.use("/certificates", certificateRoutes);
engagementModule.use("/notifications", notificationRoutes);

export default engagementModule;
