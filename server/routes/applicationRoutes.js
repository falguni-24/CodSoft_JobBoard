const express = require('express');
const {
  applyJob,
  getCandidateApplications,
  updateApplicationStatus,
  withdrawApplication,
  downloadResume,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Candidate: Submit application (with optional resume file upload)
router.post(
  '/',
  protect,
  authorize('candidate'),
  upload.single('resume'),
  applyJob
);

// Candidate: Get own submitted applications
router.get('/my', protect, authorize('candidate'), getCandidateApplications);

// Candidate: Withdraw an application
router.patch('/:id/withdraw', protect, authorize('candidate'), withdrawApplication);

// Employer: Update application status (Pending, Reviewed, Shortlisted, Rejected)
router.patch(
  '/:id/status',
  protect,
  authorize('employer'),
  updateApplicationStatus
);

// Secure resume download / inspection (Candidate owner or Employer owner)
router.get('/:id/resume', protect, downloadResume);

module.exports = router;
