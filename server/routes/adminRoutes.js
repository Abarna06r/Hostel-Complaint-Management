const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  resolveComplaint,
  rejectComplaint,
  getAllStudents,
  getStudentDetails,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/assign', assignComplaint);
router.put('/complaints/:id/resolve', resolveComplaint);
router.put('/complaints/:id/reject', rejectComplaint);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);

module.exports = router;
