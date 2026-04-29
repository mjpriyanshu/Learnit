import { Router } from "express";
import recommendationRoutes from "../../routes/recommendationRoutes.js";
import chatRoutes from "../../routes/chatRoutes.js";

const intelligenceModule = Router();

intelligenceModule.use("/recommendations", recommendationRoutes);
intelligenceModule.use("/chat", chatRoutes);

export default intelligenceModule;
