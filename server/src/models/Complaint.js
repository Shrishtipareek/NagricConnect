const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required'],
    },
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Road',
          'Street Light',
          'Water Supply',
          'Drainage',
          'Garbage',
          'Electricity',
          'Public Toilet',
          'Government Service',
          'School',
          'Health',
          'Agriculture',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    location: {
      address: {
        type: String,
        trim: true,
        default: '',
      },
      ward: {
        type: String,
        trim: true,
        default: '',
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
      },
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    contactPreference: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        maxlength: [500, 'Feedback comment cannot exceed 500 characters'],
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
complaintSchema.index({ villageId: 1 });
complaintSchema.index({ villageId: 1, citizen: 1, createdAt: -1 });
complaintSchema.index({ villageId: 1, status: 1 });
complaintSchema.index({ villageId: 1, category: 1 });
complaintSchema.index({ villageId: 1, 'location.ward': 1 });
complaintSchema.index({ createdAt: -1 });

// GeoJSON 2dsphere index (only if coordinates are present)
complaintSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Complaint', complaintSchema);
