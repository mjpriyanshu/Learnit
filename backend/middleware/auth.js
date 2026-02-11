import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({success: false, message: "No token provided"});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.json({success: false, message: "User not found"});
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.json({success: false, message: "Invalid or expired token"});
  }
};
