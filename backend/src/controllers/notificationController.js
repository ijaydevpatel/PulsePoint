import Notification from '../models/Notification.js';

// @desc    Retrieve persistent Notification state structures
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Cap at 50 recent notifications

    res.json({
        unreadCount: notifications.filter(n => !n.read).length,
        notifications: notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          time: n.createdAt,
          type: n.type,
          read: n.read,
          metadata: n.metadata
        }))
    });

  } catch (error) {
    res.status(500).json({ message: 'Notification Core Fault', error: error.message });
  }
};

// @desc    Mark specific or global clusters as visually read via the database
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  try {
      const { ids } = req.body; // Array of notification IDs, or empty for all

      if (ids && ids.length > 0) {
        await Notification.updateMany(
          { _id: { $in: ids }, user: req.auth.userId },
          { $set: { read: true } }
        );
      } else {
        await Notification.updateMany(
          { user: req.auth.userId, read: false },
          { $set: { read: true } }
        );
      }

      res.json({ status: 'OK', message: 'Read flags natively synchronized into the DB Payload.' });
  } catch (err) {
      res.status(500).json({ message: 'DB Sync Flagging Failed', error: err.message });
  }
};

