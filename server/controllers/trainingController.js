const Training = require('../models/Training');
const User = require('../models/User');

// @desc    Get all training programs
// @route   GET /api/training
// @access  Private
const getAllTrainings = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email designation')
      .populate('assignedTo.user', 'name email employeeId department designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching training programs',
    });
  }
};

// @desc    Get single training program
// @route   GET /api/training/:id
// @access  Private
const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email designation department')
      .populate('assignedTo.user', 'name email employeeId department designation avatar');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    res.status(200).json({
      success: true,
      training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching training program',
    });
  }
};

// @desc    Create new training program (Manager / HR)
// @route   POST /api/training
// @access  Private (Manager, HR, Admin)
const createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      trainer,
      durationHours,
      startDate,
      endDate,
      assignedEmployeeIds = [],
      materialsUrl,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide program title and description',
      });
    }

    // Format assigned employees list
    const assignedTo = assignedEmployeeIds.map((userId) => ({
      user: userId,
      status: 'Enrolled',
      progress: 0,
    }));

    const training = await Training.create({
      title,
      description,
      category: category || 'Technical Skills',
      trainer: trainer || req.user.name,
      durationHours: durationHours || 8,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy: req.user.id,
      assignedTo,
      materialsUrl: materialsUrl || '',
    });

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email employeeId department');

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      training: populated,
    });
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating training program',
    });
  }
};

// @desc    Update training program
// @route   PUT /api/training/:id
// @access  Private (Manager, HR, Admin)
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const {
      title,
      description,
      category,
      trainer,
      durationHours,
      startDate,
      endDate,
      status,
      materialsUrl,
      assignedEmployeeIds,
    } = req.body;

    if (title) training.title = title;
    if (description) training.description = description;
    if (category) training.category = category;
    if (trainer) training.trainer = trainer;
    if (durationHours !== undefined) training.durationHours = durationHours;
    if (startDate) training.startDate = startDate;
    if (endDate !== undefined) training.endDate = endDate;
    if (status) training.status = status;
    if (materialsUrl !== undefined) training.materialsUrl = materialsUrl;

    if (assignedEmployeeIds && Array.isArray(assignedEmployeeIds)) {
      // Add any newly assigned employees that aren't already in list
      const existingIds = training.assignedTo.map((a) => a.user.toString());
      assignedEmployeeIds.forEach((id) => {
        if (!existingIds.includes(id)) {
          training.assignedTo.push({
            user: id,
            status: 'Enrolled',
            progress: 0,
          });
        }
      });
    }

    await training.save();

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email employeeId department');

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      training: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating training program',
    });
  }
};

// @desc    Update employee's own training progress
// @route   PUT /api/training/:id/progress
// @access  Private
const updateTrainingProgress = async (req, res) => {
  try {
    const { progress, status, feedback } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    // Find user in assignedTo array
    let assignment = training.assignedTo.find(
      (a) => a.user.toString() === req.user.id
    );

    if (!assignment) {
      // If not yet enrolled, auto-enroll self
      assignment = {
        user: req.user.id,
        status: status || 'In-Progress',
        progress: progress || 10,
        feedback: feedback || '',
      };
      training.assignedTo.push(assignment);
    } else {
      if (progress !== undefined) assignment.progress = Math.min(100, Math.max(0, Number(progress)));
      if (status) assignment.status = status;
      if (feedback !== undefined) assignment.feedback = feedback;
      if (Number(progress) === 100 || status === 'Completed') {
        assignment.status = 'Completed';
        assignment.progress = 100;
        assignment.completedAt = new Date();
      }
    }

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email employeeId department');

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully',
      training: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating progress',
    });
  }
};

// @desc    Delete training program
// @route   DELETE /api/training/:id
// @access  Private (Manager, HR, Admin)
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting training program',
    });
  }
};

module.exports = {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  updateTrainingProgress,
  deleteTraining,
};
