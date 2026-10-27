const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAllAnnouncements)
  .post(authorize('hr', 'admin'), createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncementById)
  .put(authorize('hr', 'admin'), updateAnnouncement)
  .delete(authorize('hr', 'admin'), deleteAnnouncement);

module.exports = router;
