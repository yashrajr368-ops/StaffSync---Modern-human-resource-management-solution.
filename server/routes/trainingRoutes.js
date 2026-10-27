const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  updateTrainingProgress,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAllTrainings)
  .post(authorize('hr', 'manager', 'admin'), createTraining);

router
  .route('/:id')
  .get(getTrainingById)
  .put(authorize('hr', 'manager', 'admin'), updateTraining)
  .delete(authorize('hr', 'manager', 'admin'), deleteTraining);

router.put('/:id/progress', updateTrainingProgress);

module.exports = router;
