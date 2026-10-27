const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

// Helper to get day bounds
const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard metrics tailored to user's role
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const userId = req.user._id;
    const { start, end } = getTodayBounds();

    // 1. Announcements (Common to all)
    const recentAnnouncements = await Announcement.find({ isActive: true })
      .populate('author', 'name designation')
      .sort({ createdAt: -1 })
      .limit(5);

    // HR / Admin Dashboard
    if (role === 'hr' || role === 'admin') {
      const totalEmployees = await User.countDocuments();
      const activeEmployees = await User.countDocuments({ status: 'Active' });

      // Today's attendance
      const todayAttendance = await Attendance.find({
        date: { $gte: start, $lte: end },
      }).populate('user', 'name department employeeId');

      const presentCount = todayAttendance.filter(
        (a) => a.status === 'Present' || a.status === 'Late'
      ).length;
      const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
      const notClockedInCount = Math.max(0, activeEmployees - presentCount);

      // Pending leaves
      const pendingLeaves = await Leave.find({ status: 'Pending' })
        .populate('user', 'name department employeeId avatar')
        .sort({ createdAt: -1 });

      // Department distribution
      const deptAggregation = await User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Active trainings
      const activeTrainingsCount = await Training.countDocuments({
        status: 'Active',
      });

      return res.status(200).json({
        success: true,
        role: 'hr',
        stats: {
          totalEmployees,
          activeEmployees,
          presentCount,
          lateCount,
          notClockedInCount,
          pendingLeavesCount: pendingLeaves.length,
          activeTrainingsCount,
        },
        departmentStats: deptAggregation,
        pendingLeaves: pendingLeaves.slice(0, 5),
        recentAttendance: todayAttendance.slice(0, 8),
        recentAnnouncements,
      });
    }

    // Manager Dashboard
    if (role === 'manager') {
      // Find team members in the same department or assigned to this manager
      const teamQuery = {
        $or: [
          { manager: userId },
          { department: req.user.department },
        ],
      };

      const teamMembers = await User.find(teamQuery).select(
        'name email department designation status employeeId'
      );
      const teamUserIds = teamMembers.map((m) => m._id);

      // Team today's attendance
      const teamAttendance = await Attendance.find({
        user: { $in: teamUserIds },
        date: { $gte: start, $lte: end },
      }).populate('user', 'name designation employeeId');

      const teamPresent = teamAttendance.filter(
        (a) => a.status === 'Present' || a.status === 'Late'
      ).length;

      // Pending leaves from team
      const pendingLeaves = await Leave.find({
        user: { $in: teamUserIds },
        status: 'Pending',
      })
        .populate('user', 'name department employeeId leaveBalance')
        .sort({ createdAt: -1 });

      // Manager's created or team trainings
      const trainings = await Training.find({
        $or: [
          { createdBy: userId },
          { 'assignedTo.user': { $in: teamUserIds } },
        ],
      })
        .populate('assignedTo.user', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        role: 'manager',
        stats: {
          teamSize: teamMembers.length,
          teamPresentToday: teamPresent,
          pendingLeavesCount: pendingLeaves.length,
          activeTrainingsCount: trainings.length,
        },
        teamMembers: teamMembers.slice(0, 8),
        pendingLeaves: pendingLeaves.slice(0, 5),
        trainings,
        recentAnnouncements,
      });
    }

    // Regular Employee Dashboard
    const user = await User.findById(userId);

    // Today's attendance
    const todayRecord = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    // My leaves stats
    const myLeaves = await Leave.find({ user: userId }).sort({ createdAt: -1 });
    const pendingMyLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
    const approvedMyLeaves = myLeaves.filter((l) => l.status === 'Approved').length;

    // My assigned trainings
    const myTrainings = await Training.find({
      'assignedTo.user': userId,
    }).populate('createdBy', 'name');

    // Add progress for current user
    const formattedTrainings = myTrainings.map((t) => {
      const assignment = t.assignedTo.find(
        (a) => a.user.toString() === userId.toString()
      );
      return {
        _id: t._id,
        title: t.title,
        category: t.category,
        durationHours: t.durationHours,
        status: assignment ? assignment.status : 'Enrolled',
        progress: assignment ? assignment.progress : 0,
        endDate: t.endDate,
      };
    });

    return res.status(200).json({
      success: true,
      role: 'employee',
      stats: {
        isClockedIn: !!(todayRecord && todayRecord.clockIn),
        isClockedOut: !!(todayRecord && todayRecord.clockOut),
        clockInTime: todayRecord?.clockIn || null,
        clockOutTime: todayRecord?.clockOut || null,
        todayHours: todayRecord?.totalHours || 0,
        leaveBalance: user.leaveBalance,
        pendingLeavesCount: pendingMyLeaves,
        approvedLeavesCount: approvedMyLeaves,
        enrolledTrainingsCount: formattedTrainings.length,
      },
      todayAttendance: todayRecord,
      recentLeaves: myLeaves.slice(0, 5),
      trainings: formattedTrainings.slice(0, 5),
      recentAnnouncements,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error loading dashboard analytics',
    });
  }
};

module.exports = {
  getDashboardStats,
};
