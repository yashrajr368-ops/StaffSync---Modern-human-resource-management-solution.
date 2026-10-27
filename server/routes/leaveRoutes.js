const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(applyLeave)
  .get(authorize('hr', 'manager', 'admin'), getAllLeaves);

router.get('/my-leaves', getMyLeaves);
router.put('/:id/review', authorize('hr', 'manager', 'admin'), reviewLeave);
router.delete('/:id', cancelLeave);

module.exports = router;
