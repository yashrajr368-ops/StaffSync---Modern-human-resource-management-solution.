const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAllAnnouncements = async (req, res) => {
  try {
    const { category, priority } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email designation role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching announcements',
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'author',
      'name email designation'
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching announcement',
    });
  }
};

// @desc    Create new announcement (HR / Admin)
// @route   POST /api/announcements
// @access  Private (HR, Admin)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, targetDepartment } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      targetDepartment: targetDepartment || 'All',
      author: req.user.id,
      isActive: true,
    });

    const populated = await Announcement.findById(announcement._id).populate(
      'author',
      'name email designation role'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating announcement',
    });
  }
};

// @desc    Update announcement (HR / Admin)
// @route   PUT /api/announcements/:id
// @access  Private (HR, Admin)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const { title, content, category, priority, targetDepartment, isActive } = req.body;

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetDepartment) announcement.targetDepartment = targetDepartment;
    if (isActive !== undefined) announcement.isActive = isActive;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate(
      'author',
      'name email designation role'
    );

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating announcement',
    });
  }
};

// @desc    Delete announcement (HR / Admin)
// @route   DELETE /api/announcements/:id
// @access  Private (HR, Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting announcement',
    });
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
