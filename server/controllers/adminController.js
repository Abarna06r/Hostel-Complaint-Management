const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Category = require('../models/Category');

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      totalStudents,
      urgentComplaintsCount,
      highPriorityComplaintsCount,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Assigned' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Rejected' }),
      User.countDocuments({ role: 'student' }),
      Complaint.countDocuments({ priority: 'Urgent', status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ priority: 'High', status: { $ne: 'Resolved' } }),
    ]);

    // Complaints by category aggregation
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Complaints by hostel aggregation
    const hostelStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$hostel',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent 6 complaints
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'name studentId email roomNumber hostel block')
      .populate('assignedTo.user', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    // Critical attention complaints (Urgent & High that are not resolved)
    const criticalComplaints = await Complaint.find({
      priority: { $in: ['Urgent', 'High'] },
      status: { $nin: ['Resolved', 'Rejected'] },
    })
      .populate('submittedBy', 'name studentId roomNumber hostel')
      .sort({ priority: 1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        pending: pendingComplaints,
        assigned: assignedComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        rejected: rejectedComplaints,
        students: totalStudents,
        urgentUnresolved: urgentComplaintsCount,
        highUnresolved: highPriorityComplaintsCount,
      },
      categoryStats,
      hostelStats,
      recentComplaints,
      criticalComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with comprehensive search & filtering
// @route   GET /api/admin/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res, next) => {
  try {
    const {
      search,
      status,
      category,
      priority,
      hostel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (hostel && hostel !== 'all') {
      query.hostel = hostel;
    }

    // Text search in title, description, complaintId, roomNumber, or submittedBy student
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Also search students by name or studentId
      const matchingStudents = await User.find({
        $or: [{ name: searchRegex }, { studentId: searchRegex }],
      }).select('_id');

      const studentIds = matchingStudents.map((s) => s._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { complaintId: searchRegex },
        { roomNumber: searchRegex },
        { location: searchRegex },
        { submittedBy: { $in: studentIds } },
      ];
    }

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('submittedBy', 'name studentId email phone hostel block roomNumber')
        .populate('assignedTo.user', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize),
      Complaint.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & remarks
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    if (remarks) complaint.adminRemarks = remarks.trim();

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolution = {
        notes: remarks || 'Resolved by administration',
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      };
    }

    // Add timeline entry
    complaint.timeline.push({
      status,
      remarks: remarks || `Status changed from ${oldStatus} to ${status}`,
      updatedBy: req.user._id,
      updatedByName: `${req.user.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.submittedBy._id,
      title: `Complaint Status Updated: ${status}`,
      message: `Your complaint "${complaint.title}" (${complaint.complaintId}) is now "${status}". ${remarks ? 'Remarks: ' + remarks : ''}`,
      type: status === 'Resolved' ? 'resolved' : status === 'Rejected' ? 'rejected' : 'status_updated',
      complaint: complaint._id,
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to admin or maintenance staff
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedUserId, assignedUserName, remarks } = req.body;

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Determine assignee
    let assigneeName = assignedUserName || req.user.name;
    let assigneeId = req.user._id;

    if (assignedUserId) {
      const assignedUser = await User.findById(assignedUserId);
      if (assignedUser) {
        assigneeId = assignedUser._id;
        assigneeName = assignedUser.name;
      }
    }

    complaint.assignedTo = {
      user: assigneeId,
      name: assigneeName,
      assignedAt: new Date(),
    };

    if (complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }

    if (remarks) {
      complaint.adminRemarks = remarks.trim();
    }

    complaint.timeline.push({
      status: complaint.status,
      remarks: `Assigned to ${assigneeName}. ${remarks ? 'Notes: ' + remarks : ''}`,
      updatedBy: req.user._id,
      updatedByName: `${req.user.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.submittedBy._id,
      title: 'Complaint Assigned',
      message: `Your complaint "${complaint.title}" (${complaint.complaintId}) has been assigned to ${assigneeName} for resolution.`,
      type: 'assigned',
      complaint: complaint._id,
    });

    res.status(200).json({
      success: true,
      message: `Complaint assigned to ${assigneeName}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve complaint with resolution details
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private (Admin)
exports.resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!resolutionNotes || !resolutionNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resolution notes explaining how the issue was fixed.',
      });
    }

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.resolution = {
      notes: resolutionNotes.trim(),
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
    };

    complaint.timeline.push({
      status: 'Resolved',
      remarks: `Resolution: ${resolutionNotes.trim()}`,
      updatedBy: req.user._id,
      updatedByName: `${req.user.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.submittedBy._id,
      title: 'Complaint Resolved',
      message: `Your complaint "${complaint.title}" (${complaint.complaintId}) has been marked as Resolved. Notes: ${resolutionNotes.trim()}`,
      type: 'resolved',
      complaint: complaint._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint successfully marked as Resolved!',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject complaint with reason
// @route   PUT /api/admin/complaints/:id/reject
// @access  Private (Admin)
exports.rejectComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear reason for rejecting the complaint.',
      });
    }

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Rejected';
    complaint.rejectionReason = rejectionReason.trim();

    complaint.timeline.push({
      status: 'Rejected',
      remarks: `Complaint rejected. Reason: ${rejectionReason.trim()}`,
      updatedBy: req.user._id,
      updatedByName: `${req.user.name} (Admin)`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.submittedBy._id,
      title: 'Complaint Rejected',
      message: `Your complaint "${complaint.title}" (${complaint.complaintId}) was rejected. Reason: ${rejectionReason.trim()}`,
      type: 'rejected',
      complaint: complaint._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint has been marked as Rejected.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with complaint counts
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { search, hostel, page = 1, limit = 15 } = req.query;

    const query = { role: 'student' };

    if (hostel && hostel !== 'all') {
      query.hostel = hostel;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { roomNumber: searchRegex },
        { phone: searchRegex },
      ];
    }

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 15;
    const skip = (pageNumber - 1) * pageSize;

    const [students, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query),
    ]);

    // Attach complaint counts for each student
    const studentIds = students.map((s) => s._id);
    const complaintCounts = await Complaint.aggregate([
      { $match: { submittedBy: { $in: studentIds } } },
      {
        $group: {
          _id: '$submittedBy',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = {};
    complaintCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        total: c.total,
        pending: c.pending,
        resolved: c.resolved,
      };
    });

    const studentsWithCounts = students.map((student) => ({
      ...student.toObject(),
      complaintStats: countMap[student._id.toString()] || {
        total: 0,
        pending: 0,
        resolved: 0,
      },
    }));

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      students: studentsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed student information and complaint history
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
exports.getStudentDetails = async (req, res, next) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
    }).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const complaints = await Complaint.find({ submittedBy: student._id })
      .sort({ createdAt: -1 });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Pending').length,
      inProgress: complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
      rejected: complaints.filter((c) => c.status === 'Rejected').length,
    };

    res.status(200).json({
      success: true,
      student,
      stats,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};
