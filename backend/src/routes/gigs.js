const express = require("express");
const jwt = require("jsonwebtoken");

const { pool, query } = require("../db/pool");
const { jwtSecret } = require("../config/env");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// ── helpers ──

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_COVER_LETTER_LENGTH = 4000;
const MAX_TOKEN_REWARD = 100000;

async function notify(userId, type, message, gigId, dbQuery = query) {
  await dbQuery(
    `INSERT INTO notifications (user_id, type, message, gig_id) VALUES ($1, $2, $3, $4)`,
    [userId, type, message, gigId]
  );
}

async function findGig(id) {
  const r = await query(`SELECT * FROM gigs WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return next();
  const token = h.slice(7).trim();
  if (!token) return next();
  try {
    const p = jwt.verify(token, jwtSecret);
    req.user = { id: p.sub, email: p.email, role: p.role };
  } catch { /* ignore */ }
  return next();
}

function mapGig(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tokenReward: row.token_reward,
    status: row.status,
    clientId: row.client_id,
    clientName: row.client_name || null,
    clientAvatar: row.client_avatar || null,
    freelancerId: row.freelancer_id || null,
    freelancerName: row.freelancer_name || null,
    freelancerAvatar: row.freelancer_avatar || null,
    proposalCount: Number(row.proposal_count || 0),
    pendingProposalCount: Number(row.pending_proposal_count ?? row.proposal_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProposal(row) {
  return {
    id: row.id,
    gigId: row.gig_id,
    freelancerId: row.freelancer_id,
    coverLetter: row.cover_letter,
    status: row.status,
    createdAt: row.created_at,
    freelancerName: row.freelancer_name || null,
    freelancerAvatar: row.freelancer_avatar || null,
    freelancerHeadline: row.freelancer_headline || null,
    freelancerRating: Number(row.freelancer_rating || 0),
    freelancerJobs: Number(row.freelancer_jobs || 0),
    freelancerRate: row.freelancer_rate ? Number(row.freelancer_rate) : null,
  };
}

function requestError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function isUuid(value) {
  return UUID_REGEX.test(value);
}

function normalizeRequiredText(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    throw requestError(400, `${fieldName} is required.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw requestError(400, `${fieldName} is required.`);
  }
  if (trimmed.length > maxLength) {
    throw requestError(400, `${fieldName} must be under ${maxLength} characters.`);
  }
  return trimmed;
}

function parseTokenReward(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw requestError(400, "Token reward must be a whole number.");
  }
  if (parsed <= 0) {
    throw requestError(400, "Token reward must be a positive number.");
  }
  if (parsed > MAX_TOKEN_REWARD) {
    throw requestError(400, `Token reward must be ${MAX_TOKEN_REWARD} or less.`);
  }
  return parsed;
}

async function ensureTokenAccountTx(db, userId) {
  await db.query(
    `INSERT INTO token_accounts (user_id, balance) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

router.param("id", (req, res, next, id) => {
  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid gig id." });
  }
  return next();
});

router.param("proposalId", (req, res, next, id) => {
  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid proposal id." });
  }
  return next();
});

// ── routes ──

// Browse open gigs (public)
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "";

    const where = ["g.status = 'open'"];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      const i = `$${params.length}`;
      where.push(`(g.title ILIKE ${i} OR g.description ILIKE ${i} OR u.full_name ILIKE ${i})`);
    }

    const wc = `WHERE ${where.join(" AND ")}`;

    const sortMap = {
      reward_high: "g.token_reward DESC",
      reward_low: "g.token_reward ASC",
      oldest: "g.created_at ASC",
    };
    const orderBy = sortMap[sort] || "g.created_at DESC";

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM gigs g INNER JOIN users u ON u.id = g.client_id ${wc}`,
      params
    );

    const result = await query(
      `
        SELECT
          g.*, u.full_name AS client_name,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id) AS proposal_count,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id AND gp.status = 'pending') AS pending_proposal_count
        FROM gigs g
        INNER JOIN users u ON u.id = g.client_id
        ${wc}
        ORDER BY ${orderBy}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    return res.status(200).json({
      data: result.rows.map(mapGig),
      total: countResult.rows[0]?.total || 0,
      page,
      limit,
    });
  } catch (error) {
    return next(error);
  }
});

// Client's own gigs
router.get("/mine", auth, requireRole("client"), async (req, res, next) => {
  try {
    const result = await query(
      `
        SELECT
          g.*, u.full_name AS client_name,
          fu.full_name AS freelancer_name,
          fp.avatar_url AS freelancer_avatar,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id) AS proposal_count,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id AND gp.status = 'pending') AS pending_proposal_count
        FROM gigs g
        INNER JOIN users u ON u.id = g.client_id
        LEFT JOIN users fu ON fu.id = g.freelancer_id
        LEFT JOIN freelancer_profiles fp ON fp.user_id = g.freelancer_id
        WHERE g.client_id = $1
        ORDER BY
          CASE g.status
            WHEN 'pending_completion' THEN 0
            WHEN 'in_progress' THEN 1
            WHEN 'open' THEN 2
            WHEN 'closed' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          g.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({ data: result.rows.map(mapGig) });
  } catch (error) {
    return next(error);
  }
});

// Freelancer's proposals
router.get("/my-proposals", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const result = await query(
      `
        SELECT
          gp.id AS proposal_id, gp.status AS proposal_status, gp.cover_letter, gp.created_at AS proposal_created_at,
          g.id, g.title, g.description, g.token_reward, g.status, g.client_id, g.freelancer_id,
          g.created_at, g.updated_at,
          u.full_name AS client_name,
          (SELECT COUNT(*)::int FROM gig_proposals gp2 WHERE gp2.gig_id = g.id) AS proposal_count,
          (SELECT COUNT(*)::int FROM gig_proposals gp2 WHERE gp2.gig_id = g.id AND gp2.status = 'pending') AS pending_proposal_count
        FROM gig_proposals gp
        INNER JOIN gigs g ON g.id = gp.gig_id
        INNER JOIN users u ON u.id = g.client_id
        WHERE gp.freelancer_id = $1
        ORDER BY gp.created_at DESC
      `,
      [req.user.id]
    );

    const data = result.rows.map((row) => ({
      ...mapGig(row),
      proposal: {
        id: row.proposal_id,
        status: row.proposal_status,
        coverLetter: row.cover_letter,
        createdAt: row.proposal_created_at,
      },
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
});

// Single gig detail (public, optional auth for proposal check)
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const result = await query(
      `
        SELECT
          g.*, u.full_name AS client_name,
          fu.full_name AS freelancer_name,
          fp.avatar_url AS freelancer_avatar,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id) AS proposal_count,
          (SELECT COUNT(*)::int FROM gig_proposals gp WHERE gp.gig_id = g.id AND gp.status = 'pending') AS pending_proposal_count
        FROM gigs g
        INNER JOIN users u ON u.id = g.client_id
        LEFT JOIN users fu ON fu.id = g.freelancer_id
        LEFT JOIN freelancer_profiles fp ON fp.user_id = g.freelancer_id
        WHERE g.id = $1
        LIMIT 1
      `,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Gig not found." });
    }

    const gig = mapGig(result.rows[0]);

    // If authenticated freelancer, include their proposal status
    if (req.user && req.user.role === "freelancer") {
      const prop = await query(
        `SELECT id, status, cover_letter, created_at FROM gig_proposals WHERE gig_id = $1 AND freelancer_id = $2`,
        [req.params.id, req.user.id]
      );
      if (prop.rows[0]) {
        gig.myProposal = {
          id: prop.rows[0].id,
          status: prop.rows[0].status,
          coverLetter: prop.rows[0].cover_letter,
          createdAt: prop.rows[0].created_at,
        };
      }
    }

    return res.status(200).json(gig);
  } catch (error) {
    return next(error);
  }
});

// Create gig
router.post("/", auth, requireRole("client"), async (req, res, next) => {
  const client = await pool.connect();

  try {
    const title = normalizeRequiredText(req.body.title, "Title", MAX_TITLE_LENGTH);
    const description = normalizeRequiredText(req.body.description, "Description", MAX_DESCRIPTION_LENGTH);
    const tokenReward = parseTokenReward(req.body.tokenReward);

    await client.query("BEGIN");

    await ensureTokenAccountTx(client, req.user.id);

    const debit = await client.query(
      `UPDATE token_accounts SET balance = balance - $1
       WHERE user_id = $2 AND balance >= $1
       RETURNING balance`,
      [tokenReward, req.user.id]
    );

    if (debit.rowCount === 0) {
      throw requestError(400, "Insufficient token balance to post this gig.");
    }

    const result = await client.query(
      `INSERT INTO gigs (client_id, title, description, token_reward)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, title, description, tokenReward]
    );

    const row = result.rows[0];

    await client.query(
      `INSERT INTO token_escrows (gig_id, client_id, freelancer_id, amount, status)
       VALUES ($1, $2, $3, $4, 'held')`,
      [row.id, req.user.id, null, tokenReward]
    );

    await client.query(
      `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
       VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
      [req.user.id, row.id, tokenReward, "Gig hold"]
    );

    const userResult = await client.query(`SELECT full_name FROM users WHERE id = $1`, [req.user.id]);
    row.client_name = userResult.rows[0]?.full_name || null;
    row.proposal_count = 0;
    row.pending_proposal_count = 0;

    await client.query("COMMIT");
    return res.status(201).json(mapGig(row));
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

// Edit gig (client, only if open)
router.put("/:id", auth, requireRole("client"), async (req, res, next) => {
  const client = await pool.connect();

  try {
    const title = normalizeRequiredText(req.body.title, "Title", MAX_TITLE_LENGTH);
    const description = normalizeRequiredText(req.body.description, "Description", MAX_DESCRIPTION_LENGTH);
    const tokenReward = parseTokenReward(req.body.tokenReward);

    await client.query("BEGIN");

    const gigResult = await client.query(`SELECT * FROM gigs WHERE id = $1 FOR UPDATE`, [req.params.id]);
    const gig = gigResult.rows[0];
    if (!gig) throw requestError(404, "Gig not found.");
    if (gig.client_id !== req.user.id) throw requestError(403, "Not your gig.");
    if (gig.status !== "open") throw requestError(400, "Can only edit open gigs.");

    await ensureTokenAccountTx(client, req.user.id);

    const escrowResult = await client.query(
      `SELECT * FROM token_escrows WHERE gig_id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const escrow = escrowResult.rows[0] || null;

    if (!escrow) {
      const debit = await client.query(
        `UPDATE token_accounts SET balance = balance - $1
         WHERE user_id = $2 AND balance >= $1
         RETURNING balance`,
        [tokenReward, req.user.id]
      );

      if (debit.rowCount === 0) {
        throw requestError(400, "Insufficient token balance to update this gig.");
      }

      await client.query(
        `INSERT INTO token_escrows (gig_id, client_id, freelancer_id, amount, status)
         VALUES ($1, $2, $3, $4, 'held')`,
        [req.params.id, req.user.id, null, tokenReward]
      );

      await client.query(
        `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
         VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
        [req.user.id, req.params.id, tokenReward, "Gig hold (legacy)" ]
      );
    } else {
      if (escrow.status !== "held") {
        throw requestError(400, "Cannot edit gig after escrow is released or refunded.");
      }

      const currentAmount = Number(escrow.amount);
      const delta = tokenReward - currentAmount;

      if (delta > 0) {
        const debit = await client.query(
          `UPDATE token_accounts SET balance = balance - $1
           WHERE user_id = $2 AND balance >= $1
           RETURNING balance`,
          [delta, req.user.id]
        );

        if (debit.rowCount === 0) {
          throw requestError(400, "Insufficient token balance to increase reward.");
        }

        await client.query(
          `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
           VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
          [req.user.id, req.params.id, delta, "Gig hold adjustment"]
        );
      } else if (delta < 0) {
        const refund = Math.abs(delta);
        await client.query(
          `UPDATE token_accounts SET balance = balance + $1 WHERE user_id = $2`,
          [refund, req.user.id]
        );

        await client.query(
          `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
           VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
          [req.user.id, req.params.id, refund, "Gig hold refund"]
        );
      }

      if (delta !== 0) {
        await client.query(
          `UPDATE token_escrows SET amount = $1 WHERE gig_id = $2`,
          [tokenReward, req.params.id]
        );
      }
    }

    const result = await client.query(
      `UPDATE gigs SET title = $1, description = $2, token_reward = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, description, tokenReward, req.params.id]
    );

    const row = result.rows[0];
    row.client_name = null;
    row.proposal_count = 0;

    await client.query("COMMIT");
    return res.status(200).json(mapGig(row));
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

// Cancel gig (client, only if open)
router.delete("/:id", auth, requireRole("client"), async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const gigResult = await client.query(`SELECT * FROM gigs WHERE id = $1 FOR UPDATE`, [req.params.id]);
    const gig = gigResult.rows[0];
    if (!gig) throw requestError(404, "Gig not found.");
    if (gig.client_id !== req.user.id) throw requestError(403, "Not your gig.");
    if (gig.status !== "open") throw requestError(400, "Can only cancel open gigs.");

    const escrowResult = await client.query(
      `SELECT * FROM token_escrows WHERE gig_id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const escrow = escrowResult.rows[0] || null;

    if (escrow) {
      if (escrow.status !== "held") {
        throw requestError(400, "Escrow is already released or refunded.");
      }

      const refundAmount = Number(escrow.amount);
      await ensureTokenAccountTx(client, req.user.id);
      await client.query(
        `UPDATE token_accounts SET balance = balance + $1 WHERE user_id = $2`,
        [refundAmount, req.user.id]
      );
      await client.query(
        `UPDATE token_escrows SET status = 'refunded', refunded_at = NOW() WHERE gig_id = $1`,
        [req.params.id]
      );
      await client.query(
        `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
         VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
        [req.user.id, req.params.id, refundAmount, "Gig refund"]
      );
    }

    await client.query(`UPDATE gigs SET status = 'cancelled' WHERE id = $1`, [req.params.id]);

    const proposals = await client.query(
      `SELECT freelancer_id FROM gig_proposals WHERE gig_id = $1 AND status = 'pending'`,
      [req.params.id]
    );

    const dbQuery = client.query.bind(client);
    for (const row of proposals.rows) {
      await notify(row.freelancer_id, "gig_cancelled", `The gig "${gig.title}" has been cancelled.`, gig.id, dbQuery);
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Gig cancelled." });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

// ── proposals ──

// Submit proposal (freelancer)
router.post("/:id/proposals", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const gig = await findGig(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });
    if (gig.status !== "open") return res.status(400).json({ error: "This gig is no longer accepting proposals." });

    const existing = await query(
      `SELECT id FROM gig_proposals WHERE gig_id = $1 AND freelancer_id = $2`,
      [req.params.id, req.user.id]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "You already submitted a proposal for this gig." });
    }

    let coverLetter = req.body.coverLetter;
    try {
      coverLetter = normalizeRequiredText(coverLetter, "A proposal message", MAX_COVER_LETTER_LENGTH);
    } catch (validationError) {
      return next(validationError);
    }

    const result = await query(
      `INSERT INTO gig_proposals (gig_id, freelancer_id, cover_letter)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.user.id, coverLetter]
    );

    // Notify client
    const nameResult = await query(`SELECT full_name FROM users WHERE id = $1`, [req.user.id]);
    const name = nameResult.rows[0]?.full_name || "A freelancer";
    await notify(gig.client_id, "new_proposal", `${name} submitted a proposal for "${gig.title}"`, gig.id);

    return res.status(201).json({
      id: result.rows[0].id,
      gigId: result.rows[0].gig_id,
      status: result.rows[0].status,
      coverLetter: result.rows[0].cover_letter,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    return next(error);
  }
});

// View proposals for a gig (client)
router.get("/:id/proposals", auth, requireRole("client"), async (req, res, next) => {
  try {
    const gig = await findGig(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });
    if (gig.client_id !== req.user.id) return res.status(403).json({ error: "Not your gig." });

    const result = await query(
      `
        SELECT
          gp.*, u.full_name AS freelancer_name,
          fp.avatar_url AS freelancer_avatar,
          fp.headline AS freelancer_headline,
          fp.average_rating AS freelancer_rating,
          fp.total_jobs_completed AS freelancer_jobs,
          fp.hourly_rate AS freelancer_rate
        FROM gig_proposals gp
        INNER JOIN users u ON u.id = gp.freelancer_id
        LEFT JOIN freelancer_profiles fp ON fp.user_id = gp.freelancer_id
        WHERE gp.gig_id = $1
        ORDER BY gp.created_at ASC
      `,
      [req.params.id]
    );

    return res.status(200).json({ data: result.rows.map(mapProposal) });
  } catch (error) {
    return next(error);
  }
});

// Accept proposal
router.patch("/:id/proposals/:proposalId/accept", auth, requireRole("client"), async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const gigResult = await client.query(`SELECT * FROM gigs WHERE id = $1 FOR UPDATE`, [req.params.id]);
    const gig = gigResult.rows[0];
    if (!gig) throw requestError(404, "Gig not found.");
    if (gig.client_id !== req.user.id) throw requestError(403, "Not your gig.");
    if (gig.status !== "open") throw requestError(400, "Gig is no longer open.");

    const propResult = await client.query(
      `SELECT * FROM gig_proposals WHERE id = $1 AND gig_id = $2 FOR UPDATE`,
      [req.params.proposalId, req.params.id]
    );
    const prop = propResult.rows[0];
    if (!prop) throw requestError(404, "Proposal not found.");
    if (prop.status !== "pending") throw requestError(400, "Proposal already processed.");

    const freelancerId = prop.freelancer_id;
    const dbQuery = client.query.bind(client);

    await ensureTokenAccountTx(client, gig.client_id);
    await ensureTokenAccountTx(client, freelancerId);

    const escrowResult = await client.query(
      `SELECT * FROM token_escrows WHERE gig_id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const escrow = escrowResult.rows[0] || null;

    if (!escrow) {
      const debit = await client.query(
        `UPDATE token_accounts SET balance = balance - $1
         WHERE user_id = $2 AND balance >= $1
         RETURNING balance`,
        [gig.token_reward, gig.client_id]
      );
      if (debit.rowCount === 0) {
        throw requestError(400, "Insufficient token balance to start this gig.");
      }

      await client.query(
        `INSERT INTO token_escrows (gig_id, client_id, freelancer_id, amount, status)
         VALUES ($1, $2, $3, $4, 'held')`,
        [req.params.id, gig.client_id, freelancerId, gig.token_reward]
      );

      await client.query(
        `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
         VALUES ('manual_adjustment', $1, NULL, $2, $3, $4)`,
        [gig.client_id, gig.id, gig.token_reward, "Gig hold (legacy)"]
      );
    } else {
      if (escrow.status !== "held") {
        throw requestError(400, "Escrow is not in a hold state.");
      }
      if (Number(escrow.amount) !== Number(gig.token_reward)) {
        throw requestError(400, "Escrow amount mismatch. Please edit the gig to refresh the hold.");
      }
      if (escrow.freelancer_id && escrow.freelancer_id !== freelancerId) {
        throw requestError(400, "Tokens are already held for a different freelancer.");
      }

      await client.query(
        `UPDATE token_escrows SET freelancer_id = $1 WHERE gig_id = $2`,
        [freelancerId, req.params.id]
      );
    }

    // Accept this, reject others, update gig — all in sequence
    await client.query(`UPDATE gig_proposals SET status = 'accepted' WHERE id = $1`, [req.params.proposalId]);
    await client.query(
      `UPDATE gig_proposals SET status = 'rejected' WHERE gig_id = $1 AND id != $2 AND status = 'pending'`,
      [req.params.id, req.params.proposalId]
    );
    await client.query(
      `UPDATE gigs SET status = 'in_progress', freelancer_id = $1 WHERE id = $2`,
      [freelancerId, req.params.id]
    );

    // Notify accepted
    await notify(
      freelancerId,
      "proposal_accepted",
      `Your proposal was accepted for "${gig.title}". Start working!`,
      gig.id,
      dbQuery
    );

    // Notify rejected
    const rejected = await client.query(
      `SELECT freelancer_id FROM gig_proposals WHERE gig_id = $1 AND id != $2 AND status = 'rejected'`,
      [req.params.id, req.params.proposalId]
    );
    for (const row of rejected.rows) {
      await notify(
        row.freelancer_id,
        "proposal_rejected",
        `Your proposal was not selected for "${gig.title}".`,
        gig.id,
        dbQuery
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Proposal accepted." });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

// Reject proposal
router.patch("/:id/proposals/:proposalId/reject", auth, requireRole("client"), async (req, res, next) => {
  try {
    const gig = await findGig(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });
    if (gig.client_id !== req.user.id) return res.status(403).json({ error: "Not your gig." });

    const prop = await query(
      `SELECT * FROM gig_proposals WHERE id = $1 AND gig_id = $2`,
      [req.params.proposalId, req.params.id]
    );
    if (!prop.rows[0]) return res.status(404).json({ error: "Proposal not found." });
    if (prop.rows[0].status !== "pending") return res.status(400).json({ error: "Proposal already processed." });

    await query(`UPDATE gig_proposals SET status = 'rejected' WHERE id = $1`, [req.params.proposalId]);

    await notify(
      prop.rows[0].freelancer_id,
      "proposal_rejected",
      `Your proposal was not selected for "${gig.title}".`,
      gig.id
    );

    return res.status(200).json({ message: "Proposal rejected." });
  } catch (error) {
    return next(error);
  }
});

// ── status transitions ──

// Freelancer marks gig complete
router.post("/:id/complete", auth, requireRole("freelancer"), async (req, res, next) => {
  try {
    const gig = await findGig(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });
    if (gig.freelancer_id !== req.user.id) return res.status(403).json({ error: "You are not assigned to this gig." });
    if (gig.status !== "in_progress") return res.status(400).json({ error: "Gig is not in progress." });

    await query(`UPDATE gigs SET status = 'pending_completion' WHERE id = $1`, [req.params.id]);

    const nameResult = await query(`SELECT full_name FROM users WHERE id = $1`, [req.user.id]);
    const name = nameResult.rows[0]?.full_name || "Your freelancer";
    await notify(gig.client_id, "gig_completed", `${name} marked "${gig.title}" as completed. Please confirm delivery.`, gig.id);

    return res.status(200).json({ message: "Gig marked as completed. Waiting for client confirmation." });
  } catch (error) {
    return next(error);
  }
});

// Client confirms delivery
router.post("/:id/confirm", auth, requireRole("client"), async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const gigResult = await client.query(`SELECT * FROM gigs WHERE id = $1 FOR UPDATE`, [req.params.id]);
    const gig = gigResult.rows[0];
    if (!gig) throw requestError(404, "Gig not found.");
    if (gig.client_id !== req.user.id) throw requestError(403, "Not your gig.");
    if (gig.status !== "pending_completion") throw requestError(400, "Gig is not pending completion.");

    const escrowResult = await client.query(
      `SELECT * FROM token_escrows WHERE gig_id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const escrow = escrowResult.rows[0];
    if (!escrow) throw requestError(400, "No escrow found for this gig.");
    if (escrow.status !== "held") throw requestError(400, "Escrow is not in a releasable state.");
    if (!gig.freelancer_id) throw requestError(400, "Gig has no assigned freelancer.");
    if (escrow.freelancer_id && escrow.freelancer_id !== gig.freelancer_id) {
      throw requestError(400, "Escrow is assigned to a different freelancer.");
    }

    const payoutAmount = Number(escrow.amount);
    const dbQuery = client.query.bind(client);

    await ensureTokenAccountTx(client, gig.freelancer_id);

    await client.query(`UPDATE gigs SET status = 'closed' WHERE id = $1`, [req.params.id]);
    await client.query(
      `UPDATE token_escrows SET status = 'released', released_at = NOW() WHERE gig_id = $1`,
      [req.params.id]
    );
    await client.query(
      `UPDATE token_accounts SET balance = balance + $1 WHERE user_id = $2`,
      [payoutAmount, gig.freelancer_id]
    );
    await client.query(
      `INSERT INTO token_transactions (type, from_user_id, to_user_id, gig_id, amount, note)
       VALUES ('gig_payout', $1, $2, $3, $4, $5)`,
      [gig.client_id, gig.freelancer_id, gig.id, payoutAmount, "Gig payout"]
    );

    // Update freelancer stats
    await client.query(
      `UPDATE freelancer_profiles
       SET total_jobs_completed = total_jobs_completed + 1,
           total_earnings = total_earnings + $1
       WHERE user_id = $2`,
      [payoutAmount, gig.freelancer_id]
    );

    await notify(
      gig.freelancer_id,
      "gig_confirmed",
      `Client confirmed delivery for "${gig.title}". You earned ${payoutAmount} tokens!`,
      gig.id,
      dbQuery
    );

    await client.query("COMMIT");
    return res.status(200).json({ message: "Gig confirmed and closed." });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

module.exports = router;
