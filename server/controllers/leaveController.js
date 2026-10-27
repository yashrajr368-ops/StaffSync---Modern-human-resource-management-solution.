const Leave = require('../models/Leave');
const User = require('../models/User');

// Helper to calculate days between dates (inclusive)
const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: leaveType, startDate, endDate, reason',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    const daysCount = calculateDays(start, end);
    const user = await User.findById(req.user.id);

    // Validate leave balance if paid leave type
    if (['annual', 'casual', 'sick'].includes(leaveType)) {
      const balance = user.leaveBalance[leaveType] || 0;
      if (balance < daysCount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Requested: ${daysCount} days, Available: ${balance} days.`,
        });
      }
    }

    const leave = await Leave.create({
      user: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
    });

    const populated = await Leave.findById(leave._id).populate(
      'user',
      'name email employeeId department'
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populated,
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error applying for leave',
    });
  }
};

// @desc    Get current user's leave requests & balances
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate('reviewedBy', 'name email designation')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user.id).select('leaveBalance');

    res.status(200).json({
      success: true,
      leaves,
      leaveBalance: user.leaveBalance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching leaves',
    });
  }
};

// @desc    Get all leave requests (HR / Manager)
// @route   GET /api/leaves
// @access  Private (HR, Manager, Admin)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, department } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    let leaves = await Leave.find(query)
      .populate('user', 'name email employeeId department designation leaveBalance')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    if (department && department !== 'All') {
      leaves = leaves.filter(
        (l) => l.user && l.user.department === department
      );
    }

    // If manager, filter to only see their department or supervisees (unless HR/admin)
    if (req.user.role === 'manager') {
      leaves = leaves.filter(
        (l) =>
          l.user &&
          (l.user.department === req.user.department ||
            l.user._id.toString() === req.user._id.toString())
      );
    }

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching leave records',
    });
  }
};

// @desc    Review / Approve / Reject leave
// @route   PUT /api/leaves/:id/review
// @access  Private (HR, Manager, Admin)
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave application has already been ${leave.status.toLowerCase()}`,
      });
    }

    const applicant = await User.findById(leave.user._id);

    // If approving, decrement user's leave balance
    if (status === 'Approved' && ['annual', 'casual', 'sick'].includes(leave.leaveType)) {
      const currentBalance = applicant.leaveBalance[leave.leaveType] || 0;
      applicant.leaveBalance[leave.leaveType] = Math.max(
        0,
        currentBalance - leave.daysCount
      );
      await applicant.save();
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewComment = reviewComment || (status === 'Approved' ? 'Approved by supervisor' : 'Rejected');
    leave.reviewedAt = new Date();

    await leave.save();

    const updated = await Leave.findById(leave._id)
      .populate('user', 'name email employeeId department leaveBalance')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Leave application ${status.toLowerCase()} successfully`,
      leave: updated,
    });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error reviewing leave',
    });
  }
};

// @desc    Cancel personal leave request (if pending)
// @route   DELETE /api/leaves/:id
// @access  Private
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (leave.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave application',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Leave application cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling leave',
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
};
