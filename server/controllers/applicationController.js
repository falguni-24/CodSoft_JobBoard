const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate only)
exports.applyJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, portfolioUrl } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required to apply',
      });
    }

    const job = await Job.findById(jobId).populate('employerId', 'name email');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Prevent applications to inactive or closed jobs
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer accepting applications (inactive or closed).',
      });
    }

    // Check if employer is trying to apply to their own job
    if (job.employerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Employers cannot apply to their own job listings.',
      });
    }

    // Prevent duplicate application
    const existingApplication = await Application.findOne({
      jobId: job._id,
      candidateId: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    // Determine resume: either newly uploaded in this request or saved in candidate profile
    let resumePath = '';
    let resumeOriginalName = '';

    if (req.file) {
      resumePath = req.file.path;
      resumeOriginalName = req.file.originalname;

      // Also update candidate's profile resume if not already set
      if (!req.user.profile?.resumePath) {
        await User.findByIdAndUpdate(req.user._id, {
          'profile.resumePath': resumePath,
          'profile.resumeOriginalName': resumeOriginalName,
          'profile.resumeUpdatedAt': new Date(),
        });
      }
    } else if (req.user.profile?.resumePath) {
      resumePath = req.user.profile.resumePath;
      resumeOriginalName = req.user.profile.resumeOriginalName || 'Resume.pdf';
    } else {
      return res.status(400).json({
        success: false,
        message: 'A resume file (PDF or DOC/DOCX) is required to submit an application.',
      });
    }

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      resumePath,
      resumeOriginalName,
      coverLetter: coverLetter || '',
      portfolioUrl: portfolioUrl || req.user.profile?.portfolioUrl || '',
      status: 'Pending',
    });

    // Send asynchronous notifications (graceful, non-blocking)
    emailService.sendApplicationSubmittedCandidateEmail({
      candidate: req.user,
      job,
    });

    if (job.employerId) {
      emailService.sendNewApplicationEmployerEmail({
        employer: job.employerId,
        candidate: req.user,
        job,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate's submitted applications
// @route   GET /api/applications/my
// @access  Private (Candidate only)
exports.getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private (Employer only - owner of the job)
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only view applicants for your own jobs',
      });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('candidateId', 'name email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      jobTitle: job.title,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Authorized Employer only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, statusNotes } = req.body;
    const allowedStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify employer owns the job
    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this application',
      });
    }

    application.status = status;
    if (statusNotes !== undefined) {
      application.statusNotes = statusNotes;
    }

    await application.save();

    // Trigger status update email to candidate
    emailService.sendStatusUpdateEmail({
      candidate: application.candidateId,
      job: application.jobId,
      status,
      notes: statusNotes,
    });

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw candidate's own application
// @route   PATCH /api/applications/:id/withdraw
// @access  Private (Candidate only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application',
      });
    }

    if (application.status === 'Shortlisted' || application.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Application cannot be withdrawn once it has reached '${application.status}' stage.`,
      });
    }

    application.status = 'Withdrawn';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application successfully withdrawn',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely view / download applicant resume
// @route   GET /api/applications/:id/resume
// @access  Private (Candidate owner or Job employer owner)
exports.downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const isCandidateOwner = application.candidateId.toString() === req.user._id.toString();
    const isEmployerOwner =
      application.jobId && application.jobId.employerId.toString() === req.user._id.toString();

    if (!isCandidateOwner && !isEmployerOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view or download this resume',
      });
    }

    const filePath = application.resumePath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file is not available on server disk.',
      });
    }

    res.download(filePath, application.resumeOriginalName || 'Resume.pdf');
  } catch (error) {
    next(error);
  }
};
