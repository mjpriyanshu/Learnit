import express from "express";
import {
  getRecommendations,
  refreshRecommendations,
} from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getRecommendations);
router.post("/refresh", authMiddleware, refreshRecommendations);

export default router;
