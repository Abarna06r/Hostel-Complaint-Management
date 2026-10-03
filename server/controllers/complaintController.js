const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      hostel,
      block,
      roomNumber,
      priority,
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, and location',
      });
    }

    // Attachments if file was uploaded via multer
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
      });
    } else if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          filename: file.originalname,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
        });
      });
    }

    const complaint = new Complaint({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      hostel: (hostel || req.user.hostel || 'Main Hostel').trim(),
      block: (block || req.user.block || 'A').trim(),
      roomNumber: (roomNumber || req.user.roomNumber || '101').trim(),
      priority: priority || 'Medium',
      status: 'Pending',
      submittedBy: req.user._id,
      attachments,
      timeline: [
        {
          status: 'Pending',
          remarks: 'Complaint registered successfully by student.',
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          timestamp: new Date(),
        },
      ],
    });

    await complaint.save();

    // Create confirmation notification for student
    await Notification.create({
      user: req.user._id,
      title: 'Complaint Registered',
      message: `Your complaint "${complaint.title}" has been registered successfully with ID ${complaint.complaintId}.`,
      type: 'complaint_created',
      complaint: complaint._id,
    });

    // Notify admins of new complaint
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map((admin) => ({
      user: admin._id,
      title: 'New Hostel Complaint',
      message: `New [${complaint.priority}] complaint "${complaint.title}" submitted by ${req.user.name} (${complaint.hostel} - Rm ${complaint.roomNumber}).`,
      type: 'complaint_created',
      complaint: complaint._id,
    }));
    if (adminNotifications.length > 0) {
      await Notification.insertMany(adminNotifications);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints submitted by the logged-in student
// @route   GET /api/complaints
// @access  Private (Student)
exports.getMyComplaints = async (req, res, next) => {
  try {
    const {
      search,
      status,
      category,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { submittedBy: req.user._id };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Text search in title, description, or complaintId
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { complaintId: searchRegex },
        { location: searchRegex },
      ];
    }

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('submittedBy', 'name studentId email roomNumber hostel block')
        .populate('assignedTo.user', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize),
      Complaint.countDocuments(query),
    ]);

    // Student summary stats
    const [pendingCount, inProgressCount, resolvedCount, rejectedCount] = await Promise.all([
      Complaint.countDocuments({ submittedBy: req.user._id, status: 'Pending' }),
      Complaint.countDocuments({
        submittedBy: req.user._id,
        status: { $in: ['Assigned', 'In Progress'] },
      }),
      Complaint.countDocuments({ submittedBy: req.user._id, status: 'Resolved' }),
      Complaint.countDocuments({ submittedBy: req.user._id, status: 'Rejected' }),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      stats: {
        total,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      },
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint details by ID (Accessible by student owner or admin)
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is MongoDB ObjectId or complaintId string (e.g. CMP-...)
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { complaintId: id };

    const complaint = await Complaint.findOne(query)
      .populate('submittedBy', 'name studentId email phone hostel block roomNumber gender')
      .populate('assignedTo.user', 'name email phone role')
      .populate('resolution.resolvedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found with provided ID',
      });
    }

    // Role check: If student, must be the submitter
    if (
      req.user.role === 'student' &&
      complaint.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this complaint.',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit complaint (Only pending complaints can be updated by student)
// @route   PUT /api/complaints/:id
// @access  Private (Student)
exports.updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, priority } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own complaints.',
      });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit complaint. It is currently "${complaint.status}". Only Pending complaints can be modified.`,
      });
    }

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (category) complaint.category = category.trim();
    if (location) complaint.location = location.trim();
    if (priority) complaint.priority = priority;

    complaint.timeline.push({
      status: 'Pending',
      remarks: 'Complaint details updated by student.',
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/delete a pending complaint (Student)
// @route   DELETE /api/complaints/:id
// @access  Private (Student)
exports.deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own complaints.',
      });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete complaint. It is currently "${complaint.status}". Only Pending complaints can be cancelled.`,
      });
    }

    await Complaint.findByIdAndDelete(id);

    // Delete associated notifications or notify
    await Notification.deleteMany({ complaint: id });

    res.status(200).json({
      success: true,
      message: 'Complaint cancelled and deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
