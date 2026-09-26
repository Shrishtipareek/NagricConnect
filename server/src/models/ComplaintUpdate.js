const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      required: [true, 'Status is required'],
    },
    message: {
      type: String,
      required: [true, 'Update message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Updated by reference is required'],
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

complaintUpdateSchema.index({ complaint: 1, createdAt: 1 });

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);
