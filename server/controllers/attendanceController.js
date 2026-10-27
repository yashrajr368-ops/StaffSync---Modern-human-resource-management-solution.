const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get start and end of day in UTC/Local
const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Clock in for today
// @route   POST /api/attendance/clock-in
// @access  Private (Employee, Manager, HR)
const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const { start, end } = getDayBounds(now);

    // Check if user already clocked in today
    let record = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    if (record && record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today',
        attendance: record,
      });
    }

    // Determine status (Late if after 9:30 AM local time)
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const isLate = currentHours > 9 || (currentHours === 9 && currentMinutes > 30);
    const status = isLate ? 'Late' : 'Present';

    if (!record) {
      record = await Attendance.create({
        user: userId,
        date: start,
        clockIn: now,
        status,
        notes: req.body.notes || (isLate ? 'Late Arrival' : 'On-time'),
      });
    } else {
      record.clockIn = now;
      record.status = status;
      if (req.body.notes) record.notes = req.body.notes;
      await record.save();
    }

    res.status(200).json({
      success: true,
      message: `Clock-in successful at ${now.toLocaleTimeString()}`,
      attendance: record,
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during clock-in',
    });
  }
};

// @desc    Clock out for today
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const { start, end } = getDayBounds(now);

    const record = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You must clock in before clocking out',
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out for today',
        attendance: record,
      });
    }

    record.clockOut = now;

    // Calculate total hours worked
    const diffMs = record.clockOut - record.clockIn;
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.totalHours = diffHours;

    // If worked less than 4.5 hours, mark as Half-day
    if (diffHours < 4.5 && record.status !== 'On-Leave') {
      record.status = 'Half-day';
    }

    if (req.body.notes) {
      record.notes = `${record.notes} | ${req.body.notes}`.trim();
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Clock-out successful at ${now.toLocaleTimeString()}. Total hours: ${diffHours}h`,
      attendance: record,
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during clock-out',
    });
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const { start, end } = getDayBounds(new Date());

    const record = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: start, $lte: end },
    });

    res.status(200).json({
      success: true,
      attendance: record || null,
      isClockedIn: !!(record && record.clockIn),
      isClockedOut: !!(record && record.clockOut),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting today status',
    });
  }
};

// @desc    Get user's personal attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendanceHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { user: req.user.id };

    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalDaysPresent = records.filter(
      (r) => r.status === 'Present' || r.status === 'Late'
    ).length;
    const totalLate = records.filter((r) => r.status === 'Late').length;
    const totalHalfDay = records.filter((r) => r.status === 'Half-day').length;
    const totalHours = records.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

    res.status(200).json({
      success: true,
      records,
      stats: {
        totalDays: records.length,
        totalDaysPresent,
        totalLate,
        totalHalfDay,
        totalHours: parseFloat(totalHours.toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching attendance history',
    });
  }
};

// @desc    Get all attendance records (HR / Manager)
// @route   GET /api/attendance/all
// @access  Private (HR, Manager, Admin)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status, employeeId } = req.query;
    let query = {};

    if (date) {
      const selected = new Date(date);
      const { start, end } = getDayBounds(selected);
      query.date = { $gte: start, $lte: end };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate('user', 'name email employeeId department designation')
      .sort({ date: -1, clockIn: -1 });

    // Filter by department or employeeId if provided
    if (department && department !== 'All') {
      records = records.filter(
        (r) => r.user && r.user.department === department
      );
    }

    if (employeeId) {
      records = records.filter(
        (r) =>
          r.user &&
          (r.user.employeeId?.toLowerCase().includes(employeeId.toLowerCase()) ||
            r.user.name?.toLowerCase().includes(employeeId.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching organization attendance',
    });
  }
};

// @desc    Update attendance record (HR/Admin manual override)
// @route   PUT /api/attendance/:id
// @access  Private (HR, Admin)
const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    const { status, clockIn, clockOut, notes } = req.body;
    if (status) record.status = status;
    if (clockIn) record.clockIn = new Date(clockIn);
    if (clockOut) {
      record.clockOut = new Date(clockOut);
      const diffMs = record.clockOut - (record.clockIn || record.clockOut);
      record.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }
    if (notes) record.notes = notes;

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating attendance record',
    });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendance,
  updateAttendance,
};
