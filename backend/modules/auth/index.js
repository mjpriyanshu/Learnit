import { Router } from "express";
import authRoutes from "./routes.js";

const authModule = Router();

authModule.use("/auth", authRoutes);

export default authModule;
