import { Router } from "express";
import lessonRoutes from "../../routes/lessonRoutes.js";
import courseRoutes from "../../routes/courseRoutes.js";
import trackRoutes from "../../routes/trackRoutes.js";
import quizRoutes from "../../routes/quizRoutes.js";
import noteRoutes from "../../routes/noteRoutes.js";
import skillTreeRoutes from "../../routes/skillTreeRoutes.js";

const learningModule = Router();

learningModule.use("/lessons", lessonRoutes);
learningModule.use("/courses", courseRoutes);
learningModule.use("/track", trackRoutes);
learningModule.use("/quiz", quizRoutes);
learningModule.use("/notes", noteRoutes);
learningModule.use("/skill-tree", skillTreeRoutes);

export default learningModule;
