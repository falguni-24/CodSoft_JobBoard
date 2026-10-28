const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
    },
    resumePath: {
      type: String,
      required: [true, 'Resume file path is required'],
    },
    resumeOriginalName: {
      type: String,
      required: [true, 'Resume original name is required'],
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Withdrawn'],
      default: 'Pending',
    },
    statusNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by the same candidate to the same job
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
