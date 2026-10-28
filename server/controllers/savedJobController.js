const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Get all saved jobs for current candidate
// @route   GET /api/saved-jobs
// @access  Private (Candidate only)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ candidateId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    // Filter out jobs that might have been deleted from DB
    const validSavedJobs = savedJobs.filter((item) => item.jobId !== null);

    res.status(200).json({
      success: true,
      count: validSavedJobs.length,
      savedJobs: validSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (Candidate only)
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    const existing = await SavedJob.findOne({
      candidateId: req.user._id,
      jobId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Job is already in your saved list',
        savedJob: existing,
      });
    }

    const savedJob = await SavedJob.create({
      candidateId: req.user._id,
      jobId,
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave / remove a saved job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (Candidate only)
exports.unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const result = await SavedJob.findOneAndDelete({
      candidateId: req.user._id,
      jobId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Job was not found in your saved list',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a job is saved by current candidate
// @route   GET /api/saved-jobs/check/:jobId
// @access  Private (Candidate only)
exports.checkSaved = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const existing = await SavedJob.findOne({
      candidateId: req.user._id,
      jobId,
    });

    res.status(200).json({
      success: true,
      isSaved: !!existing,
    });
  } catch (error) {
    next(error);
  }
};
