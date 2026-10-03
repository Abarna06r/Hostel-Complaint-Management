const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('student'), upload.single('attachment'), createComplaint);
router.get('/', protect, authorize('student'), getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, authorize('student'), updateComplaint);
router.delete('/:id', protect, authorize('student'), deleteComplaint);

module.exports = router;
