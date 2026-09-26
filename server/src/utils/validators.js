const validator = require('validator');
const mongoose = require('mongoose');

/**
 * Validate registration input
 */
const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || !data.name.trim()) {
    errors.push('Name is required');
  } else if (data.name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Please provide a valid email');
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.push('Please provide a valid 10-digit Indian phone number');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.location) {
    if (!data.villageId) {
      errors.push('Village selection is required');
    }
  } else {
    if (!data.location.countryId && !data.location.countryName) {
      errors.push('Country selection is required');
    }
    if (!data.location.stateId && !data.location.stateName) {
      errors.push('State selection is required');
    }
    if (!data.location.districtId && !data.location.districtName) {
      errors.push('District selection is required');
    }
    if (!data.location.villageId && !data.location.villageName) {
      errors.push('Village selection is required');
    }
  }

  return errors;
};

/**
 * Validate login input
 */
const validateLogin = (data) => {
  const errors = [];

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Please provide a valid email');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return errors;
};

/**
 * Validate complaint input
 */
const validateComplaint = (data) => {
  const errors = [];
  const validCategories = [
    'Road', 'Street Light', 'Water Supply', 'Drainage',
    'Garbage', 'Electricity', 'Public Toilet', 'Government Service',
    'School', 'Health', 'Agriculture', 'Other',
  ];

  if (!data.title || !data.title.trim()) {
    errors.push('Complaint title is required');
  } else if (data.title.trim().length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (!data.description || !data.description.trim()) {
    errors.push('Description is required');
  } else if (data.description.trim().length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  if (!data.category) {
    errors.push('Category is required');
  } else if (!validCategories.includes(data.category)) {
    errors.push('Invalid category selected');
  }

  return errors;
};

/**
 * Validate notice input
 */
const validateNotice = (data) => {
  const errors = [];
  const validCategories = [
    'GENERAL', 'EMERGENCY', 'MEETING', 'GOVERNMENT',
    'WATER', 'ELECTRICITY', 'HEALTH', 'EDUCATION', 'OTHER',
  ];
  const validPriorities = ['NORMAL', 'IMPORTANT', 'URGENT'];

  if (!data.title || !data.title.trim()) {
    errors.push('Notice title is required');
  } else if (data.title.trim().length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (!data.content || !data.content.trim()) {
    errors.push('Notice content is required');
  } else if (data.content.trim().length > 5000) {
    errors.push('Content cannot exceed 5000 characters');
  }

  if (data.category && !validCategories.includes(data.category)) {
    errors.push('Invalid notice category');
  }

  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  return errors;
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate status update
 */
const validateStatusUpdate = (data) => {
  const errors = [];
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  if (!data.status) {
    errors.push('Status is required');
  } else if (!validStatuses.includes(data.status)) {
    errors.push('Invalid status. Must be PENDING, IN_PROGRESS, or COMPLETED');
  }

  if (!data.message || !data.message.trim()) {
    errors.push('Update message is required');
  } else if (data.message.trim().length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }

  return errors;
};

/**
 * Validate feedback input
 */
const validateFeedback = (data) => {
  const errors = [];

  if (!data.rating) {
    errors.push('Rating is required');
  } else {
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
  }

  if (data.comment && data.comment.length > 500) {
    errors.push('Feedback comment cannot exceed 500 characters');
  }

  return errors;
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateComplaint,
  validateNotice,
  isValidObjectId,
  validateStatusUpdate,
  validateFeedback,
};
