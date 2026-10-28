const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [{
      type: String,
      trim: true,
    }],
    qualifications: [{
      type: String,
      trim: true,
    }],
    location: {
      type: String,
      required: [true, 'Job location is required (e.g. "Remote", "San Francisco, CA")'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      enum: [
        'Software Development',
        'Data Science',
        'Design',
        'Marketing',
        'Finance',
        'Customer Support',
        'Product Management',
        'Sales',
        'Other',
      ],
      default: 'Software Development',
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Remote', 'Internship'],
      default: 'Full-Time',
    },
    salaryRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      period: {
        type: String,
        enum: ['yearly', 'monthly', 'hourly'],
        default: 'yearly',
      },
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal', 'Executive'],
      default: 'Mid Level',
    },
    skills: [{
      type: String,
      trim: true,
    }],
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
});
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
