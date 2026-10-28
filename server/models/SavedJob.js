const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate saves and quickly look up saved jobs
savedJobSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ candidateId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
