const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'GENERAL',
          'EMERGENCY',
          'MEETING',
          'GOVERNMENT',
          'WATER',
          'ELECTRICITY',
          'HEALTH',
          'EDUCATION',
          'OTHER',
        ],
        message: '{VALUE} is not a valid notice category',
      },
      default: 'GENERAL',
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'IMPORTANT', 'URGENT'],
      default: 'NORMAL',
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Publisher reference is required'],
    },
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ villageId: 1, isPublished: 1, publishedAt: -1 });
noticeSchema.index({ villageId: 1, category: 1 });
noticeSchema.index({ villageId: 1, priority: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
