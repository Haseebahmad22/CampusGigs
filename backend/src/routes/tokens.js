const express = require("express");

const { query } = require("../db/pool");
const auth = require("../middleware/auth");

const router = express.Router();

async function ensureTokenAccount(userId) {
  await query(
    `INSERT INTO token_accounts (user_id, balance) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

router.get("/balance", auth, async (req, res, next) => {
  try {
    await ensureTokenAccount(req.user.id);
    const result = await query(`SELECT balance FROM token_accounts WHERE user_id = $1`, [req.user.id]);
    const balance = Number(result.rows[0]?.balance || 0);
    return res.status(200).json({ balance });
  } catch (error) {
    return next(error);
  }
});

router.get("/transactions", auth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await query(
      `
        SELECT
          tt.id,
          tt.type,
          tt.amount,
          tt.gig_id,
          tt.from_user_id,
          tt.to_user_id,
          tt.note,
          tt.created_at,
          fu.full_name AS from_name,
          tu.full_name AS to_name
        FROM token_transactions tt
        LEFT JOIN users fu ON fu.id = tt.from_user_id
        LEFT JOIN users tu ON tu.id = tt.to_user_id
        WHERE tt.from_user_id = $1 OR tt.to_user_id = $1
        ORDER BY tt.created_at DESC
        LIMIT $2
      `,
      [req.user.id, limit]
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      gigId: row.gig_id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      fromName: row.from_name || null,
      toName: row.to_name || null,
      direction: row.to_user_id === req.user.id ? "in" : "out",
      note: row.note || null,
      createdAt: row.created_at,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
