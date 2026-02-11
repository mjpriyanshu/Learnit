import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory OTP storage for development
// Structure: { email: { otp: '123456', expiresAt: timestamp } }
const otpStore = {};

export const checkFirstUser = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      data: { isFirstUser: userCount === 0 }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
    
    // Check if this is the first user - make them super admin
    // After first user, all signups create student accounts only
    // Admins can only be created by super admin through admin panel
    const userCount = await User.countDocuments();
    const userRole = userCount === 0 ? 'admin' : 'student';
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
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "No account found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10-minute expiration
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // Log OTP to backend console (development mode)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 PASSWORD RESET OTP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
      success: true,
      message: "OTP sent successfully. Check the backend console for the OTP code.",
      email
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    // Check if OTP exists for this email
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.json({ success: false, message: "No OTP found for this email. Please request a new one." });
    }

    // Check if OTP has expired
    if (Date.now() > storedOTP.expiresAt) {
      delete otpStore[email];
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Verify OTP
    if (storedOTP.otp !== otp.toString()) {
      return res.json({ success: false, message: "Invalid OTP. Please try again." });
    }

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      email
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.json({ success: false, message: "No OTP found. Please request a new OTP." });
    }

    if (Date.now() > storedOTP.expiresAt) {
      delete otpStore[email];
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (storedOTP.otp !== otp.toString()) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clear OTP after successful password reset
    delete otpStore[email];

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
