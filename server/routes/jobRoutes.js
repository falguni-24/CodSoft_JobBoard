const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getEmployerStats,
} = require('../controllers/jobController');
const { getJobApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', getJobs);

// Employer specific dashboard routes (must be before /:id)
router.get('/employer/my-jobs', protect, authorize('employer'), getEmployerJobs);
router.get('/employer/stats', protect, authorize('employer'), getEmployerStats);

// Single job details
router.get('/:id', getJobById);

// Create job (Employer only)
router.post(
  '/',
  protect,
  authorize('employer'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('description').trim().notEmpty().withMessage('Job description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('jobType').trim().notEmpty().withMessage('Job type is required'),
    validate,
  ],
  createJob
);

// Update job (Employer owner)
router.put('/:id', protect, authorize('employer'), updateJob);

// Delete job (Employer owner)
router.delete('/:id', protect, authorize('employer'), deleteJob);

// Get applications for a job (Employer owner)
router.get('/:id/applications', protect, authorize('employer'), getJobApplications);

module.exports = router;
