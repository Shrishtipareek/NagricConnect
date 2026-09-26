const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a specific user
 */
const createNotification = async ({ recipient, title, message, type, complaint = null }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      complaint,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Notify all Sarpanch users about a new complaint
 */
const notifySarpanchNewComplaint = async (complaint) => {
  try {
    const sarpanches = await User.find({ 
      role: 'SARPANCH', 
      sarpanchStatus: 'APPROVED',
      isActive: true, 
      villageId: complaint.villageId 
    }).select('_id');
    const notifications = sarpanches.map((s) => ({
      recipient: s._id,
      title: 'New Complaint Received',
      message: `New complaint received: ${complaint.complaintId} — ${complaint.title}`,
      type: 'COMPLAINT_UPDATE',
      complaint: complaint._id,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying sarpanch:', error.message);
  }
};

/**
 * Notify citizen about complaint status change
 */
const notifyCitizenStatusChange = async (complaint, newStatus) => {
  try {
    const statusLabels = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };

    let title = 'Complaint Status Updated';
    let message = `Your complaint ${complaint.complaintId} is now ${statusLabels[newStatus]}.`;

    if (newStatus === 'COMPLETED') {
      title = 'Complaint Resolved';
      message = `Your complaint ${complaint.complaintId} has been completed. Please share your feedback.`;
    }

    await createNotification({
      recipient: complaint.citizen,
      title,
      message,
      type: 'COMPLAINT_UPDATE',
      complaint: complaint._id,
    });
  } catch (error) {
    console.error('Error notifying citizen:', error.message);
  }
};

/**
 * Notify citizens about a new important notice
 */
const notifyCitizensNewNotice = async (notice) => {
  try {
    if (notice.priority === 'NORMAL') return; // Only notify for important/urgent

    const citizens = await User.find({ 
      role: 'CITIZEN', 
      isActive: true,
      villageId: notice.villageId
    }).select('_id');
    const notifications = citizens.map((c) => ({
      recipient: c._id,
      title: 'New Notice Published',
      message: `${notice.priority === 'URGENT' ? '🚨 URGENT: ' : ''}${notice.title}`,
      type: 'NOTICE',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying citizens about notice:', error.message);
  }
};

module.exports = {
  createNotification,
  notifySarpanchNewComplaint,
  notifyCitizenStatusChange,
  notifyCitizensNewNotice,
};
