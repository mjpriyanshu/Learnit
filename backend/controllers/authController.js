import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Check if this is the first user (for frontend to show appropriate UI)
export const checkFirstUser = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      data: { isFirstUser: userCount === 0 },
      message: userCount === 0 ? "No users found - first registration will be super admin" : "Users exist"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, interests, learning_goals, role } = req.body;
    
    if (!name || !email || !password) {
      return res.json({success: false, message: "Missing required fields"});
    }
    
    if (password.length < 6) {
      return res.json({success: false, message: "Password must be at least 6 characters"});
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({success: false, message: "Email already registered"});
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if this is the first user - ALWAYS make them super admin
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    
    // Only first user can be admin through registration
    // Other admins must be created by super admin through admin panel
    const userRole = isFirstUser ? 'admin' : 'student';
    const isSuperAdmin = isFirstUser;
    
    if (isFirstUser) {
      console.log('🎯 First user registration - creating super admin:', email);
    } else if (role === 'admin') {
      console.log('⚠️ Blocked attempt to create admin account through registration:', email);
    }
    
    const user = new User({
      name,
      email,
      passwordHash,
      role: userRole,
      isSuperAdmin,
      interests: interests || [],
      learning_goals: learning_goals || []
    });
    
    await user.save();
    
    const token = jwt.sign({ 
      userId: user._id, 
      role: user.role, 
      isSuperAdmin: user.isSuperAdmin 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          interests: user.interests,
          learning_goals: user.learning_goals
        }
      },
      message: "Registration successful"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({success: false, message: "Missing required fields"});
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({success: false, message: "Invalid credentials"});
    }
    
    if (!user.isActive) {
      return res.json({success: false, message: "Account suspended. Contact administrator."});
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.json({success: false, message: "Invalid credentials"});
    }
    
    const token = jwt.sign({ 
      userId: user._id, 
      role: user.role, 
      isSuperAdmin: user.isSuperAdmin 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    console.log('✅ Login successful:', user.email, '| Role:', user.role);
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
          interests: user.interests,
          learning_goals: user.learning_goals
        }
      },
      message: "Login successful"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
      message: "Token verified"
    });
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      data: user,
      message: "Profile retrieved successfully"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Update user profile (name, interests, learning goals)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, interests, learning_goals } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (interests !== undefined) user.interests = interests;
    if (learning_goals !== undefined) user.learning_goals = learning_goals;
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-passwordHash');
    
    res.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Changed from req.user.id to req.user._id
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔐 Changing password for user:', userId);
    
    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Both current and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.json({ success: false, message: "New password must be at least 6 characters" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }
    
    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Forgot password - generates a 6-digit OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal whether user exists for security
      return res.json({ 
        success: true, 
        message: "If an account with that email exists, a verification code has been sent" 
      });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and expiry (valid for 10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // In a real application, you would send this OTP via email
    // For development, we'll log it to console
    console.log('🔑 Password reset OTP for', email, ':', otp);
    console.log('⏰ OTP expires at:', user.resetPasswordOTPExpires);
    
    // TODO: Send OTP via email service (e.g., SendGrid, AWS SES, Nodemailer)
    // await sendEmail(email, 'Password Reset OTP', `Your verification code is: ${otp}`);
    
    res.json({
      success: true,
      message: "A verification code has been sent to your email. It will expire in 10 minutes."
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Verify OTP code
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    
    // Check if OTP exists and matches
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.json({ success: false, message: "Invalid verification code" });
    }
    
    // Check if OTP has expired
    if (user.resetPasswordOTPExpires < new Date()) {
      return res.json({ success: false, message: "Verification code has expired. Please request a new one." });
    }
    
    res.json({
      success: true,
      message: "Verification code confirmed. You can now reset your password."
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Reset password using the OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Email, OTP, and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    
    // Verify OTP
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.json({ success: false, message: "Invalid verification code" });
    }
    
    // Check if OTP has expired
    if (user.resetPasswordOTPExpires < new Date()) {
      return res.json({ success: false, message: "Verification code has expired. Please request a new one." });
    }
    
    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    
    await user.save();
    
    console.log('✅ Password reset successful for:', email);
    
    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

