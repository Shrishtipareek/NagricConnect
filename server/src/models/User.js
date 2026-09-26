const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'SARPANCH', 'SUPER_ADMIN'],
      default: 'CITIZEN',
    },
    sarpanchStatus: {
      type: String,
      enum: ['NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_APPLICABLE',
    },
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: false, // Not required for SUPER_ADMIN
    },
    location: {
      countryId: { type: String, default: 'IN' },
      countryName: { type: String, default: 'India' },
      stateId: { type: String, default: '' },
      stateName: { type: String, default: '' },
      districtId: { type: String, default: '' },
      districtName: { type: String, default: '' },
      subDistrictId: { type: String, default: '' },
      subDistrictName: { type: String, default: '' },
      villageId: { type: String, default: '' },
      villageName: { type: String, default: '' },
      lgdCode: { type: String, default: '' },
    },
    ward: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups
userSchema.index({ role: 1 });
userSchema.index({ villageId: 1, ward: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
