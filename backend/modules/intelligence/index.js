import { Router } from "express";
import recommendationRoutes from "./recommendation.routes.js";
import chatRoutes from "./chat.routes.js";

const intelligenceModule = Router();

intelligenceModule.use("/recommendations", recommendationRoutes);
intelligenceModule.use("/chat", chatRoutes);

export default intelligenceModule;
