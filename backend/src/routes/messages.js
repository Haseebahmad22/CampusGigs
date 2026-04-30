const express = require("express");

const { query } = require("../db/pool");
const auth = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_LENGTH = 4000;

function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}

router.param("gigId", (req, res, next, id) => {
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid gig id." });
  return next();
});

async function loadGigForMessaging(gigId, userId) {
  const result = await query(
    `SELECT id, client_id, freelancer_id, status, title FROM gigs WHERE id = $1`,
    [gigId]
  );
  const gig = result.rows[0];
  if (!gig) return { error: { status: 404, message: "Gig not found." } };

  const isParticipant = gig.client_id === userId || gig.freelancer_id === userId;
  if (!isParticipant) {
    return { error: { status: 403, message: "Not a participant on this gig." } };
  }
  if (!gig.freelancer_id) {
    return { error: { status: 400, message: "Messaging opens once a proposal is accepted." } };
  }
  return { gig };
}

function mapMessage(row) {
  return {
    id: row.id,
    gigId: row.gig_id,
    senderId: row.sender_id,
    senderName: row.sender_name || null,
    senderAvatar: row.sender_avatar || null,
    body: row.body,
    createdAt: row.created_at,
  };
}

// List messages for a gig
router.get("/", auth, async (req, res, next) => {
  try {
    const gigId = req.params.gigId;
    const { gig, error } = await loadGigForMessaging(gigId, req.user.id);
    if (error) return res.status(error.status).json({ error: error.message });

    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
    const result = await query(
      `SELECT m.*, u.full_name AS sender_name, fp.avatar_url AS sender_avatar
       FROM gig_messages m
       INNER JOIN users u ON u.id = m.sender_id
       LEFT JOIN freelancer_profiles fp ON fp.user_id = m.sender_id
       WHERE m.gig_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [gig.id, limit]
    );

    return res.status(200).json({ data: result.rows.map(mapMessage) });
  } catch (error) {
    return next(error);
  }
});

// Send a message
router.post("/", auth, async (req, res, next) => {
  try {
    const gigId = req.params.gigId;
    const { gig, error } = await loadGigForMessaging(gigId, req.user.id);
    if (error) return res.status(error.status).json({ error: error.message });

    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
    if (!body) return res.status(400).json({ error: "Message cannot be empty." });
    if (body.length > MAX_BODY_LENGTH) {
      return res.status(400).json({ error: `Message must be under ${MAX_BODY_LENGTH} characters.` });
    }

    const inserted = await query(
      `INSERT INTO gig_messages (gig_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [gig.id, req.user.id, body]
    );

    const senderRes = await query(
      `SELECT u.full_name, fp.avatar_url
       FROM users u
       LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const sender = senderRes.rows[0] || {};

    const recipientId = gig.client_id === req.user.id ? gig.freelancer_id : gig.client_id;
    if (recipientId) {
      const senderName = sender.full_name || "Someone";
      const preview = body.length > 80 ? `${body.slice(0, 77)}...` : body;
      await query(
        `INSERT INTO notifications (user_id, type, message, gig_id) VALUES ($1, $2, $3, $4)`,
        [recipientId, "new_message", `${senderName} on "${gig.title}": ${preview}`, gig.id]
      );
    }

    const row = inserted.rows[0];
    row.sender_name = sender.full_name || null;
    row.sender_avatar = sender.avatar_url || null;

    return res.status(201).json(mapMessage(row));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
