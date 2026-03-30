const express = require("express");

const { query } = require("../db/pool");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// POST /api/reviews — client submits review for a closed gig
router.post("/", auth, requireRole("client"), async (req, res, next) => {
  try {
    const { gigId, rating, comment } = req.body;

    if (!gigId) return res.status(400).json({ error: "Gig ID is required." });

    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Verify gig exists, belongs to this client, and is closed
    const gigResult = await query(`SELECT * FROM gigs WHERE id = $1`, [gigId]);
    const gig = gigResult.rows[0];

    if (!gig) return res.status(404).json({ error: "Gig not found." });
    if (gig.client_id !== req.user.id) return res.status(403).json({ error: "Not your gig." });
    if (gig.status !== "closed") return res.status(400).json({ error: "Can only review completed gigs." });
    if (!gig.freelancer_id) return res.status(400).json({ error: "No freelancer assigned to this gig." });

    // Check if already reviewed
    const existing = await query(
      `SELECT id FROM reviews WHERE client_id = $1 AND gig_id = $2`,
      [req.user.id, gigId]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "You have already reviewed this gig." });
    }

    // Insert review
    const result = await query(
      `INSERT INTO reviews (freelancer_id, client_id, gig_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [gig.freelancer_id, req.user.id, gigId, numRating, comment?.trim() || null]
    );

    // Recalculate freelancer average rating
    const stats = await query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating, COUNT(*)::int AS total
       FROM reviews WHERE freelancer_id = $1`,
      [gig.freelancer_id]
    );

    await query(
      `UPDATE freelancer_profiles SET average_rating = $1 WHERE user_id = $2`,
      [Number(stats.rows[0].avg_rating), gig.freelancer_id]
    );

    // Notify freelancer
    const clientName = await query(`SELECT full_name FROM users WHERE id = $1`, [req.user.id]);
    const name = clientName.rows[0]?.full_name || "A client";
    await query(
      `INSERT INTO notifications (user_id, type, message, gig_id)
       VALUES ($1, $2, $3, $4)`,
      [gig.freelancer_id, "new_review", `${name} left a ${numRating}-star review for "${gig.title}"`, gigId]
    );

    return res.status(201).json({
      id: result.rows[0].id,
      rating: Number(result.rows[0].rating),
      comment: result.rows[0].comment,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/reviews/gig/:gigId — check if review exists for a gig (for the logged-in client)
router.get("/gig/:gigId", auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, rating, comment, created_at FROM reviews WHERE client_id = $1 AND gig_id = $2`,
      [req.user.id, req.params.gigId]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ reviewed: false });
    }

    const r = result.rows[0];
    return res.status(200).json({
      reviewed: true,
      review: { id: r.id, rating: Number(r.rating), comment: r.comment, createdAt: r.created_at },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
