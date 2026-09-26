const Complaint = require('../models/Complaint');

/**
 * Generates a unique complaint ID in format: NC-YYYY-NNNNNN
 * Example: NC-2026-000001
 */
const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const prefix = `NC-${year}-`;

  // Find the latest complaint for this year
  const latestComplaint = await Complaint.findOne({
    complaintId: { $regex: `^${prefix}` },
  })
    .sort({ complaintId: -1 })
    .select('complaintId')
    .lean();

  let nextNumber = 1;

  if (latestComplaint) {
    const lastNumber = parseInt(latestComplaint.complaintId.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

module.exports = generateComplaintId;
