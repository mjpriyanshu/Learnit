import { generateRecommendations } from "../lib/recommendationEngine.js";
import RecommendationLog from "../models/RecommendationLog.js";

export const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await generateRecommendations(user, limit);
    
    await RecommendationLog.create({
      userId: user._id,
      recommendedPath: recommendations.map(r => ({
        lessonId: r._id,
        score: r.score,
        reason: r.reason
      })),
      reason: "Auto-generated based on user profile and progress"
    });
    
    res.json({
      success: true,
      data: recommendations,
      message: "Recommendations generated successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const refreshRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.body.limit) || 10;
    
    const recommendations = await generateRecommendations(user, limit);
    
    await RecommendationLog.create({
      userId: user._id,
      recommendedPath: recommendations.map(r => ({
        lessonId: r._id,
        score: r.score,
        reason: r.reason
      })),
      reason: "Manual refresh requested by user"
    });
    
    res.json({
      success: true,
      data: recommendations,
      message: "Recommendations refreshed successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};
