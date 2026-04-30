import { Router } from "express";
import lessonRoutes from "./lesson.routes.js";
import courseRoutes from "./course.routes.js";
import trackRoutes from "./track.routes.js";
import quizRoutes from "./quiz.routes.js";
import noteRoutes from "./note.routes.js";
import skillTreeRoutes from "./skillTree.routes.js";

const learningModule = Router();

learningModule.use("/lessons", lessonRoutes);
learningModule.use("/courses", courseRoutes);
learningModule.use("/track", trackRoutes);
learningModule.use("/quiz", quizRoutes);
learningModule.use("/notes", noteRoutes);
learningModule.use("/skill-tree", skillTreeRoutes);

export default learningModule;
