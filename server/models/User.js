const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  institution: { type: String, trim: true },
  graduationYear: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'employer'],
        message: 'Role must be either candidate or employer',
      },
      default: 'candidate',
    },
    profile: {
      headline: { type: String, trim: true, default: '' },
      bio: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      companyName: { type: String, trim: true, default: '' },
      companyWebsite: { type: String, trim: true, default: '' },
      skills: [{ type: String, trim: true }],
      experience: [experienceSchema],
      education: [educationSchema],
      portfolioUrl: { type: String, trim: true, default: '' },
      resumePath: { type: String, default: '' },
      resumeOriginalName: { type: String, default: '' },
      resumeUpdatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
