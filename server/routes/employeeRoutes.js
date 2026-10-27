const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAllEmployees)
  .post(authorize('hr', 'admin'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('hr', 'admin', 'manager'), updateEmployee)
  .delete(authorize('hr', 'admin'), deleteEmployee);

module.exports = router;
