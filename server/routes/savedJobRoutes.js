const express = require('express');
const {
  getSavedJobs,
  saveJob,
  unsaveJob,
  checkSaved,
} = require('../controllers/savedJobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('candidate'));

router.get('/', getSavedJobs);
router.get('/check/:jobId', checkSaved);
router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);

module.exports = router;
