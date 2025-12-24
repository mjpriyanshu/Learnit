import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    
    // Check if this is the first user - make them super admin
    const userCount = await User.countDocuments();
    const userRole = userCount === 0 ? 'admin' : (role || 'student');
    const isSuperAdmin = userCount === 0;
    
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
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
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
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
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

// Forgot password - generates a password reset token
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
        message: "If an account with that email exists, a password reset link has been sent" 
      });
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In a real application, you would send this token via email
    // For now, we'll return it in the response
    console.log('🔑 Password reset token for', email, ':', resetToken);
    
    res.json({
      success: true,
      data: { resetToken }, // In production, don't send this - send via email instead
      message: "Password reset instructions sent to your email"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Reset password using the token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.json({ success: false, message: "Token and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }
    
    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.purpose !== 'password-reset') {
        return res.json({ success: false, message: "Invalid reset token" });
      }
    } catch (err) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

