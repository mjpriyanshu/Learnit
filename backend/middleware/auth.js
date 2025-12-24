import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.json({success: false, message: "No token provided"});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.json({success: false, message: "User not found"});
    }
    
    console.log('✅ Authenticated user:', user.email, '| Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    res.json({success: false, message: "Invalid or expired token"});
  }
};
