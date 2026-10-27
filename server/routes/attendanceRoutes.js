const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendance,
  updateAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);
router.get('/all', authorize('hr', 'manager', 'admin'), getAllAttendance);
router.put('/:id', authorize('hr', 'admin'), updateAttendance);

module.exports = router;
