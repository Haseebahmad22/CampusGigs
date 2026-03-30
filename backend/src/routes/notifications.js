const express = require("express");

const { query } = require("../db/pool");
const auth = require("../middleware/auth");

const router = express.Router();

// Get my notifications
router.get("/", auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, type, message, gig_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const unreadCount = await query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );

    return res.status(200).json({
      data: result.rows.map((r) => ({
        id: r.id,
        type: r.type,
        message: r.message,
        gigId: r.gig_id,
        isRead: r.is_read,
        createdAt: r.created_at,
      })),
      unreadCount: unreadCount.rows[0]?.count || 0,
    });
  } catch (error) {
    return next(error);
  }
});

// Mark all as read
router.patch("/read", auth, async (req, res, next) => {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );
    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
