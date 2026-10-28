const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'jobconnect_super_secret_jwt_key_development_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user (Candidate or Employer)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, headline, companyName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const assignedRole = role === 'employer' ? 'employer' : 'candidate';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      profile: {
        headline: headline || '',
        companyName: assignedRole === 'employer' ? companyName || '' : '',
      },
    });

    const token = signToken(user._id);

    // Exclude password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      headline,
      bio,
      phone,
      location,
      companyName,
      companyWebsite,
      skills,
      experience,
      education,
      portfolioUrl,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (headline !== undefined) user.profile.headline = headline;
    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (location !== undefined) user.profile.location = location;
    if (companyName !== undefined) user.profile.companyName = companyName;
    if (companyWebsite !== undefined) user.profile.companyWebsite = companyWebsite;
    if (skills !== undefined) {
      user.profile.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (experience !== undefined) user.profile.experience = experience;
    if (education !== undefined) user.profile.education = education;
    if (portfolioUrl !== undefined) user.profile.portfolioUrl = portfolioUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload candidate default resume
// @route   POST /api/auth/upload-resume
// @access  Private (Candidate)
exports.uploadProfileResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid resume file (PDF or DOC/DOCX).',
      });
    }

    const user = await User.findById(req.user.id);
    user.profile.resumePath = req.file.path;
    user.profile.resumeOriginalName = req.file.originalname;
    user.profile.resumeUpdatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: {
        originalName: user.profile.resumeOriginalName,
        updatedAt: user.profile.resumeUpdatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
