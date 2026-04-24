import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getJob } from "../controllers/jobController.js";

const router = express.Router();

router.get("/:id", authMiddleware, getJob);

export default router;
