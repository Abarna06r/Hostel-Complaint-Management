const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedByName: {
    type: String,
    default: 'System',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed complaint description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please specify issue location'],
      trim: true,
    },
    hostel: {
      type: String,
      required: [true, 'Please specify hostel name'],
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Please specify block'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please specify room number'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        default: '',
      },
      assignedAt: {
        type: Date,
      },
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    resolution: {
      notes: {
        type: String,
        default: '',
      },
      resolvedAt: {
        type: Date,
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
    timeline: [timelineItemSchema],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate human-friendly unique complaint ID before initial validation/save
complaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    const dateStr = new Date().getFullYear().toString();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const count = await mongoose.model('Complaint').countDocuments();
    const sequential = String(count + 1).padStart(4, '0');
    this.complaintId = `CMP-${dateStr}-${sequential}${randomHex.toString().slice(-2)}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
